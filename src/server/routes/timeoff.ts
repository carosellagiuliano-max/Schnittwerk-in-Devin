import { Router } from 'express'
import { db } from '../lib/db'
import { tenantId, requireRole } from '../lib/guards'
const r = Router()

r.get('/api/admin/staff/:staffId/timeoff', requireRole(['owner','admin']), async (req,res)=>{
  const { staffId } = req.params
  const list = await db.timeOff.findMany({ where:{ tenantId: tenantId(req), staffId } })
  res.json(list)
})

r.post('/api/admin/staff/:staffId/timeoff', requireRole(['owner','admin']), async (req,res)=>{
  const { staffId } = req.params
  const { dateFrom, dateTo, reason } = req.body || {}
  if (!dateFrom || !dateTo) return res.status(422).json({ error:'dateFrom and dateTo required' })
  const from = new Date(dateFrom), to = new Date(dateTo)
  if (from > to) return res.status(422).json({ error:'dateFrom must be <= dateTo' })
  const created = await db.timeOff.create({ data:{ tenantId: tenantId(req), staffId, dateFrom:from, dateTo:to, reason:reason||'' } })
  res.status(201).json(created)
})

r.put('/api/admin/staff/:staffId/timeoff/:id', requireRole(['owner','admin']), async (req,res)=>{
  const { staffId, id } = req.params
  const { dateFrom, dateTo, reason } = req.body || {}
  const t = tenantId(req)
  const cur = await db.timeOff.findUnique({ where:{ id }})
  if (!cur || cur.tenantId !== t || cur.staffId !== staffId) return res.status(404).json({ error:'Not found' })
  const upd = await db.timeOff.update({ where:{ id }, data:{ dateFrom:new Date(dateFrom), dateTo:new Date(dateTo), reason } })
  res.json(upd)
})

r.delete('/api/admin/staff/:staffId/timeoff/:id', requireRole(['owner','admin']), async (req,res)=>{
  const { staffId, id } = req.params
  const t = tenantId(req)
  const cur = await db.timeOff.findUnique({ where:{ id }})
  if (!cur || cur.tenantId !== t || cur.staffId !== staffId) return res.status(404).json({ error:'Not found' })
  await db.timeOff.delete({ where:{ id }})
  res.status(204).send()
})

export default r
