import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, handleApiError } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const orders = await prisma.order.findMany({
      where: { sellerId: payload.userId },
      orderBy: { createdAt: 'desc' },
      include: { book: { include: { images: { take: 1 } } }, buyer: { select: { fullName: true, email: true, phone: true } } }
    })
    return successResponse({ orders })
  } catch (error) { return handleApiError(error) }
}
