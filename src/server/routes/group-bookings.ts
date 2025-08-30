import { Router } from 'express'
import { db } from '../lib/db'
import { tenantId, requireRole } from '../lib/guards'
const r = Router()

r.get('/api/admin/group-bookings', requireRole(['owner','admin']), async (req,res)=>{
  const t = tenantId(req)
  const list = await db.groupBooking.findMany({
    where: { tenantId: t },
    include: { 
      bookings: {
        include: {
          service: true,
          staff: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  res.json(list)
})

r.post('/api/admin/group-bookings', requireRole(['owner','admin']), async (req,res)=>{
  const { name, description, maxSize, bookings } = req.body || {}
  if (!name || !maxSize) return res.status(422).json({ error:'Name and maxSize required' })
  const t = tenantId(req)
  
  const groupBooking = await db.groupBooking.create({
    data: { tenantId: t, name, description, maxSize }
  })
  
  if (Array.isArray(bookings) && bookings.length) {
    for (const booking of bookings) {
      const { serviceId, staffId, customerEmail, startAt } = booking
      if (!serviceId || !staffId || !customerEmail || !startAt) continue
      
      const svc = await db.service.findUnique({ where: { id: serviceId } })
      if (!svc || svc.tenantId !== t) continue
      
      const startDate = new Date(startAt)
      const endDate = new Date(startDate.getTime() + svc.durationMin * 60000)
      
      await db.booking.create({
        data: {
          tenantId: t,
          serviceId,
          staffId,
          customerEmail,
          startAt: startDate,
          endAt: endDate,
          status: 'CONFIRMED',
          groupBookingId: groupBooking.id,
          createdBy: req.headers['x-user-email'] as string
        }
      })
    }
  }
  
  res.status(201).json(groupBooking)
})

r.delete('/api/admin/group-bookings/:id', requireRole(['owner','admin']), async (req,res)=>{
  const { id } = req.params
  const t = tenantId(req)
  const groupBooking = await db.groupBooking.findUnique({ where: { id } })
  if (!groupBooking || groupBooking.tenantId !== t) return res.status(404).json({ error:'Not found' })
  
  await db.booking.updateMany({
    where: { groupBookingId: id },
    data: { status: 'CANCELLED', cancelledBy: req.headers['x-user-email'] as string }
  })
  
  await db.groupBooking.delete({ where: { id } })
  res.status(204).send()
})

export default r
