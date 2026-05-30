import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const cart = await prisma.cart.findMany({
      where: { userId: payload.userId },
      include: { book: { include: { images: { take: 1, orderBy: { sortOrder: 'asc' } }, seller: { select: { fullName: true, city: true } } } } }
    })
    return successResponse({ cart })
  } catch (error) { return handleApiError(error) }
}

export async function POST(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const { bookId } = z.object({ bookId: z.string() }).parse(await req.json())
    const book = await prisma.book.findUnique({ where: { id: bookId } })
    if (!book || book.status !== 'ACTIVE') return errorResponse('Book not available')
    const existing = await prisma.cart.findUnique({ where: { userId_bookId: { userId: payload.userId, bookId } } })
    if (existing) return errorResponse('Already in cart')
    const item = await prisma.cart.create({ data: { userId: payload.userId, bookId }, include: { book: { include: { images: { take: 1 } } } } })
    return successResponse({ item }, 201)
  } catch (error) { return handleApiError(error) }
}

export async function DELETE(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const { bookId } = z.object({ bookId: z.string() }).parse(await req.json())
    await prisma.cart.delete({ where: { userId_bookId: { userId: payload.userId, bookId } } })
    return successResponse({ message: 'Removed from cart' })
  } catch (error) { return handleApiError(error) }
}
