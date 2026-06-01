import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const items = await prisma.wishlist.findMany({
      where: { userId: payload.userId },
      include: { book: { include: { images: { take: 1 }, seller: { select: { fullName: true } } } } },
      orderBy: { savedAt: 'desc' }
    })
    return successResponse({ items })
  } catch (error) { return handleApiError(error) }
}

export async function POST(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const { bookId } = z.object({ bookId: z.string() }).parse(await req.json())
    const book = await prisma.book.findUnique({ where: { id: bookId } })
    if (!book) return errorResponse('Book not found', 404)
    const item = await prisma.wishlist.upsert({
      where: { userId_bookId: { userId: payload.userId, bookId } },
      create: { userId: payload.userId, bookId, priceAtSave: book.sellingPrice },
      update: {},
    })
    return successResponse({ item }, 201)
  } catch (error) { return handleApiError(error) }
}

export async function DELETE(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const { bookId } = z.object({ bookId: z.string() }).parse(await req.json())
    await prisma.wishlist.delete({ where: { userId_bookId: { userId: payload.userId, bookId } } })
    return successResponse({ message: 'Removed from wishlist' })
  } catch (error) { return handleApiError(error) }
}
