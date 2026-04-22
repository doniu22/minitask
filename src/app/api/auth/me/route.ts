import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { getSessionOptions, type SessionData } from '@/lib/session'
import { unauthorized } from '@/lib/errors'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const tempResponse = new NextResponse()
  const session = await getIronSession<SessionData>(request, tempResponse, getSessionOptions())

  if (!session.userId) return unauthorized()

  return NextResponse.json({
    id: session.userId,
    email: session.email,
    name: session.name,
    role: session.role,
  })
}
