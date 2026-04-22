import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { getSessionOptions, type SessionData } from '@/lib/session'
import { unauthorized, forbidden } from '@/lib/errors'

type RouteHandler = (request: NextRequest, session: SessionData) => Promise<NextResponse>
type AdminRouteHandler = (request: NextRequest, session: SessionData) => Promise<NextResponse>

export async function withAuth(request: NextRequest, handler: RouteHandler): Promise<NextResponse> {
  const tempResponse = new NextResponse()
  const session = await getIronSession<SessionData>(request, tempResponse, getSessionOptions())

  if (!session.userId) return unauthorized()

  return handler(request, session as SessionData)
}

export async function withAdminAuth(
  request: NextRequest,
  handler: AdminRouteHandler
): Promise<NextResponse> {
  const tempResponse = new NextResponse()
  const session = await getIronSession<SessionData>(request, tempResponse, getSessionOptions())

  if (!session.userId) return unauthorized()
  if (session.role !== 'ADMIN') return forbidden()

  return handler(request, session as SessionData)
}
