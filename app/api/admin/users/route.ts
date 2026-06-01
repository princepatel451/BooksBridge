import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, handleApiError } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['ADMIN'])
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20; const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (search) where.OR = [{ fullName: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }]
    if (role) where.role = role

    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, select: { id: true, fullName: true, email: true, phone: true, role: true, city: true, isSeller: true, isActive: true, isSuspended: true, isBlocked: true, createdAt: true, sellerProfile: { select: { verificationStatus: true, avgRating: true } } } }),
      prisma.user.count({ where })
    ])
    return successResponse({ users, total, page, pages: Math.ceil(total / limit) })
  } catch (error) { return handleApiError(error) }
}
