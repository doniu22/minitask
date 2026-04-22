import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, withAdminAuth } from '@/lib/auth'
import { CreateMemberSchema } from '@/lib/schemas/member'
import { conflict, validationError } from '@/lib/errors'
import { Role } from '@prisma/client'

export async function GET(request: NextRequest): Promise<NextResponse> {
  return withAuth(request, async () => {
    const members = await prisma.user.findMany({
      where: { role: Role.MEMBER },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(members)
  })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return withAdminAuth(request, async () => {
    const body = await request.json().catch(() => null)

    const parsed = CreateMemberSchema.safeParse(body)
    if (!parsed.success) {
      return validationError(parsed.error.issues[0]?.message ?? 'Invalid request body')
    }

    const { name, email } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return conflict('Email already exists')

    const member = await prisma.user.create({
      data: { name, email, role: Role.MEMBER },
      select: { id: true, name: true, email: true },
    })

    return NextResponse.json(member, { status: 201 })
  })
}
