import request from 'supertest'
import app from '../app'
import { describe, it, expect } from 'vitest'

describe('API Ping', () => {
  it('returns ok:true', async () => {
    const res = await request(app).get('/api/ping')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true })
  })
})
