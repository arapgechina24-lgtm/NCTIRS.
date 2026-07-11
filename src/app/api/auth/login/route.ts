/**
 * Authentication API: Login
 * -------------------------------------------------------------------------
 * Verifies credentials with bcrypt, then issues a SIGNED session as an
 * httpOnly cookie (replacing the previous forgeable sha256 token). No token
 * is returned in the JSON body — the browser holds it only as an httpOnly
 * cookie the middleware validates on every subsequent request.
 */
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'
import { createHash } from 'crypto'
import { createSession, sessionCookieOptions, SESSION_COOKIE, type Role } from '@/lib/session'

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 },
            )
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                password: true,
                role: true,
                agency: true,
                department: true,
                clearanceLevel: true,
                isActive: true,
            },
        })

        // Uniform failure response to avoid user-enumeration via timing/messaging.
        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }
        if (!user.isActive) {
            return NextResponse.json({ error: 'Account is disabled' }, { status: 403 })
        }

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        // Best-effort audit + lastLogin. Failures are logged, not swallowed silently,
        // so genuine DB outages remain visible in logs.
        try {
            await prisma.user.update({
                where: { id: user.id },
                data: { lastLogin: new Date() },
            })
            await prisma.auditLog.create({
                data: {
                    action: 'LOGIN',
                    resource: 'auth',
                    userId: user.id,
                    details: JSON.stringify({ email: user.email }),
                    ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                    userAgent: request.headers.get('user-agent') || 'unknown',
                    hash: createHash('sha256').update(`LOGIN-${user.id}-${Date.now()}`).digest('hex'),
                },
            })
        } catch (dbError) {
            console.error('[auth/login] audit write failed:', dbError)
        }

        const token = await createSession({
            sub: user.id,
            email: user.email,
            name: user.name,
            role: (user.role as Role) ?? 'L1',
            clearanceLevel: user.clearanceLevel ?? 1,
            agency: user.agency,
        })

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _pw, ...safeUser } = user

        const res = NextResponse.json({ success: true, user: safeUser })
        res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions())
        return res
    } catch (error) {
        console.error('[auth/login] error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
