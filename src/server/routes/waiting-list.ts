import { Router } from 'express'
import { db } from '../lib/db'
import { tenantId, requireRole } from '../lib/guards'
import { sendMail, emailTemplates } from '../lib/mail'
const r = Router()

r.post('/api/waiting-list', async (req,res)=>{
  const { serviceId, staffId, customerEmail, preferredDate } = req.body || {}
  if (!serviceId || !customerEmail) return res.status(422).json({ error:'Service and email required' })
  const t = tenantId(req)
  
  const existing = await db.waitingList.findFirst({
    where: { tenantId: t, serviceId, customerEmail }
  })
  if (existing) return res.status(409).json({ error:'Already on waiting list' })
  
  const waitingListEntry = await db.waitingList.create({
    data: {
      tenantId: t,
      serviceId,
      staffId: staffId || undefined,
      customerEmail,
      preferredDate: preferredDate ? new Date(preferredDate) : undefined
    }
  })
  
  res.status(201).json(waitingListEntry)
})

r.get('/api/admin/waiting-list', requireRole(['owner','admin']), async (req,res)=>{
  const t = tenantId(req)
  const list = await db.waitingList.findMany({
    where: { tenantId: t },
    include: {
      service: true
    },
    orderBy: { createdAt: 'asc' }
  })
  res.json(list)
})

r.post('/api/admin/waiting-list/notify', requireRole(['owner','admin']), async (req,res)=>{
  const { serviceId, staffId, availableDate, availableTime } = req.body || {}
  if (!serviceId || !availableDate || !availableTime) {
    return res.status(422).json({ error:'Missing required fields' })
  }
  const t = tenantId(req)
  
  const waitingListEntries = await db.waitingList.findMany({
    where: { 
      tenantId: t, 
      serviceId
    },
    include: {
      service: true
    },
    orderBy: { createdAt: 'asc' }
  })
  
  const notificationPromises = waitingListEntries.map(async (entry) => {
    const template = emailTemplates.earlierAppointmentAvailable(
      entry.customerEmail,
      entry.service.name,
      availableDate,
      availableTime
    )
    
    try {
      await sendMail({
        to: entry.customerEmail,
        subject: template.subject,
        html: template.html,
        text: template.text
      })
    } catch (error) {
      console.error('Failed to send notification:', error)
    }
  })
  
  await Promise.all(notificationPromises)
  
  res.json({ notified: waitingListEntries.length })
})

r.delete('/api/admin/waiting-list/:id', requireRole(['owner','admin']), async (req,res)=>{
  const { id } = req.params
  const t = tenantId(req)
  
  const entry = await db.waitingList.findUnique({ where: { id } })
  if (!entry || entry.tenantId !== t) return res.status(404).json({ error:'Not found' })
  
  await db.waitingList.delete({ where: { id } })
  res.status(204).send()
})

export default r
