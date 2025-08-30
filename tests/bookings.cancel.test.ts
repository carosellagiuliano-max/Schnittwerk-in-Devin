import request from 'supertest'
import app from '../src/server/app'
import { PrismaClient } from '@prisma/client'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

const db = new PrismaClient()

describe('Bookings Cancel API', () => {
  const customerHeaders = { 'x-user-role': 'customer', 'x-user-email': 'customer@dev.local' }
  const adminHeaders = { 'x-user-role': 'admin', 'x-user-email': 'admin@dev.local' }
  
  let serviceId: string
  let staffId: string
  let bookingFuture: string // >24h
  let bookingNear: string   // <24h

  beforeAll(async () => {
    // Setup: Service
    const service = await db.service.create({
      data: {
        tenantId: 't_dev',
        name: `CancelTestService_${Date.now()}`,
        durationMin: 30,
        priceCents: 4000,
        active: true
      }
    })
    serviceId = service.id

    // Setup: Staff
    const staff = await db.staff.create({
      data: {
        tenantId: 't_dev',
        name: `CancelTestStaff_${Date.now()}`,
        active: true
      }
    })
    staffId = staff.id

    // Booking 1: >24h in der Zukunft
    const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48h
    const booking1 = await db.booking.create({
      data: {
        tenantId: 't_dev',
        serviceId,
        staffId,
        customerEmail: 'customer@dev.local',
        startAt: futureDate,
        endAt: new Date(futureDate.getTime() + 30 * 60000),
        status: 'CONFIRMED',
        createdBy: 'customer@dev.local'
      }
    })
    bookingFuture = booking1.id

    // Booking 2: <24h in der Zukunft
    const nearDate = new Date(Date.now() + 12 * 60 * 60 * 1000) // 12h
    const booking2 = await db.booking.create({
      data: {
        tenantId: 't_dev',
        serviceId,
        staffId,
        customerEmail: 'customer@dev.local',
        startAt: nearDate,
        endAt: new Date(nearDate.getTime() + 30 * 60000),
        status: 'CONFIRMED',
        createdBy: 'customer@dev.local'
      }
    })
    bookingNear = booking2.id
  })

  afterAll(async () => {
    await db.$disconnect()
  })

  it('allows customer cancel >24h', async () => {
    const response = await request(app)
      .delete(`/api/bookings/${bookingFuture}`)
      .set(customerHeaders)

    expect(response.status).toBe(204)
    
    // Prüfen dass Status auf CANCELLED gesetzt wurde
    const updated = await db.booking.findUnique({ where: { id: bookingFuture } })
    expect(updated?.status).toBe('CANCELLED')
    expect(updated?.cancelledBy).toBe('customer@dev.local')
  })

  it('blocks customer cancel <24h', async () => {
    const response = await request(app)
      .delete(`/api/bookings/${bookingNear}`)
      .set(customerHeaders)

    expect(response.status).toBe(400)
    expect(response.body.error).toMatch(/Too late/)
    
    // Status sollte CONFIRMED bleiben
    const unchanged = await db.booking.findUnique({ where: { id: bookingNear } })
    expect(unchanged?.status).toBe('CONFIRMED')
  })

  it('allows admin cancel anytime', async () => {
    const response = await request(app)
      .delete(`/api/bookings/${bookingNear}`)
      .set(adminHeaders)

    expect(response.status).toBe(204)
    
    // Status sollte CANCELLED sein
    const cancelled = await db.booking.findUnique({ where: { id: bookingNear } })
    expect(cancelled?.status).toBe('CANCELLED')
    expect(cancelled?.cancelledBy).toBe('admin@dev.local')
  })

  it('prevents customer from cancelling other customer booking', async () => {
    // Andere Buchung erstellen
    const otherBooking = await db.booking.create({
      data: {
        tenantId: 't_dev',
        serviceId,
        staffId,
        customerEmail: 'other@dev.local', // Andere Email
        startAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        endAt: new Date(Date.now() + 48 * 60 * 60 * 1000 + 30 * 60000),
        status: 'CONFIRMED',
        createdBy: 'other@dev.local'
      }
    })

    const response = await request(app)
      .delete(`/api/bookings/${otherBooking.id}`)
      .set(customerHeaders) // customer@dev.local versucht andere zu löschen

    expect(response.status).toBe(403)
    expect(response.body.error).toBe('Forbidden')
  })
})
