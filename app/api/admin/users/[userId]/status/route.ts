import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api'

const schema = z.object({ action: z.enum(['suspend', 'unsuspend', 'block', 'unblock', 'activate']) })

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    requireRole(req, ['ADMIN'])
    const { userId } = await params
    const { action } = schema.parse(await req.json())
    const data: Record<string, boolean> = {}
    if (action === 'suspend') data.isSuspended = true
    else if (action === 'unsuspend') data.isSuspended = false
    else if (action === 'block') data.isBlocked = true
    else if (action === 'unblock') data.isBlocked = false
    else if (action === 'activate') { data.isActive = true; data.isSuspended = false; data.isBlocked = false }
    const user = await prisma.user.update({ where: { id: userId }, data, select: { id: true, fullName: true, isActive: true, isSuspended: true, isBlocked: true } })
    return successResponse({ user })
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse(error instanceof z.ZodError ? error.issues[0]?.message || 'Validation failed' : 'Validation failed')
    return handleApiError(error)
  }
}
