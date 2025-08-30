import { Router } from 'express'
import { db } from '../lib/db'
import { tenantId, requireRole } from '../lib/guards'
const r = Router()

// Public: aktive Services
r.get('/api/services', async (req, res) => {
  const list = await db.service.findMany({
    where: { tenantId: tenantId(req), active: true },
    orderBy: { name: 'asc' }
  })
  res.json(list)
})

// Admin: Liste
r.get('/api/admin/services', requireRole(['owner','admin']), async (req, res) => {
  const list = await db.service.findMany({
    where: { tenantId: tenantId(req) },
    orderBy: { name: 'asc' }
  })
  res.json(list)
})

// Admin: Create
r.post('/api/admin/services', requireRole(['owner','admin']), async (req, res) => {
  const { name, durationMin, priceCents, category, active } = req.body || {}
  if (!name || durationMin==null || priceCents==null) return res.status(422).json({ error:'Validation' })
  if (+durationMin < 10 || +priceCents < 0) return res.status(422).json({ error:'Validation' })
  const t = tenantId(req)
  const dup = await db.service.findFirst({ where: { tenantId: t, name } })
  if (dup) return res.status(409).json({ error:'Duplicate name' })
  const created = await db.service.create({
    data: { tenantId: t, name, durationMin:+durationMin, priceCents:+priceCents, category: category ?? null, active: active ?? true }
  })
  res.status(201).json(created)
})

// Admin: Update
r.put('/api/admin/services/:id', requireRole(['owner','admin']), async (req, res) => {
  const { id } = req.params
  const svc = await db.service.findUnique({ where: { id }})
  if (!svc || svc.tenantId !== tenantId(req)) return res.status(404).json({ error:'Not found' })
  const { name, durationMin, priceCents, category, active } = req.body || {}
  if (!name || durationMin==null || priceCents==null) return res.status(422).json({ error:'Validation' })
  if (+durationMin < 10 || +priceCents < 0) return res.status(422).json({ error:'Validation' })
  if (name !== svc.name) {
    const dup = await db.service.findFirst({ where: { tenantId: svc.tenantId, name } })
    if (dup) return res.status(409).json({ error:'Duplicate name' })
  }
  const updated = await db.service.update({
    where: { id },
    data: { name, durationMin:+durationMin, priceCents:+priceCents, category: category ?? svc.category, active: typeof active==='boolean'?active:svc.active }
  })
  res.json(updated)
})

// Admin: Delete (blockieren falls in Benutzung)
r.delete('/api/admin/services/:id', requireRole(['owner','admin']), async (req, res) => {
  const { id } = req.params
  const svc = await db.service.findUnique({ where: { id }})
  if (!svc || svc.tenantId !== tenantId(req)) return res.status(404).json({ error:'Not found' })
  const used = await db.booking.findFirst({ where: { serviceId: id, status:'CONFIRMED' } })
  if (used) return res.status(400).json({ error:'Service in use' })
  await db.service.delete({ where: { id }})
  res.status(204).send()
})

export default r
