import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, handleApiError } from '@/lib/api'

export async function GET(req: NextRequest, { params }: { params: Promise<{ sellerId: string }> }) {
  try {
    const { sellerId } = await params
    
    // Fetch the seller user record and their public seller profile
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      select: {
        id: true,
        fullName: true,
        city: true,
        createdAt: true,
        sellerProfile: {
          select: {
            displayName: true,
            bio: true,
            avgRating: true,
            totalReviews: true,
            totalBooksSold: true,
            verificationStatus: true,
            createdAt: true,
          }
        }
      }
    })

    if (!seller) {
      return errorResponse('Seller not found', 404)
    }

    // Fetch the public books listed by this seller
    const books = await prisma.book.findMany({
      where: {
        sellerId: sellerId,
        status: 'ACTIVE',
        moderationStatus: 'APPROVED',
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        seller: {
          select: {
            id: true,
            fullName: true,
            sellerProfile: {
              select: {
                avgRating: true,
                verificationStatus: true,
              }
            }
          }
        }
      }
    })

    return successResponse({ seller, books })
  } catch (error) {
    return handleApiError(error)
  }
}
