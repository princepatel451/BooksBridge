import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, handleApiError } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['ADMIN'])
    const [totalUsers, activeSellers, totalBooks, totalOrders, pendingReports, revenue] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isSeller: true } }),
      prisma.book.count({ where: { status: { not: 'DELETED' } } }),
      prisma.order.count(),
      prisma.report.count({ where: { status: 'OPEN' } }),
      prisma.order.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { totalAmount: true } }),
    ])
    return successResponse({ totalUsers, activeSellers, totalBooks, totalOrders, pendingReports, revenue: revenue._sum.totalAmount || 0 })
  } catch (error) { return handleApiError(error) }
}
