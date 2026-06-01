import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, handleApiError } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const payload = requireRole(req, ['SELLER', 'ADMIN'])
    const [totalListings, activeListings, soldBooks, pendingOrders, sellerProfile] = await Promise.all([
      prisma.book.count({ where: { sellerId: payload.userId, status: { not: 'DELETED' } } }),
      prisma.book.count({ where: { sellerId: payload.userId, status: 'ACTIVE' } }),
      prisma.book.count({ where: { sellerId: payload.userId, status: 'SOLD' } }),
      prisma.order.count({ where: { sellerId: payload.userId, orderStatus: 'PLACED' } }),
      prisma.sellerProfile.findUnique({ where: { userId: payload.userId } }),
    ])
    return successResponse({ totalListings, activeListings, soldBooks, pendingOrders, totalEarnings: sellerProfile?.totalEarnings || 0, avgRating: sellerProfile?.avgRating || 0, pendingPayout: sellerProfile?.pendingPayout || 0 })
  } catch (error) { return handleApiError(error) }
}
