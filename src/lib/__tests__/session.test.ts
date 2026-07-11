// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest'
import { SignJWT } from 'jose'
import { createSession, verifySession, type Session } from '../session'

const claims: Omit<Session, 'iat' | 'exp'> = {
  sub: 'user_123',
  email: 'analyst@nis.go.ke',
  name: 'Test Analyst',
  role: 'L3',
  clearanceLevel: 3,
  agency: 'NIS',
}

const SECRET = 'test-secret-that-is-at-least-32-characters-long'

beforeAll(() => {
  process.env.SESSION_SECRET = SECRET
})

describe('session', () => {
  it('mints a token that round-trips through verification', async () => {
    const token = await createSession(claims)
    const s = await verifySession(token)
    expect(s).not.toBeNull()
    expect(s!.sub).toBe('user_123')
    expect(s!.clearanceLevel).toBe(3)
    expect(s!.role).toBe('L3')
  })

  it('rejects a forged/tampered token', async () => {
    const token = await createSession(claims)
    const tampered = token.slice(0, -3) + 'aaa'
    expect(await verifySession(tampered)).toBeNull()
  })

  it('rejects a token signed with a foreign secret', async () => {
    const foreign = new TextEncoder().encode('a-totally-different-secret-key-thirty-two+')
    const foreignToken = await new SignJWT({ ...claims })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('8h')
      .sign(foreign)
    expect(await verifySession(foreignToken)).toBeNull()
  })

  it('rejects an already-expired token', async () => {
    const secret = new TextEncoder().encode(SECRET)
    const expired = await new SignJWT({ ...claims })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 3600)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60) // expired 1 min ago
      .sign(secret)
    expect(await verifySession(expired)).toBeNull()
  })

  it('returns null for absent/empty tokens', async () => {
    expect(await verifySession(undefined)).toBeNull()
    expect(await verifySession(null)).toBeNull()
    expect(await verifySession('')).toBeNull()
  })

  it('rejects an unsigned sha256-style token (the old scheme)', async () => {
    const legacy = 'a'.repeat(64)
    expect(await verifySession(legacy)).toBeNull()
  })
})
