import { Router } from 'express'
import { db } from '../lib/db'
import { tenantId, requireRole } from '../lib/guards'
const r = Router()

// Public: eigene Buchung anlegen (Kunde)
r.post('/api/bookings', async (req,res)=>{
  const { serviceId, staffId, start, customerEmail } = req.body || {}
  if (!serviceId || !staffId || !start || !customerEmail) return res.status(422).json({ error:'Missing fields' })
  const t = tenantId(req)
  // Ban?
  const ban = await db.customerBan.findFirst({ where:{ tenantId:t, email:customerEmail } })
  if (ban) return res.status(403).json({ error:'Banned' })
  const svc = await db.service.findUnique({ where:{ id: serviceId } })
  if (!svc || svc.tenantId !== t || !svc.active) return res.status(404).json({ error:'Service not found' })
  const startDate = new Date(start)
  const endDate = new Date(startDate.getTime() + svc.durationMin*60000)
  // Overlap? Korrekte Logik: (startA < endB) && (endA > startB)
  const overlap = await db.booking.findFirst({
    where:{ 
      tenantId:t, 
      staffId, 
      status:'CONFIRMED', 
      AND: [
        { startAt: { lt: endDate } },
        { endAt: { gt: startDate } }
      ]
    }
  })
  if (overlap) return res.status(409).json({ error:'Overlap' })
  const created = await db.booking.create({
    data:{ tenantId:t, serviceId, staffId, startAt:startDate, endAt:endDate, customerEmail, status:'CONFIRMED', createdBy: customerEmail }
  })
  res.status(201).json(created)
})

// Public: eigene Buchungen (nur zukünftige)
r.get('/api/bookings/me', async (req,res)=>{
  const userEmail = req.headers['x-user-email'] as string
  const userRole = req.headers['x-user-role'] as string
  if (!userEmail || userRole !== 'customer') return res.status(401).json({ error:'Not logged in' })
  const list = await db.booking.findMany({
    where:{ 
      tenantId: tenantId(req), 
      customerEmail: userEmail, 
      status:'CONFIRMED',
      startAt: { gte: new Date() } // nur zukünftige Termine
    },
    orderBy:{ startAt:'asc' }
  })
  res.json(list)
})

// Public: Storno (nur >24h)
r.delete('/api/bookings/:id', async (req,res)=>{
  const { id } = req.params
  const t = tenantId(req)
  const b = await db.booking.findUnique({ where:{ id } })
  if (!b || b.tenantId !== t) return res.status(404).json({ error:'Not found' })
  const userEmail = req.headers['x-user-email'] as string
  const userRole = req.headers['x-user-role'] as string
  const asCustomer = userRole === 'customer'
  if (asCustomer) {
    if (userEmail !== b.customerEmail) return res.status(403).json({ error:'Forbidden' })
    const diffH = (b.startAt.getTime() - Date.now()) / 36e5
    if (diffH < 24) return res.status(400).json({ error:'Too late to cancel (<24h)' })
  }
  await db.booking.update({ where:{ id }, data:{ status:'CANCELLED', cancelledBy: userEmail ?? 'system' } })
  // TODO: Warteliste prüfen, ggf. Mail
  res.status(204).send()
})

// Admin: Listen/erstellen/löschen
r.get('/api/admin/bookings', requireRole(['owner','admin']), async (req,res)=>{
  const { from, to, staffId, status } = req.query
  const t = tenantId(req)
  const where:any = { tenantId:t }
  if (from || to) {
    where.startAt = {}
    if (from) where.startAt.gte = new Date(String(from))
    if (to)   where.startAt.lte = new Date(String(to))
  }
  if (staffId) where.staffId = String(staffId)
  if (status)  where.status = String(status)
  const list = await db.booking.findMany({ where, orderBy:{ startAt:'asc' } })
  res.json(list)
})

r.post('/api/admin/bookings', requireRole(['owner','admin']), async (req,res)=>{
  const { serviceId, staffId, start, customerEmail } = req.body || {}
  if (!serviceId || !staffId || !start || !customerEmail) return res.status(422).json({ error:'Missing fields' })
  const t = tenantId(req)
  const svc = await db.service.findUnique({ where:{ id: serviceId } })
  if (!svc || svc.tenantId !== t) return res.status(404).json({ error:'Service not found' })
  const startDate = new Date(start)
  const endDate = new Date(startDate.getTime() + svc.durationMin*60000)
  // Overlap? Korrekte Logik: (startA < endB) && (endA > startB)
  const overlap = await db.booking.findFirst({
    where:{ 
      tenantId:t, 
      staffId, 
      status:'CONFIRMED', 
      AND: [
        { startAt: { lt: endDate } },
        { endAt: { gt: startDate } }
      ]
    }
  })
  if (overlap) return res.status(409).json({ error:'Overlap' })
  const created = await db.booking.create({
    data:{ tenantId:t, serviceId, staffId, startAt:startDate, endAt:endDate, customerEmail, status:'CONFIRMED', createdBy: req.headers['x-user-email'] as string ?? null }
  })
  res.status(201).json(created)
})

r.delete('/api/admin/bookings/:id', requireRole(['owner','admin']), async (req,res)=>{
  const { id } = req.params
  const t = tenantId(req)
  const b = await db.booking.findUnique({ where:{ id } })
  if (!b || b.tenantId !== t) return res.status(404).json({ error:'Not found' })
  await db.booking.update({ where:{ id }, data:{ status:'CANCELLED', cancelledBy: req.headers['x-user-email'] as string ?? 'admin' } })
  // TODO: Warteliste benachrichtigen
  res.status(204).send()
})

export default r
