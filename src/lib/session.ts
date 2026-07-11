/**
 * NCTIRS Session Management
 * -------------------------------------------------------------------------
 * Strategy ("why"): The original MVP issued an unsigned `sha256(userId + timestamp)`
 * string that nothing ever verified — trivially forgeable and effectively no auth
 * at all. This module replaces it with a cryptographically signed, expiring JWT
 * (HS256 via `jose`, which runs on the Edge runtime used by Next.js middleware).
 *
 * Sessions are transported as an httpOnly + Secure + SameSite=Strict cookie so the
 * token is never exposed to client-side JavaScript (mitigates XSS exfiltration).
 */
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

export const SESSION_COOKIE = 'nctirs_session'
const SESSION_TTL = '8h'
const ALG = 'HS256'

/**
 * Resolve the signing secret. We throw loudly if it is missing so a
 * misconfigured deployment fails at request time rather than silently
 * issuing unverifiable tokens.
 */
function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error(
      '[session] SESSION_SECRET must be set and at least 32 characters. Generate with: openssl rand -base64 48',
    )
  }
  return new TextEncoder().encode(secret)
}

/** Clearance role ladder mirrored from the Prisma User model. */
export type Role = 'L1' | 'L2' | 'L3' | 'L4'

export interface Session extends JWTPayload {
  /** user id (JWT standard `sub`) */
  sub: string
  email: string
  name: string | null
  role: Role
  /** numeric clearance (1..4); authoritative for authorization checks */
  clearanceLevel: number
  agency: string | null
}

/** Mint a signed session token for an authenticated principal. */
export async function createSession(
  claims: Omit<Session, 'iat' | 'exp'>,
): Promise<string> {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(getSecret())
}

/**
 * Verify a session token. Returns the decoded session or `null` on any
 * failure (bad signature, expiry, tampering). Never throws to callers so
 * middleware can treat "invalid" and "absent" identically.
 */
export async function verifySession(token: string | undefined | null): Promise<Session | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: [ALG] })
    return payload as Session
  } catch {
    return null
  }
}

/** Cookie options for setting the session (production-hardened). */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours, aligned with SESSION_TTL
  }
}
