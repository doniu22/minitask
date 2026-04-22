import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { validateSessionSecret } from '@/lib/session'

describe('validateSessionSecret', () => {
  const originalSecret = process.env.SESSION_SECRET

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.SESSION_SECRET
    } else {
      process.env.SESSION_SECRET = originalSecret
    }
  })

  // AC: SESSION_SECRET env var used (min 32 chars); validated at startup
  it('should throw when SESSION_SECRET is missing', () => {
    delete process.env.SESSION_SECRET
    expect(() => validateSessionSecret()).toThrow('SESSION_SECRET must be at least 32 characters')
  })

  it('should throw when SESSION_SECRET is shorter than 32 chars', () => {
    process.env.SESSION_SECRET = 'short-secret'
    expect(() => validateSessionSecret()).toThrow('SESSION_SECRET must be at least 32 characters')
  })

  it('should not throw when SESSION_SECRET is 32 chars or longer', () => {
    process.env.SESSION_SECRET = 'a'.repeat(32)
    expect(() => validateSessionSecret()).not.toThrow()
  })
})
