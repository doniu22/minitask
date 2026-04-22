import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { Role } from '@prisma/client'
import { PATCH as moveTaskRoute } from '@/app/api/tasks/[id]/move/route'
import { getTestPrisma, cleanDatabase } from '../../helpers/db'
import { makeAuthRequest } from '../../helpers/session'

const SESSION = {
  userId: 'move-test-admin',
  role: 'ADMIN' as const,
  email: 'move-admin@test.com',
  name: 'Move Admin',
}

beforeAll(async () => {
  process.env.SESSION_SECRET = 'test-secret-for-move-tests-min-32-chars-ok!'
  process.env.DATABASE_URL ??= 'postgresql://postgres:postgres@localhost:5432/minitask_dev'
  await cleanDatabase()
  const prisma = getTestPrisma()
  await prisma.user.create({
    data: { id: SESSION.userId, email: SESSION.email, name: SESSION.name, role: Role.ADMIN },
  })
})

afterEach(async () => {
  const prisma = getTestPrisma()
  await prisma.task.deleteMany()
})

function makeReq(taskId: string, body: unknown) {
  return makeAuthRequest(`http://localhost/api/tasks/${taskId}/move`, SESSION, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

describe('PATCH /api/tasks/{id}/move', () => {
  // AC: move to same column
  it('should move within the same column', async () => {
    const prisma = getTestPrisma()
    const task = await prisma.task.create({ data: { title: 'Task', status: 'TODO', order: 0 } })
    const req = await makeReq(task.id, { status: 'TODO', order: 0 })
    const res = await moveTaskRoute(req, { params: Promise.resolve({ id: task.id }) })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.status).toBe('TODO')
    expect(data.order).toBe(0)
  })

  // AC: move to different column
  it('should move to a different column', async () => {
    const prisma = getTestPrisma()
    const task = await prisma.task.create({ data: { title: 'Task', status: 'TODO', order: 0 } })
    const req = await makeReq(task.id, { status: 'IN_PROGRESS', order: 0 })
    const res = await moveTaskRoute(req, { params: Promise.resolve({ id: task.id }) })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.status).toBe('IN_PROGRESS')
  })

  // AC: 404 if task not found
  it('should return 404 if task not found', async () => {
    const req = await makeReq('nonexistent-id', { status: 'TODO', order: 0 })
    const res = await moveTaskRoute(req, { params: Promise.resolve({ id: 'nonexistent-id' }) })
    expect(res.status).toBe(404)
  })

  // AC: 422 on invalid status
  it('should return 422 on invalid status', async () => {
    const prisma = getTestPrisma()
    const task = await prisma.task.create({ data: { title: 'Task', status: 'TODO', order: 0 } })
    const req = await makeReq(task.id, { status: 'INVALID', order: 0 })
    const res = await moveTaskRoute(req, { params: Promise.resolve({ id: task.id }) })
    expect(res.status).toBe(422)
    const data = await res.json()
    expect(data.code).toBe('VALIDATION_ERROR')
  })
})
