import express from 'express'
import cors from 'cors'

import servicesRouter from './routes/services'
import staffRouter from './routes/staff'
import scheduleRouter from './routes/schedule'
import timeoffRouter from './routes/timeoff'
import bookingsRouter from './routes/bookings'
import customersRouter from './routes/customers'
import settingsRouter from './routes/settings'
import publicRouter from './routes/public'
import groupBookingsRouter from './routes/group-bookings'
import recurringBookingsRouter from './routes/recurring-bookings'
import staffPortfolioRouter from './routes/staff-portfolio'
import waitingListRouter from './routes/waiting-list'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/uploads', express.static('uploads'))

// Tenant (DEV: fixer Tenant - für Dev immer t_dev setzen)
app.use((req, _res, next) => { 
  // In DEV-Mode immer t_dev setzen
  req.tenantId = 't_dev'
  next() 
})

// Dev-Auth via Header
app.use((req, _res, next) => {
  const role = req.header('x-user-role')
  const email = req.header('x-user-email')
  if (role && email) req.user = { role, email }
  next()
})

// Health (ohne DB-Abhängigkeiten für Tests)
app.get('/api/ping', (_req, res) => res.json({ ok: true }))

// Routers
app.use(servicesRouter)
app.use(staffRouter)
app.use(scheduleRouter)
app.use(timeoffRouter)
app.use(bookingsRouter)
app.use(customersRouter)
app.use(settingsRouter)
app.use(publicRouter)
app.use(groupBookingsRouter)
app.use(recurringBookingsRouter)
app.use(staffPortfolioRouter)
app.use(waitingListRouter)

export default app
