import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { Role } from '@prisma/client'
import { GET as listTasks, POST as createTask } from '@/app/api/tasks/route'
import {
  GET as getTask,
  PATCH as updateTask,
  DELETE as deleteTask,
} from '@/app/api/tasks/[id]/route'
import { getTestPrisma, cleanDatabase } from '../../helpers/db'
import { makeAuthRequest } from '../../helpers/session'

const SESSION = {
  userId: 'tasks-test-admin',
  role: 'ADMIN' as const,
  email: 'tasks-admin@test.com',
  name: 'Tasks Admin',
}

beforeAll(async () => {
  process.env.SESSION_SECRET = 'test-secret-for-tasks-tests-min-32-chars-ok'
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

function makeReq(url: string, body?: unknown, method = 'GET') {
  return makeAuthRequest(url, SESSION, {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

describe('GET /api/tasks', () => {
  // AC: returns all tasks ordered by status+order, includes nested assignee
  it('should return empty array when no tasks', async () => {
    const req = await makeReq('http://localhost/api/tasks')
    const res = await listTasks(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual([])
  })

  it('should return tasks with assignee object', async () => {
    const prisma = getTestPrisma()
    await prisma.task.create({ data: { title: 'Test Task', status: 'TODO', order: 0 } })
    const req = await makeReq('http://localhost/api/tasks')
    const res = await listTasks(req)
    const data = await res.json()
    expect(data[0]).toMatchObject({ title: 'Test Task', status: 'TODO' })
    expect(data[0]).toHaveProperty('assignee')
  })

  it('should return 401 when unauthenticated', async () => {
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost/api/tasks')
    const res = await listTasks(req)
    expect(res.status).toBe(401)
  })
})

describe('POST /api/tasks', () => {
  // AC: Zod-validates body, creates task in TODO, returns 201
  it('should create task and return 201', async () => {
    const req = await makeReq('http://localhost/api/tasks', { title: 'New Task' }, 'POST')
    const res = await createTask(req)
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data).toMatchObject({ title: 'New Task', status: 'TODO', order: 0 })
    expect(data.id).toBeDefined()
  })

  // AC: 422 on invalid body
  it('should return 422 when title is missing', async () => {
    const req = await makeReq('http://localhost/api/tasks', { description: 'No title' }, 'POST')
    const res = await createTask(req)
    expect(res.status).toBe(422)
    const data = await res.json()
    expect(data.code).toBe('VALIDATION_ERROR')
  })
})

describe('GET /api/tasks/{id}', () => {
  it('should return task with assignee', async () => {
    const prisma = getTestPrisma()
    const task = await prisma.task.create({ data: { title: 'Get Me', status: 'TODO', order: 0 } })
    const req = await makeReq(`http://localhost/api/tasks/${task.id}`)
    const res = await getTask(req, { params: Promise.resolve({ id: task.id }) })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.title).toBe('Get Me')
    expect(data).toHaveProperty('assignee')
  })

  // AC: 404 if not found
  it('should return 404 for non-existent task', async () => {
    const req = await makeReq('http://localhost/api/tasks/nonexistent')
    const res = await getTask(req, { params: Promise.resolve({ id: 'nonexistent' }) })
    expect(res.status).toBe(404)
  })
})

describe('PATCH /api/tasks/{id}', () => {
  // AC: partial update; 422 on empty title
  it('should update task title', async () => {
    const prisma = getTestPrisma()
    const task = await prisma.task.create({ data: { title: 'Old Title', status: 'TODO', order: 0 } })
    const req = await makeReq(`http://localhost/api/tasks/${task.id}`, { title: 'New Title' }, 'PATCH')
    const res = await updateTask(req, { params: Promise.resolve({ id: task.id }) })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.title).toBe('New Title')
  })

  it('should return 422 when title is empty string', async () => {
    const prisma = getTestPrisma()
    const task = await prisma.task.create({ data: { title: 'Task', status: 'TODO', order: 0 } })
    const req = await makeReq(`http://localhost/api/tasks/${task.id}`, { title: '' }, 'PATCH')
    const res = await updateTask(req, { params: Promise.resolve({ id: task.id }) })
    expect(res.status).toBe(422)
  })

  it('should return 404 for non-existent task', async () => {
    const req = await makeReq('http://localhost/api/tasks/nope', { title: 'x' }, 'PATCH')
    const res = await updateTask(req, { params: Promise.resolve({ id: 'nope' }) })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/tasks/{id}', () => {
  // AC: returns 204; 404 if not found
  it('should delete task and return 204', async () => {
    const prisma = getTestPrisma()
    const task = await prisma.task.create({ data: { title: 'Delete Me', status: 'TODO', order: 0 } })
    const req = await makeReq(`http://localhost/api/tasks/${task.id}`, undefined, 'DELETE')
    const res = await deleteTask(req, { params: Promise.resolve({ id: task.id }) })
    expect(res.status).toBe(204)
  })

  it('should return 404 for non-existent task', async () => {
    const req = await makeReq('http://localhost/api/tasks/nope', undefined, 'DELETE')
    const res = await deleteTask(req, { params: Promise.resolve({ id: 'nope' }) })
    expect(res.status).toBe(404)
  })
})
