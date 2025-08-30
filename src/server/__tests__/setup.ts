import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

beforeAll(async () => {
  // Sicherstellen, dass der Dev-Tenant existiert
  await db.tenant.upsert({
    where: { id: 't_dev' },
    update: {},
    create: { id: 't_dev', name: 'Dev Salon', domain: 'localhost', plan: 'free' }
  })
})

afterAll(async () => {
  await db.$disconnect()
})
