import { prisma } from '@/lib/prisma'
import { successResponse, handleApiError } from '@/lib/api'

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      where: { status: 'ACTIVE', moderationStatus: 'APPROVED' },
      orderBy: { viewCount: 'desc' },
      take: 8,
      include: { images: { take: 1, orderBy: { sortOrder: 'asc' } }, seller: { select: { id: true, fullName: true, sellerProfile: { select: { avgRating: true, verificationStatus: true } } } } }
    })
    return successResponse({ books })
  } catch (error) { return handleApiError(error) }
}
