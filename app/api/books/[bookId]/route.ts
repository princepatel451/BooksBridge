import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api'

export async function GET(req: NextRequest, { params }: { params: Promise<{ bookId: string }> }) {
  try {
    const { bookId } = await params
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        seller: { select: { id: true, fullName: true, city: true, createdAt: true, sellerProfile: { select: { displayName: true, bio: true, avgRating: true, totalReviews: true, totalBooksSold: true, verificationStatus: true } } } },
        reviews: { take: 5, orderBy: { createdAt: 'desc' }, include: { buyer: { select: { fullName: true, profilePictureUrl: true } } } }
      }
    })
    if (!book) return errorResponse('Book not found', 404)
    await prisma.book.update({ where: { id: bookId }, data: { viewCount: { increment: 1 } } })
    return successResponse({ book })
  } catch (error) { return handleApiError(error) }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ bookId: string }> }) {
  try {
    const payload = requireAuth(req)
    const { bookId } = await params
    const body = await req.json()
    const book = await prisma.book.findUnique({ where: { id: bookId } })
    if (!book) return errorResponse('Book not found', 404)
    if (book.sellerId !== payload.userId && payload.role !== 'ADMIN') return errorResponse('Forbidden', 403)
    const updated = await prisma.book.update({ where: { id: bookId }, data: body })
    return successResponse({ book: updated })
  } catch (error) { return handleApiError(error) }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ bookId: string }> }) {
  try {
    const payload = requireAuth(req)
    const { bookId } = await params
    const book = await prisma.book.findUnique({ where: { id: bookId } })
    if (!book) return errorResponse('Book not found', 404)
    if (book.sellerId !== payload.userId && payload.role !== 'ADMIN') return errorResponse('Forbidden', 403)
    await prisma.book.update({ where: { id: bookId }, data: { status: 'DELETED' } })
    return successResponse({ message: 'Book deleted' })
  } catch (error) { return handleApiError(error) }
}
