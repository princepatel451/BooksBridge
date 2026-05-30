import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api'

const updateSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  profilePictureUrl: z.string().url().optional(),
})

export async function PUT(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const body = await req.json()
    const data = updateSchema.parse(body)
    const user = await prisma.user.update({
      where: { id: payload.userId },
      data,
      select: { id: true, email: true, fullName: true, phone: true, city: true, state: true, role: true, isSeller: true }
    })
    return successResponse({ user })
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse(error instanceof z.ZodError ? error.issues[0]?.message || 'Validation failed' : 'Validation failed')
    return handleApiError(error)
  }
}
