import request from 'supertest'
import app from '../src/server/app'
import { describe, it, expect } from 'vitest'

describe('PING', () => {
  it('returns ok:true', async () => {
    const r = await request(app).get('/api/ping')
    expect(r.status).toBe(200)
    expect(r.body).toEqual({ ok: true })
  })
})
