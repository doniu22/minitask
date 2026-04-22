import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { Role } from '@prisma/client'
import { GET, POST } from '@/app/api/members/route'
import { DELETE } from '@/app/api/members/[id]/route'
import { getTestPrisma, cleanDatabase } from '../../helpers/db'
import { makeAuthRequest } from '../../helpers/session'

const ADMIN_SESSION = {
  userId: 'admin-test-id',
  role: 'ADMIN' as const,
  email: 'admin@test.com',
  name: 'Admin',
}
const MEMBER_SESSION = {
  userId: 'member-test-id',
  role: 'MEMBER' as const,
  email: 'member@test.com',
  name: 'Member',
}

beforeAll(async () => {
  process.env.SESSION_SECRET = 'test-secret-for-members-tests-min-32chars'
  process.env.DATABASE_URL ??= 'postgresql://postgres:postgres@localhost:5432/minitask_dev'
  await cleanDatabase()
  const prisma = getTestPrisma()
  await prisma.user.createMany({
    data: [
      { id: ADMIN_SESSION.userId, email: ADMIN_SESSION.email, name: ADMIN_SESSION.name, role: Role.ADMIN },
      { id: MEMBER_SESSION.userId, email: MEMBER_SESSION.email, name: MEMBER_SESSION.name, role: Role.MEMBER },
    ],
  })
})

afterAll(async () => {
  await cleanDatabase()
})

describe('GET /api/members', () => {
  // AC: returns all members array; 401 if unauthenticated
  it('should return members array when authenticated', async () => {
    const req = await makeAuthRequest('http://localhost/api/members', ADMIN_SESSION)
    const res = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
    expect(data[0]).toMatchObject({ id: expect.any(String), name: expect.any(String), email: expect.any(String) })
    expect(data[0]).not.toHaveProperty('passwordHash')
  })

  it('should return 401 when unauthenticated', async () => {
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost/api/members')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })
})

describe('POST /api/members', () => {
  // AC: 403 if not ADMIN
  it('should return 403 when not admin', async () => {
    const req = await makeAuthRequest('http://localhost/api/members', MEMBER_SESSION, {
      method: 'POST',
      body: JSON.stringify({ name: 'New Member', email: 'new@test.com' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  // AC: creates member for admin
  it('should create member when admin', async () => {
    const req = await makeAuthRequest('http://localhost/api/members', ADMIN_SESSION, {
      method: 'POST',
      body: JSON.stringify({ name: 'Jane Doe', email: 'jane@test.com' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data).toMatchObject({ name: 'Jane Doe', email: 'jane@test.com' })
    expect(data).not.toHaveProperty('passwordHash')
  })

  // AC: 409 on duplicate email
  it('should return 409 on duplicate email', async () => {
    const req = await makeAuthRequest('http://localhost/api/members', ADMIN_SESSION, {
      method: 'POST',
      body: JSON.stringify({ name: 'Jane Again', email: 'jane@test.com' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(409)
    const data = await res.json()
    expect(data.code).toBe('CONFLICT')
  })

  // AC: 422 on invalid body
  it('should return 422 on invalid body', async () => {
    const req = await makeAuthRequest('http://localhost/api/members', ADMIN_SESSION, {
      method: 'POST',
      body: JSON.stringify({ name: '', email: 'not-email' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(422)
  })
})

describe('DELETE /api/members/{id}', () => {
  let memberId: string

  beforeAll(async () => {
    const prisma = getTestPrisma()
    const m = await prisma.user.create({
      data: { name: 'To Delete', email: 'delete-me@test.com', role: Role.MEMBER },
    })
    memberId = m.id
  })

  // AC: sets assigneeId=null on tasks, deletes member, returns 204
  it('should delete member and return 204', async () => {
    const req = await makeAuthRequest(
      `http://localhost/api/members/${memberId}`,
      ADMIN_SESSION,
      { method: 'DELETE' }
    )
    const res = await DELETE(req, { params: Promise.resolve({ id: memberId }) })
    expect(res.status).toBe(204)
  })

  // AC: 404 if not found
  it('should return 404 if member not found', async () => {
    const req = await makeAuthRequest(
      `http://localhost/api/members/nonexistent-id`,
      ADMIN_SESSION,
      { method: 'DELETE' }
    )
    const res = await DELETE(req, { params: Promise.resolve({ id: 'nonexistent-id' }) })
    expect(res.status).toBe(404)
  })

  // AC: 403 if not ADMIN
  it('should return 403 if not admin', async () => {
    const req = await makeAuthRequest(
      `http://localhost/api/members/${memberId}`,
      MEMBER_SESSION,
      { method: 'DELETE' }
    )
    const res = await DELETE(req, { params: Promise.resolve({ id: memberId }) })
    expect(res.status).toBe(403)
  })
})
