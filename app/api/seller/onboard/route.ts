import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth, signToken } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api'

const schema = z.object({
  displayName: z.string().min(2).max(100),
  bio: z.string().optional(),
  examSpecialization: z.array(z.string()).optional(),
  bankAccount: z.string().optional(),
  bankIfsc: z.string().optional(),
  upiId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const data = schema.parse(await req.json())
    
    // Update user to have isSeller: true AND role: 'SELLER'
    const updatedUser = await prisma.user.update({ 
      where: { id: payload.userId }, 
      data: { isSeller: true, role: 'SELLER' } 
    })

    const profile = await prisma.sellerProfile.upsert({
      where: { userId: payload.userId },
      create: { userId: payload.userId, displayName: data.displayName, bio: data.bio, bankAccountNumber: data.bankAccount, bankIfsc: data.bankIfsc, upiId: data.upiId },
      update: { displayName: data.displayName, bio: data.bio, bankAccountNumber: data.bankAccount, bankIfsc: data.bankIfsc, upiId: data.upiId },
    })

    // Generate a new token with updated SELLER role
    const token = signToken({ userId: updatedUser.id, email: updatedUser.email, role: updatedUser.role })

    const response = successResponse({ profile })
    response.cookies.set('auth-token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict', 
      maxAge: 60 * 60 * 24 * 7, 
      path: '/' 
    })
    return response
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse(error instanceof z.ZodError ? error.issues[0]?.message || 'Validation failed' : 'Validation failed')
    return handleApiError(error)
  }
}
