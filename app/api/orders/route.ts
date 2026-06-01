import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api'
import { generateOrderNumber } from '@/lib/utils'

const placeOrderSchema = z.object({
  bookId: z.string(),
  addressId: z.string(),
  couponCode: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const data = placeOrderSchema.parse(await req.json())
    const book = await prisma.book.findUnique({ where: { id: data.bookId }, include: { seller: true } })
    if (!book || book.status !== 'ACTIVE') return errorResponse('Book not available')
    if (book.sellerId === payload.userId) return errorResponse('Cannot buy your own book')
    const address = await prisma.address.findUnique({ where: { id: data.addressId } })
    if (!address || address.userId !== payload.userId) return errorResponse('Invalid address')
    
    const PLATFORM_FEE_PERCENT = parseInt(process.env.PLATFORM_FEE_PERCENT || '10')
    const platformFee = book.sellingPrice * PLATFORM_FEE_PERCENT / 100
    const sellerPayout = book.sellingPrice - platformFee
    
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        buyerId: payload.userId,
        sellerId: book.sellerId,
        bookId: data.bookId,
        addressId: data.addressId,
        deliveryAddressSnapshot: { fullName: address.fullName, phone: address.phone, addressLine1: address.addressLine1, addressLine2: address.addressLine2, city: address.city, state: address.state, pinCode: address.pinCode },
        sellingPrice: book.sellingPrice,
        platformFee,
        sellerPayout,
        totalAmount: book.sellingPrice,
        couponCode: data.couponCode,
      }
    })
    await prisma.book.update({ where: { id: data.bookId }, data: { status: 'SOLD', soldAt: new Date() } })
    await prisma.orderTracking.create({ data: { orderId: order.id, status: 'PLACED', description: 'Order placed successfully' } })
    return successResponse({ order }, 201)
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse(error instanceof z.ZodError ? error.issues[0]?.message || 'Validation failed' : 'Validation failed')
    return handleApiError(error)
  }
}

export async function GET(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const orders = await prisma.order.findMany({
      where: { buyerId: payload.userId },
      orderBy: { createdAt: 'desc' },
      include: { book: { include: { images: { take: 1 } } }, tracking: { orderBy: { timestamp: 'asc' } } }
    })
    return successResponse({ orders })
  } catch (error) { return handleApiError(error) }
}
