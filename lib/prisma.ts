/* eslint-disable @typescript-eslint/no-explicit-any */
// Prisma client wrapper - run `npx prisma generate` to enable full functionality

const globalForPrisma = globalThis as unknown as { prisma: any }

function createPrismaClient(): any {
  try {
    const { PrismaClient } = require('@prisma/client')
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
  } catch {
    console.warn('[BookBridge] Prisma client not generated. Run: npx prisma generate && npx prisma db push')
    // Return a no-op proxy for build time
    const handler: ProxyHandler<object> = {
      get(_t, prop) {
        if (prop === '$connect' || prop === '$disconnect') return () => Promise.resolve()
        return new Proxy({}, handler)
      },
      apply() { return Promise.resolve(null) },
    }
    return new Proxy({}, handler)
  }
}

export const prisma: any = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
