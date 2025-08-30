import { Router } from 'express'
import { db } from '../lib/db'
import { tenantId, requireRole } from '../lib/guards'
const r = Router()

r.get('/api/admin/tenant/settings', requireRole(['owner','admin']), async (req,res)=>{
  const t = tenantId(req)
  const tenant = await db.tenant.findUnique({ where:{ id:t } })
  if (!tenant) return res.status(404).json({ error:'Tenant not found' })
  res.json({ name:tenant.name, domain:tenant.domain, plan:tenant.plan, theme:tenant.theme })
})

r.put('/api/admin/tenant/settings', requireRole(['owner','admin']), async (req,res)=>{
  const { name, theme } = req.body || {}
  const t = tenantId(req)
  const upd = await db.tenant.update({ where:{ id:t }, data:{ name, theme } })
  res.json(upd)
})

export default r
