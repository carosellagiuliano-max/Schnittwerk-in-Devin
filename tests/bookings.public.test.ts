import request from 'supertest'
import app from '../src/server/app'
import { PrismaClient } from '@prisma/client'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

const db = new PrismaClient()

describe('Bookings Public API', () => {
  const H = { 'x-user-role': 'customer', 'x-user-email': 'customer@dev.local' }
  let serviceId: string
  let staffId: string
  let futureStart: string

  beforeAll(async () => {
    // Setup: Service mit 30min Dauer
    const service = await db.service.create({
      data: {
        tenantId: 't_dev',
        name: `TestService_${Date.now()}`,
        durationMin: 30,
        priceCents: 4000,
        active: true
      }
    })
    serviceId = service.id

    // Setup: Staff mit Schedule für heute
    const staff = await db.staff.create({
      data: {
        tenantId: 't_dev',
        name: `TestStaff_${Date.now()}`,
        active: true
      }
    })
    staffId = staff.id

    // Schedule: 09:00-12:00 (540-720 Minuten)
    await db.schedule.create({
      data: {
        tenantId: 't_dev',
        staffId,
        weekday: 1, // Montag
        startMin: 540, // 09:00
        endMin: 720   // 12:00
      }
    })

    // Future start time (>24h) 
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 2)
    tomorrow.setHours(9, 0, 0, 0)
    futureStart = tomorrow.toISOString()
  })

  afterAll(async () => {
    await db.$disconnect()
  })

  it('creates booking successfully (happy path)', async () => {
    const uniqueEmail = `customer_${Date.now()}@test.dev`
    
    const create = await request(app)
      .post('/api/bookings')
      .send({
        serviceId,
        staffId,
        start: futureStart,
        customerEmail: uniqueEmail
      })

    expect(create.status).toBe(201)
    expect(create.body.serviceId).toBe(serviceId)
    expect(create.body.staffId).toBe(staffId)
    expect(create.body.customerEmail).toBe(uniqueEmail)
    expect(create.body.status).toBe('CONFIRMED')
  })

  it('prevents overlap bookings', async () => {
    const uniqueEmail1 = `customer1_${Date.now()}@test.dev`
    const uniqueEmail2 = `customer2_${Date.now()}@test.dev`
    
    // Erste Buchung
    await request(app)
      .post('/api/bookings')
      .send({
        serviceId,
        staffId,
        start: futureStart,
        customerEmail: uniqueEmail1
      })

    // Zweite Buchung zur gleichen Zeit
    const overlap = await request(app)
      .post('/api/bookings')
      .send({
        serviceId,
        staffId,
        start: futureStart,
        customerEmail: uniqueEmail2
      })

    expect(overlap.status).toBe(409)
    expect(overlap.body.error).toBe('Overlap')
  })

  it('blocks banned customers', async () => {
    const bannedEmail = `banned_${Date.now()}@test.dev`
    
    // Ban setzen
    await db.customerBan.create({
      data: {
        tenantId: 't_dev',
        email: bannedEmail,
        reason: 'Test ban'
      }
    })

    const banned = await request(app)
      .post('/api/bookings')
      .send({
        serviceId,
        staffId,
        start: futureStart,
        customerEmail: bannedEmail
      })

    expect(banned.status).toBe(403)
    expect(banned.body.error).toBe('Banned')
  })

  it('returns customer bookings via /api/bookings/me', async () => {
    const customerEmail = 'customer@dev.local'
    const futureBookingStart = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48h in Zukunft
    
    // Buchung erstellen (in der Zukunft)
    await request(app)
      .post('/api/bookings')
      .send({
        serviceId,
        staffId,
        start: futureBookingStart,
        customerEmail
      })

    const list = await request(app)
      .get('/api/bookings/me')
      .set(H)

    expect(list.status).toBe(200)
    expect(Array.isArray(list.body)).toBe(true)
    expect(list.body.some((b: any) => b.customerEmail === customerEmail)).toBe(true)
  })
})
