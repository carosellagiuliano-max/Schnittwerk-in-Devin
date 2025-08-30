import { Router } from 'express'
import { db } from '../lib/db'
import { tenantId, requireRole } from '../lib/guards'
const r = Router()

r.get('/api/admin/staff', requireRole(['owner','admin']), async (req,res)=>{
  const list = await db.staff.findMany({
    where: { tenantId: tenantId(req) },
    orderBy: { name: 'asc' },
    include: { serviceLinks: true }
  })
  res.json(list)
})

r.post('/api/admin/staff', requireRole(['owner','admin']), async (req,res)=>{
  const { name, imageUrl, services } = req.body || {}
  if (!name) return res.status(422).json({ error:'Name required' })
  const t = tenantId(req)
  const s = await db.staff.create({ data: { tenantId: t, name, imageUrl: imageUrl ?? null }})
  if (Array.isArray(services) && services.length) {
    await db.staffService.createMany({ data: services.map((svcId:string)=>({ staffId:s.id, serviceId:svcId, tenantId:t })) })
  }
  res.status(201).json(s)
})

r.put('/api/admin/staff/:id', requireRole(['owner','admin']), async (req,res)=>{
  const { id } = req.params
  const t = tenantId(req)
  const curr = await db.staff.findUnique({ where:{ id }})
  if (!curr || curr.tenantId !== t) return res.status(404).json({ error:'Not found' })
  const { name, active, imageUrl, services } = req.body || {}
  const upd = await db.staff.update({ where:{ id }, data:{ name, active, imageUrl } })
  if (Array.isArray(services)) {
    await db.staffService.deleteMany({ where:{ staffId:id }})
    if (services.length) {
      await db.staffService.createMany({ data: services.map((svcId:string)=>({ staffId:id, serviceId:svcId, tenantId:t })) })
    }
  }
  res.json(upd)
})

r.delete('/api/admin/staff/:id', requireRole(['owner','admin']), async (req,res)=>{
  const { id } = req.params
  const t = tenantId(req)
  const s = await db.staff.findUnique({ where:{ id }})
  if (!s || s.tenantId !== t) return res.status(404).json({ error:'Not found' })
  const used = await db.booking.findFirst({ where: { staffId:id, status:'CONFIRMED' }})
  if (used) return res.status(400).json({ error:'Staff in use' })
  await db.staff.delete({ where:{ id }})
  res.status(204).send()
})

export default r
