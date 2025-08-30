import request from 'supertest'
import app from '../src/server/app'
import { PrismaClient } from '@prisma/client'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

const db = new PrismaClient()

describe('Bookings Admin API', () => {
  const adminHeaders = { 'x-user-role': 'admin', 'x-user-email': 'admin@dev.local' }
  let serviceId: string
  let staffId: string

  beforeAll(async () => {
    // Setup: Service
    const service = await db.service.create({
      data: {
        tenantId: 't_dev',
        name: `AdminTestService_${Date.now()}`,
        durationMin: 45,
        priceCents: 5000,
        active: true
      }
    })
    serviceId = service.id

    // Setup: Staff
    const staff = await db.staff.create({
      data: {
        tenantId: 't_dev',
        name: `AdminTestStaff_${Date.now()}`,
        active: true
      }
    })
    staffId = staff.id
  })

  afterAll(async () => {
    await db.$disconnect()
  })

  it('admin can create booking', async () => {
    const futureStart = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
    const uniqueEmail = `admin_customer_${Date.now()}@test.dev`

    const create = await request(app)
      .post('/api/admin/bookings')
      .set(adminHeaders)
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
    expect(create.body.createdBy).toBe('admin@dev.local')
  })

  it('admin can list bookings with filters', async () => {
    // Buchung für Filter-Test erstellen
    const testDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await db.booking.create({
      data: {
        tenantId: 't_dev',
        serviceId,
        staffId,
        customerEmail: `filter_test_${Date.now()}@test.dev`,
        startAt: testDate,
        endAt: new Date(testDate.getTime() + 45 * 60000),
        status: 'CONFIRMED',
        createdBy: 'admin@dev.local'
      }
    })

    // Ohne Filter
    const listAll = await request(app)
      .get('/api/admin/bookings')
      .set(adminHeaders)

    expect(listAll.status).toBe(200)
    expect(Array.isArray(listAll.body)).toBe(true)

    // Mit staffId Filter
    const listFiltered = await request(app)
      .get(`/api/admin/bookings?staffId=${staffId}`)
      .set(adminHeaders)

    expect(listFiltered.status).toBe(200)
    expect(listFiltered.body.every((b: any) => b.staffId === staffId)).toBe(true)

    // Mit Status Filter
    const listConfirmed = await request(app)
      .get('/api/admin/bookings?status=CONFIRMED')
      .set(adminHeaders)

    expect(listConfirmed.status).toBe(200)
    expect(listConfirmed.body.every((b: any) => b.status === 'CONFIRMED')).toBe(true)
  })

  it('admin can delete any booking', async () => {
    // Buchung erstellen
    const booking = await db.booking.create({
      data: {
        tenantId: 't_dev',
        serviceId,
        staffId,
        customerEmail: `admin_delete_${Date.now()}@test.dev`,
        startAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // <24h
        endAt: new Date(Date.now() + 12 * 60 * 60 * 1000 + 45 * 60000),
        status: 'CONFIRMED',
        createdBy: 'customer@dev.local'
      }
    })

    const response = await request(app)
      .delete(`/api/admin/bookings/${booking.id}`)
      .set(adminHeaders)

    expect(response.status).toBe(204)

    // Status sollte CANCELLED sein
    const cancelled = await db.booking.findUnique({ where: { id: booking.id } })
    expect(cancelled?.status).toBe('CANCELLED')
    expect(cancelled?.cancelledBy).toBe('admin@dev.local')
  })

  it('requires admin role for admin endpoints', async () => {
    const customerHeaders = { 'x-user-role': 'customer', 'x-user-email': 'customer@dev.local' }

    // POST /api/admin/bookings
    const createResponse = await request(app)
      .post('/api/admin/bookings')
      .set(customerHeaders)
      .send({
        serviceId,
        staffId,
        start: new Date().toISOString(),
        customerEmail: 'test@test.dev'
      })

    expect(createResponse.status).toBe(403)

    // GET /api/admin/bookings  
    const listResponse = await request(app)
      .get('/api/admin/bookings')
      .set(customerHeaders)

    expect(listResponse.status).toBe(403)

    // DELETE /api/admin/bookings/:id
    const deleteResponse = await request(app)
      .delete('/api/admin/bookings/fake-id')
      .set(customerHeaders)

    expect(deleteResponse.status).toBe(403)
  })
})
