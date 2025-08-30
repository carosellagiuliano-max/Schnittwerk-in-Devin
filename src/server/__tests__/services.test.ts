import request from 'supertest'
import app from '../app'
import { PrismaClient } from '@prisma/client'
import { describe, it, expect, afterAll } from 'vitest'

const db = new PrismaClient()

describe('Services API', () => {
  const H = { 'x-user-role':'admin', 'x-user-email':'admin@dev.local' }

  afterAll(async () => {
    await db.$disconnect()
  })

  it('creates and lists services', async () => {
    const uniqueName = `Testcut_${Date.now()}`
    const create = await request(app).post('/api/admin/services').set(H).send({
      name: uniqueName, durationMin:30, priceCents:4000
    })
    expect(create.status).toBe(201)

    const list = await request(app).get('/api/admin/services').set(H)
    expect(list.status).toBe(200)
    expect(Array.isArray(list.body)).toBe(true)
    expect(list.body.find((s:any)=> s.name === uniqueName)).toBeTruthy()
  })
})
