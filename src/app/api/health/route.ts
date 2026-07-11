/**
 * Health / readiness probe.
 * Returns 200 only when the process is up AND the database answers a trivial
 * query — so orchestrators (Railway/Vercel) detect DB-less degraded states
 * instead of routing traffic to a broken instance.
 */
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        await prisma.$queryRaw`SELECT 1`
        return NextResponse.json({ status: 'ok', db: 'up', ts: new Date().toISOString() })
    } catch (error) {
        console.error('[health] db check failed:', error)
        return NextResponse.json({ status: 'degraded', db: 'down' }, { status: 503 })
    }
}
