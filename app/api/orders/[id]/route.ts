import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = requireAuth(req)
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        book: {
          include: {
            images: true,
            seller: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
              }
            }
          }
        },
        buyer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          }
        },
        tracking: {
          orderBy: {
            timestamp: 'asc'
          }
        },
        payment: true,
      }
    })

    if (!order) {
      return errorResponse('Order not found', 404)
    }

    // Verify user is either buyer or seller of the order
    if (order.buyerId !== payload.userId && order.sellerId !== payload.userId) {
      return errorResponse('Unauthorized to view this order', 403)
    }

    return successResponse({ order })
  } catch (error) {
    return handleApiError(error)
  }
}
