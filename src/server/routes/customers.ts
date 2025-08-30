import { Router } from 'express'
import { db } from '../lib/db'
import { tenantId, requireRole } from '../lib/guards'
const r = Router()

r.get('/api/admin/customers', requireRole(['owner','admin']), async (req,res)=>{
  const q = String(req.query.q ?? '')
  const t = tenantId(req)
  const list = await db.profile.findMany({
    where:{
      tenantId:t, role:'customer',
      OR:[
        { fullName: { contains:q } },
        { email:    { contains:q } },
        { phone:    { contains:q } },
      ]
    },
    orderBy:{ createdAt:'desc' }
  })
  res.json(list)
})

r.post('/api/admin/customers/ban', requireRole(['owner','admin']), async (req,res)=>{
  const { email, reason } = req.body || {}
  if (!email) return res.status(422).json({ error:'Email required' })
  const t = tenantId(req)
  try {
    const created = await db.customerBan.create({ data:{ tenantId:t, email, reason:reason||'' } })
    res.status(201).json(created)
  } catch {
    res.status(409).json({ error:'Already banned' })
  }
})

r.delete('/api/admin/customers/ban/:email', requireRole(['owner','admin']), async (req,res)=>{
  const email = req.params.email
  const t = tenantId(req)
  try {
    await db.customerBan.delete({ where:{ tenantId_email:{ tenantId:t, email } } })
    res.status(204).send()
  } catch {
    res.status(404).json({ error:'Ban not found' })
  }
})

export default r
