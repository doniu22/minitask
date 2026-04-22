import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { getSessionOptions, type SessionData } from '@/lib/session'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const response = new NextResponse(null, { status: 204 })
  const session = await getIronSession<SessionData>(request, response, getSessionOptions())
  session.destroy()
  return response
}
