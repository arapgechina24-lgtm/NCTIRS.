/**
 * Authentication API: Logout — clears the session cookie.
 */
import { NextResponse } from 'next/server'
import { SESSION_COOKIE } from '@/lib/session'

export async function POST() {
    const res = NextResponse.json({ success: true })
    res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
    return res
}
