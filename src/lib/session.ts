import { getIronSession, IronSession } from 'iron-session'
import { cookies } from 'next/headers'

export type SessionData = {
  userId: string
  role: 'ADMIN' | 'MEMBER'
  email: string
  name: string
}

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'minitask_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  },
}

export function validateSessionSecret(): void {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters')
  }
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}
