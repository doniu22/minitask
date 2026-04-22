import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getSessionOptions, type SessionData } from '@/lib/session'
import { LoginSchema } from '@/lib/schemas/auth'
import { unauthorized, validationError } from '@/lib/errors'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json().catch(() => null)

  const parsed = LoginSchema.safeParse(body)
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message ?? 'Invalid request body')
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.passwordHash) return unauthorized()

  const passwordMatch = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatch) return unauthorized()

  const responseBody = { id: user.id, email: user.email, name: user.name, role: user.role }
  const response = NextResponse.json(responseBody)
  const session = await getIronSession<SessionData>(request, response, getSessionOptions())
  session.userId = user.id
  session.role = user.role
  session.email = user.email
  session.name = user.name
  await session.save()

  return response
}
