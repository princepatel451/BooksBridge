import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api'
import { z } from 'zod'

const createAddressSchema = z.object({
  label: z.string().optional().default('Home'),
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  addressLine1: z.string().min(1, 'Flat/House info is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pinCode: z.string().min(6, 'Pincode must be at least 6 characters'),
  isDefault: z.boolean().optional().default(false),
})

export async function GET(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const addresses = await prisma.address.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' }
    })
    return successResponse({ addresses })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const data = createAddressSchema.parse(await req.json())

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: payload.userId, isDefault: true },
        data: { isDefault: false }
      })
    }

    const address = await prisma.address.create({
      data: {
        userId: payload.userId,
        label: data.label,
        fullName: data.fullName,
        phone: data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || '',
        city: data.city,
        state: data.state,
        pinCode: data.pinCode,
        isDefault: data.isDefault,
      }
    })

    return successResponse({ address }, 201)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || 'Validation failed')
    }
    return handleApiError(error)
  }
}
