import { Router } from 'express'
import { db } from '../lib/db'
import { tenantId, requireRole } from '../lib/guards'
const r = Router()

r.get('/api/admin/recurring-bookings', requireRole(['owner','admin']), async (req,res)=>{
  const t = tenantId(req)
  const list = await db.recurringBooking.findMany({
    where: { tenantId: t },
    include: { 
      service: true,
      staff: true,
      bookings: {
        where: { status: 'CONFIRMED' },
        orderBy: { startAt: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  res.json(list)
})

r.post('/api/admin/recurring-bookings', requireRole(['owner','admin']), async (req,res)=>{
  const { serviceId, staffId, customerEmail, frequency, dayOfWeek, timeSlot, startDate, endDate } = req.body || {}
  if (!serviceId || !staffId || !customerEmail || !frequency || !timeSlot || !startDate) {
    return res.status(422).json({ error:'Missing required fields' })
  }
  const t = tenantId(req)
  
  const svc = await db.service.findUnique({ where: { id: serviceId } })
  if (!svc || svc.tenantId !== t) return res.status(404).json({ error:'Service not found' })
  
  const recurringBooking = await db.recurringBooking.create({
    data: {
      tenantId: t,
      serviceId,
      staffId,
      customerEmail,
      frequency,
      dayOfWeek,
      timeSlot,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null
    }
  })
  
  await generateRecurringBookings(recurringBooking.id, t)
  
  res.status(201).json(recurringBooking)
})

r.put('/api/admin/recurring-bookings/:id', requireRole(['owner','admin']), async (req,res)=>{
  const { id } = req.params
  const { active, endDate } = req.body || {}
  const t = tenantId(req)
  
  const recurringBooking = await db.recurringBooking.findUnique({ where: { id } })
  if (!recurringBooking || recurringBooking.tenantId !== t) return res.status(404).json({ error:'Not found' })
  
  const updated = await db.recurringBooking.update({
    where: { id },
    data: { active, endDate: endDate ? new Date(endDate) : undefined }
  })
  
  if (active === false) {
    await db.booking.updateMany({
      where: { 
        recurringBookingId: id,
        startAt: { gte: new Date() },
        status: 'CONFIRMED'
      },
      data: { status: 'CANCELLED', cancelledBy: req.headers['x-user-email'] as string }
    })
  }
  
  res.json(updated)
})

r.delete('/api/admin/recurring-bookings/:id', requireRole(['owner','admin']), async (req,res)=>{
  const { id } = req.params
  const t = tenantId(req)
  const recurringBooking = await db.recurringBooking.findUnique({ where: { id } })
  if (!recurringBooking || recurringBooking.tenantId !== t) return res.status(404).json({ error:'Not found' })
  
  await db.booking.updateMany({
    where: { 
      recurringBookingId: id,
      startAt: { gte: new Date() },
      status: 'CONFIRMED'
    },
    data: { status: 'CANCELLED', cancelledBy: req.headers['x-user-email'] as string }
  })
  
  await db.recurringBooking.delete({ where: { id } })
  res.status(204).send()
})

async function generateRecurringBookings(recurringBookingId: string, tenantId: string) {
  const recurring = await db.recurringBooking.findUnique({
    where: { id: recurringBookingId },
    include: { service: true }
  })
  if (!recurring) return
  
  const now = new Date()
  const endDate = recurring.endDate || new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
  let currentDate = new Date(recurring.startDate)
  
  while (currentDate <= endDate) {
    if (currentDate >= now) {
      const [hours, minutes] = recurring.timeSlot.split(':').map(Number)
      const startAt = new Date(currentDate)
      startAt.setHours(hours, minutes, 0, 0)
      
      const endAt = new Date(startAt.getTime() + recurring.service.durationMin * 60000)
      
      const conflict = await db.booking.findFirst({
        where: {
          tenantId,
          staffId: recurring.staffId,
          status: 'CONFIRMED',
          AND: [
            { startAt: { lt: endAt } },
            { endAt: { gt: startAt } }
          ]
        }
      })
      
      if (!conflict) {
        await db.booking.create({
          data: {
            tenantId,
            serviceId: recurring.serviceId,
            staffId: recurring.staffId,
            customerEmail: recurring.customerEmail,
            startAt,
            endAt,
            status: 'CONFIRMED',
            recurringBookingId: recurring.id,
            createdBy: 'system'
          }
        })
      }
    }
    
    if (recurring.frequency === 'weekly') {
      currentDate.setDate(currentDate.getDate() + 7)
    } else if (recurring.frequency === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + 1)
    } else {
      break
    }
  }
}

export default r
