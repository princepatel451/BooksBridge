import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, fullName: true, phone: true, city: true, state: true, role: true, isSeller: true, profilePictureUrl: true, isEmailVerified: true, sellerProfile: { select: { verificationStatus: true, avgRating: true, displayName: true } } }
    })
    if (!user) return errorResponse('User not found', 404)
    return successResponse({ user })
  } catch (error) { return handleApiError(error) }
}
