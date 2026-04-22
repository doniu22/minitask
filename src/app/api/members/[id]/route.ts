import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAdminAuth } from '@/lib/auth'
import { notFound } from '@/lib/errors'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  return withAdminAuth(request, async () => {
    const { id } = await params

    const member = await prisma.user.findUnique({ where: { id } })
    if (!member) return notFound('Member')

    await prisma.$transaction([
      prisma.task.updateMany({ where: { assigneeId: id }, data: { assigneeId: null } }),
      prisma.user.delete({ where: { id } }),
    ])

    return new NextResponse(null, { status: 204 })
  })
}
