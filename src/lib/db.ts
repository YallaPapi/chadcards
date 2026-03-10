import { PrismaClient } from '@/generated/prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

async function getAdapter() {
  const url = process.env.TURSO_DATABASE_URL || 'file:./prisma/dev.db'
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (url.startsWith('file:')) {
    // Local development: use node adapter
    const { PrismaLibSql } = await import('@prisma/adapter-libsql')
    return new PrismaLibSql({ url, authToken })
  } else {
    // Production/serverless: use web adapter (HTTP only, no native deps)
    const { PrismaLibSql } = await import('@prisma/adapter-libsql/web')
    return new PrismaLibSql({ url, authToken })
  }
}

function createPrismaClient() {
  const url = process.env.TURSO_DATABASE_URL || 'file:./prisma/dev.db'
  const authToken = process.env.TURSO_AUTH_TOKEN
  // For sync initialization, determine adapter type
  if (url.startsWith('file:')) {
    const { PrismaLibSql } = require('@prisma/adapter-libsql')
    const adapter = new PrismaLibSql({ url, authToken })
    return new PrismaClient({ adapter })
  } else {
    const { PrismaLibSql } = require('@prisma/adapter-libsql/web')
    const adapter = new PrismaLibSql({ url, authToken })
    return new PrismaClient({ adapter })
  }
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
