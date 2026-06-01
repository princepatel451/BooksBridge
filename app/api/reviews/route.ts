import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api'

const reviewSchema = z.object({
  orderId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const data = reviewSchema.parse(await req.json())
    const order = await prisma.order.findUnique({ where: { id: data.orderId } })
    if (!order) return errorResponse('Order not found', 404)
    if (order.buyerId !== payload.userId) return errorResponse('Forbidden', 403)
    if (order.orderStatus !== 'DELIVERED') return errorResponse('Can only review after delivery')
    const existing = await prisma.review.findUnique({ where: { orderId: data.orderId } })
    if (existing) return errorResponse('Already reviewed')
    const review = await prisma.review.create({
      data: { ...data, buyerId: payload.userId, sellerId: order.sellerId, bookId: order.bookId }
    })
    const stats = await prisma.review.aggregate({ where: { sellerId: order.sellerId }, _avg: { rating: true }, _count: true })
    await prisma.sellerProfile.update({ where: { userId: order.sellerId }, data: { avgRating: stats._avg.rating || 0, totalReviews: stats._count } })
    return successResponse({ review }, 201)
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse(error instanceof z.ZodError ? error.issues[0]?.message || 'Validation failed' : 'Validation failed')
    return handleApiError(error)
  }
}
