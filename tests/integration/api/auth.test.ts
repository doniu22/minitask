import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { POST as login } from '@/app/api/auth/login/route'
import { POST as logout } from '@/app/api/auth/logout/route'
import { GET as me } from '@/app/api/auth/me/route'
import { getTestPrisma, cleanDatabase } from '../../helpers/db'
import { Role } from '@prisma/client'

const TEST_EMAIL = 'testadmin@example.com'
const TEST_PASSWORD = 'testpassword123'

beforeAll(async () => {
  process.env.SESSION_SECRET = 'test-secret-for-auth-tests-min-32-chars'
  process.env.DATABASE_URL =
    process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/minitask_dev'

  await cleanDatabase()
  const prisma = getTestPrisma()
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12)
  await prisma.user.create({
    data: { email: TEST_EMAIL, name: 'Test Admin', passwordHash, role: Role.ADMIN },
  })
})

afterAll(async () => {
  await cleanDatabase()
})

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/auth/login', () => {
  // AC: validates body, looks up user by email, verifies bcrypt, sets session
  it('should return 200 and user data on valid credentials', async () => {
    const req = makeRequest({ email: TEST_EMAIL, password: TEST_PASSWORD })
    const res = await login(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toMatchObject({ email: TEST_EMAIL, role: 'ADMIN' })
    expect(data).not.toHaveProperty('passwordHash')
    expect(data).not.toHaveProperty('password')
  })

  // AC: returns 401 on bad credentials
  it('should return 401 on wrong password', async () => {
    const req = makeRequest({ email: TEST_EMAIL, password: 'wrongpassword' })
    const res = await login(req)
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.code).toBe('UNAUTHORIZED')
  })

  // AC: returns 401 on unknown email
  it('should return 401 on unknown email', async () => {
    const req = makeRequest({ email: 'nobody@example.com', password: TEST_PASSWORD })
    const res = await login(req)
    expect(res.status).toBe(401)
  })

  // AC: returns 422 on invalid body
  it('should return 422 on invalid body', async () => {
    const req = makeRequest({ email: 'not-an-email', password: '' })
    const res = await login(req)
    expect(res.status).toBe(422)
    const data = await res.json()
    expect(data.code).toBe('VALIDATION_ERROR')
  })

  it('should return 422 when body is missing fields', async () => {
    const req = makeRequest({})
    const res = await login(req)
    expect(res.status).toBe(422)
  })
})

describe('POST /api/auth/logout', () => {
  // AC: destroys session, returns 204
  it('should return 204', async () => {
    const req = new NextRequest('http://localhost/api/auth/logout', { method: 'POST' })
    const res = await logout(req)
    expect(res.status).toBe(204)
  })
})

describe('GET /api/auth/me', () => {
  // AC: returns 401 when not authenticated
  it('should return 401 when unauthenticated', async () => {
    const req = new NextRequest('http://localhost/api/auth/me')
    const res = await me(req)
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.code).toBe('UNAUTHORIZED')
  })
})
