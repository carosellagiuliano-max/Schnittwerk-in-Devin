import { Router } from 'express'
import { db } from '../lib/db'
import { tenantId } from '../lib/guards'
const r = Router()

r.get('/api/staff', async (req,res)=>{
  const list = await db.staff.findMany({
    where:{ tenantId: tenantId(req), active:true },
    orderBy:{ name:'asc' }
  })
  res.json(list)
})

// Verfügbare Slots berechnen
r.get('/api/availability', async (req,res)=>{
  const { serviceId, staffId, date } = req.query
  if (!serviceId || !date) return res.status(400).json({ error:'serviceId and date required' })
  
  const t = tenantId(req)
  
  // Service laden
  const service = await db.service.findUnique({ 
    where: { id: String(serviceId) },
    select: { durationMin: true, tenantId: true, active: true }
  })
  if (!service || service.tenantId !== t || !service.active) {
    return res.status(404).json({ error: 'Service not found' })
  }
  
  const targetDate = new Date(String(date))
  const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
  const weekday = (targetDate.getDay() + 6) % 7 // 0=Mon, 1=Tue, ... 6=Sun
  
  // Staff-Filter
  const staffFilter: any = { tenantId: t, active: true }
  if (staffId) staffFilter.id = String(staffId)
  
  const staffList = await db.staff.findMany({
    where: staffFilter,
    include: {
      schedules: {
        where: { weekday }
      },
      timeOffs: {
        where: {
          AND: [
            { dateFrom: { lte: targetDate } },
            { dateTo: { gte: targetDate } }
          ]
        }
      }
    }
  })
  
  // Existierende Bookings für den Tag
  const existingBookings = await db.booking.findMany({
    where: {
      tenantId: t,
      status: 'CONFIRMED',
      startAt: { gte: dayStart, lt: dayEnd }
    }
  })
  
  const slots: Array<{ staffId: string, start: string }> = []
  
  for (const staff of staffList) {
    // Prüfe ob Staff TimeOff hat
    if (staff.timeOffs.length > 0) continue // Staff nicht verfügbar
    
    // Schedule für den Wochentag
    for (const schedule of staff.schedules) {
      const workStart = new Date(dayStart.getTime() + schedule.startMin * 60000)
      const workEnd = new Date(dayStart.getTime() + schedule.endMin * 60000)
      
      // Existierende Bookings für diesen Staff
      const staffBookings = existingBookings.filter(b => b.staffId === staff.id)
      
      // Slots generieren
      let current = new Date(workStart)
      while (current.getTime() + service.durationMin * 60000 <= workEnd.getTime()) {
        const slotEnd = new Date(current.getTime() + service.durationMin * 60000)
        
        // Prüfen ob Slot von Bookings überlappt
        const isBlocked = staffBookings.some(booking => 
          current < booking.endAt && slotEnd > booking.startAt
        )
        
        if (!isBlocked) {
          slots.push({
            staffId: staff.id,
            start: current.toISOString()
          })
        }
        
        // Nächster Slot (15min-Raster)
        current = new Date(current.getTime() + 15 * 60000)
      }
    }
  }
  
  res.json(slots)
})

export default r
