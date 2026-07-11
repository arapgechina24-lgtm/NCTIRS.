import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'


const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
    // 1. Production (Turso / LibSQL Remote)
    if (process.env.NODE_ENV === 'production') {
        const url = process.env.DATABASE_URL
        const authToken = process.env.TURSO_AUTH_TOKEN

        if (!url || !authToken) {
            // Fail LOUD at runtime; only tolerate the missing-DB path during the
            // Next.js build/static-generation phase (never in a running server).
            const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'
            if (!isBuildPhase) {
                throw new Error(
                    '[db] DATABASE_URL and TURSO_AUTH_TOKEN are required in production. Refusing to start on an ephemeral in-memory database.',
                )
            }
            console.warn('[db] Build phase without DB credentials — using in-memory SQLite for static generation only.')
            const adapter = new PrismaLibSql({ url: 'file::memory:' })
            return new PrismaClient({ adapter })
        }

        const adapter = new PrismaLibSql({
            url,
            authToken,
        })
        return new PrismaClient({ adapter })
    }

    // 2. Development (Local LibSQL / SQLite)
    // Using file:dev.db relative path
    const url = process.env.DATABASE_URL || "file:dev.db"

    // Ensure we strip ./ if present as it seemed potential cause of URL_INVALID
    const cleanUrl = url.replace("file:./", "file:")

    console.log("DEBUG: Initializing LibSQL Adapter with URL:", cleanUrl);

    try {
        const adapter = new PrismaLibSql({
            url: cleanUrl,
        })
        return new PrismaClient({ adapter })
    } catch (e) {
        console.error("DEBUG: Failed to init client", e);
        throw e;
    }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
