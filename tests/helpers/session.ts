import { sealData } from 'iron-session'
import { NextRequest } from 'next/server'
import type { SessionData } from '@/lib/session'

export async function makeAuthRequest(
  url: string,
  session: Partial<SessionData>,
  options: { method?: string; body?: string } = {}
): Promise<NextRequest> {
  const sessionSecret = process.env.SESSION_SECRET!
  const sealed = await sealData(session, { password: sessionSecret })

  return new NextRequest(url, {
    method: options.method ?? 'GET',
    body: options.body,
    headers: {
      cookie: `minitask_session=${sealed}`,
      'content-type': 'application/json',
    },
  })
}
