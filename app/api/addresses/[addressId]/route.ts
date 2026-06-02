import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api'
import { z } from 'zod'

const updateAddressSchema = z.object({
  label: z.string().optional(),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pinCode: z.string().optional(),
  isDefault: z.boolean().optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ addressId: string }> }) {
  try {
    const payload = requireAuth(req)
    const { addressId } = await params
    const data = updateAddressSchema.parse(await req.json())

    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId }
    })

    if (!existingAddress) {
      return errorResponse('Address not found', 404)
    }

    if (existingAddress.userId !== payload.userId) {
      return errorResponse('Access denied', 403)
    }

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: payload.userId, isDefault: true },
        data: { isDefault: false }
      })
    }

    const updated = await prisma.address.update({
      where: { id: addressId },
      data: {
        label: data.label ?? existingAddress.label,
        fullName: data.fullName ?? existingAddress.fullName,
        phone: data.phone ?? existingAddress.phone,
        addressLine1: data.addressLine1 ?? existingAddress.addressLine1,
        addressLine2: data.addressLine2 ?? existingAddress.addressLine2,
        city: data.city ?? existingAddress.city,
        state: data.state ?? existingAddress.state,
        pinCode: data.pinCode ?? existingAddress.pinCode,
        isDefault: data.isDefault ?? existingAddress.isDefault,
      }
    })

    return successResponse({ address: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || 'Validation failed')
    }
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ addressId: string }> }) {
  try {
    const payload = requireAuth(req)
    const { addressId } = await params

    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId }
    })

    if (!existingAddress) {
      return errorResponse('Address not found', 404)
    }

    if (existingAddress.userId !== payload.userId) {
      return errorResponse('Access denied', 403)
    }

    await prisma.address.delete({
      where: { id: addressId }
    })

    return successResponse({ message: 'Address deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
