/**
 * NCTIRS HTTP helpers
 * -------------------------------------------------------------------------
 * Shared utilities for API route handlers. Centralising these prevents the
 * copy-paste drift the original routes suffered from (unbounded `parseInt`
 * limits, ad-hoc identity reads).
 */
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySession, type Session } from '@/lib/session'

/** Hard ceiling on list pagination to prevent resource-exhaustion abuse. */
export const MAX_PAGE_SIZE = 200

/**
 * Parse and clamp a `limit` query parameter into a safe range [1, MAX_PAGE_SIZE].
 * Falls back to `fallback` for missing/invalid input.
 */
export function clampLimit(raw: string | null, fallback = 50): number {
  const parsed = parseInt(raw ?? String(fallback), 10)
  if (Number.isNaN(parsed)) return fallback
  return Math.min(Math.max(parsed, 1), MAX_PAGE_SIZE)
}

/** Parse and clamp a non-negative `offset`. */
export function clampOffset(raw: string | null): number {
  const parsed = parseInt(raw ?? '0', 10)
  if (Number.isNaN(parsed) || parsed < 0) return 0
  return parsed
}

/**
 * Read the verified session directly from the request cookie. Route handlers
 * behind the middleware can rely on `middleware.ts` for gating, but should use
 * this to obtain the *authenticated* identity rather than trusting any
 * client-supplied `createdById`/`userId` field.
 */
export async function getSession(req: NextRequest): Promise<Session | null> {
  return verifySession(req.cookies.get(SESSION_COOKIE)?.value)
}
