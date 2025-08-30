import { Router } from 'express'
import { db } from '../lib/db'
import { tenantId, requireRole } from '../lib/guards'
const r = Router()

r.get('/api/admin/staff/:staffId/schedules', requireRole(['owner','admin']), async (req,res)=>{
  const { staffId } = req.params
  const t = tenantId(req)
  const list = await db.schedule.findMany({ where:{ tenantId:t, staffId }, orderBy:[{weekday:'asc'},{startMin:'asc'}] })
  res.json(list)
})

r.post('/api/admin/staff/:staffId/schedules', requireRole(['owner','admin']), async (req,res)=>{
  const { staffId } = req.params
  const { weekday, startMin, endMin } = req.body || {}
  if (weekday==null || startMin==null || endMin==null) return res.status(422).json({ error:'Validation' })
  if (+startMin >= +endMin) return res.status(422).json({ error:'startMin<endMin' })
  const t = tenantId(req)
  const overlap = await db.schedule.findFirst({
    where:{ tenantId:t, staffId, weekday:+weekday, OR:[{ AND:[{ startMin:{ lt:+endMin }},{ endMin:{ gt:+startMin }}]}] }
  })
  if (overlap) return res.status(409).json({ error:'Overlap' })
  const created = await db.schedule.create({ data:{ tenantId:t, staffId, weekday:+weekday, startMin:+startMin, endMin:+endMin }})
  res.status(201).json(created)
})

r.put('/api/admin/staff/:staffId/schedules/:id', requireRole(['owner','admin']), async (req,res)=>{
  const { staffId, id } = req.params
  const { weekday, startMin, endMin } = req.body || {}
  const t = tenantId(req)
  const cur = await db.schedule.findUnique({ where:{ id }})
  if (!cur || cur.tenantId !== t || cur.staffId !== staffId) return res.status(404).json({ error:'Not found' })
  if (weekday==null || startMin==null || endMin==null) return res.status(422).json({ error:'Validation' })
  if (+startMin >= +endMin) return res.status(422).json({ error:'startMin<endMin' })
  const upd = await db.schedule.update({ where:{ id }, data:{ weekday:+weekday, startMin:+startMin, endMin:+endMin }})
  res.json(upd)
})

r.delete('/api/admin/staff/:staffId/schedules/:id', requireRole(['owner','admin']), async (req,res)=>{
  const { staffId, id } = req.params
  const t = tenantId(req)
  const cur = await db.schedule.findUnique({ where:{ id }})
  if (!cur || cur.tenantId !== t || cur.staffId !== staffId) return res.status(404).json({ error:'Not found' })
  await db.schedule.delete({ where:{ id }})
  res.status(204).send()
})

export default r
