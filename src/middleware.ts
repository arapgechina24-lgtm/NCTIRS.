/**
 * NCTIRS Zero-Trust Edge Middleware
 * -------------------------------------------------------------------------
 * Strategy ("why"): The MVP shipped with NO authentication layer — 13 of 15 API
 * routes were fully open, including `/api/soar/execute`, which simulates isolating
 * national infrastructure and blocking IPs. This middleware establishes a single
 * choke point: every sensitive API and dashboard route must present a valid signed
 * session, and privileged actions additionally require a minimum clearance level.
 *
 * It fails CLOSED: any request without a verifiable session to a guarded route is
 * rejected. Public auth/webhook endpoints are explicitly allow-listed.
 */
import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, verifySession } from '@/lib/session'

/**
 * Minimum clearance level required per API prefix.
 *   L1 (1) Analyst · L2 (2) Supervisor · L3 (3) Director · L4 (4) Admin
 * Ordered most-specific-first is not required (prefix match is unambiguous here).
 */
const CLEARANCE_RULES: { prefix: string; minLevel: number }[] = [
  { prefix: '/api/soar', minLevel: 3 }, // Containment actions — Director+
  { prefix: '/api/audit', minLevel: 3 }, // Audit trail — Director+
  { prefix: '/api/users', minLevel: 4 }, // User administration — Admin only
  { prefix: '/api/incidents', minLevel: 2 }, // Create/modify incidents — Supervisor+
  { prefix: '/api/surveillance', minLevel: 2 },
  { prefix: '/api/agent', minLevel: 3 }, // Autonomous agent bridge — Director+
  { prefix: '/api/ml', minLevel: 1 },
  { prefix: '/api/threats', minLevel: 1 },
  { prefix: '/api/stats', minLevel: 1 },
]

/** Endpoints reachable without a session. */
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/health',
  '/api/webhooks/github', // authenticated separately via HMAC signature
]

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  const isApi = pathname.startsWith('/api/')
  const isGuardedUi = pathname.startsWith('/dashboard')
  const rule = CLEARANCE_RULES.find((r) => pathname.startsWith(r.prefix))

  // Nothing to guard (public pages, static, etc.)
  if (!isApi && !isGuardedUi) return NextResponse.next()

  const token = req.cookies.get(SESSION_COOKIE)?.value
  const session = await verifySession(token)

  if (!session) {
    if (isGuardedUi) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (rule && session.clearanceLevel < rule.minLevel) {
    return NextResponse.json(
      { error: 'Insufficient clearance', required: rule.minLevel, held: session.clearanceLevel },
      { status: 403 },
    )
  }

  return NextResponse.next()
}

export const config = {
  // Guard API + dashboard. Static assets, _next, and public pages are excluded.
  matcher: ['/api/:path*', '/dashboard/:path*'],
}
