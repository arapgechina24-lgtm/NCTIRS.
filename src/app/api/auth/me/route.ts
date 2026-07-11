/**
 * Authentication API: Current session ("who am I").
 * The client uses this to hydrate auth state without ever reading the token
 * (which is httpOnly and unreadable from JS). Returns 401 when unauthenticated.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/http'

export async function GET(request: NextRequest) {
    const session = await getSession(request)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({
        user: {
            id: session.sub,
            email: session.email,
            name: session.name,
            role: session.role,
            clearanceLevel: session.clearanceLevel,
            agency: session.agency,
        },
    })
}
