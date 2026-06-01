import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword, signToken } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api'

const registerSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(15).optional(),
  password: z.string().min(8).max(100),
  city: z.string().optional(),
  state: z.string().optional(),
  isSeller: z.boolean().optional().default(false),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = registerSchema.parse(body)
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, ...(data.phone ? [{ phone: data.phone }] : [])] }
    })
    if (existingUser) return errorResponse('User already exists with this email or phone', 409)
    const passwordHash = await hashPassword(data.password)
    const user = await prisma.user.create({
      data: { fullName: data.fullName, email: data.email, phone: data.phone, passwordHash, city: data.city, state: data.state, isSeller: data.isSeller || false, role: 'BUYER' },
      select: { id: true, email: true, fullName: true, role: true, isSeller: true }
    })
    if (data.isSeller) {
      await prisma.sellerProfile.create({ data: { userId: user.id, displayName: data.fullName } })
    }
    const token = signToken({ userId: user.id, email: user.email, role: user.role })
    const response = successResponse({ user, token }, 201)
    response.cookies.set('auth-token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 60 * 60 * 24 * 7, path: '/' })
    return response
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse(error instanceof z.ZodError ? error.issues[0]?.message || 'Validation failed' : 'Validation failed')
    return handleApiError(error)
  }
}
