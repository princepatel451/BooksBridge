import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { comparePassword, signToken } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api'

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = loginSchema.parse(body)
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true, email: true, fullName: true, role: true, passwordHash: true, isActive: true, isSuspended: true, isBlocked: true, isSeller: true }
    })
    if (!user || !user.passwordHash) return errorResponse('Invalid credentials', 401)
    if (!user.isActive || user.isBlocked) return errorResponse('Account suspended or blocked', 403)
    const valid = await comparePassword(data.password, user.passwordHash)
    if (!valid) return errorResponse('Invalid credentials', 401)
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
    const token = signToken({ userId: user.id, email: user.email, role: user.role })
    const { passwordHash: _, ...safeUser } = user
    const response = successResponse({ user: safeUser, token })
    response.cookies.set('auth-token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', sameSite: 'strict', 
      maxAge: 60 * 60 * 24 * 7, 
      path: '/' })
    return response
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse(error instanceof z.ZodError ? error.issues[0]?.message || 'Validation failed' : 'Validation failed')
    return handleApiError(error)
  }
}
