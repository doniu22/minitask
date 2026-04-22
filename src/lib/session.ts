import { getIronSession, IronSession, SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'

export type SessionData = {
  userId: string
  role: 'ADMIN' | 'MEMBER'
  email: string
  name: string
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? 'placeholder-replaced-at-runtime-32chars',
  cookieName: 'minitask_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  },
}

export function getSessionOptions(): SessionOptions {
  return {
    ...sessionOptions,
    password: process.env.SESSION_SECRET!,
  }
}

export function validateSessionSecret(): void {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters')
  }
}

/** For Server Components only (requires Next.js request context) */
export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, getSessionOptions())
}
