import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api'

const createBookSchema = z.object({
  title: z.string().min(1).max(255),
  author: z.string().min(1).max(255),
  edition: z.string().optional(),
  publisher: z.string().optional(),
  isbn: z.string().optional(),
  examCategory: z.string().min(1),
  subject: z.string().optional(),
  conditionScore: z.number().int().min(1).max(10),
  conditionNotes: z.string().optional(),
  description: z.string().optional(),
  marketPrice: z.number().positive(),
  sellingPrice: z.number().positive(),
  city: z.string().min(1),
  state: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const exam = searchParams.get('exam') || ''
    const subject = searchParams.get('subject') || ''
    const city = searchParams.get('city') || ''
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999')
    const condition = searchParams.get('condition') || ''
    const sort = searchParams.get('sort') || 'latest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {
      status: 'ACTIVE',
      moderationStatus: 'APPROVED',
      sellingPrice: { gte: minPrice, lte: maxPrice },
    }
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { author: { contains: search, mode: 'insensitive' } },
    ]
    if (exam) where.examCategory = { equals: exam, mode: 'insensitive' }
    if (subject) where.subject = { contains: subject, mode: 'insensitive' }
    if (city) where.city = { contains: city, mode: 'insensitive' }
    if (condition === 'new') where.conditionScore = { gte: 9 }
    else if (condition === 'likenew') where.conditionScore = { gte: 7, lte: 9 }
    else if (condition === 'good') where.conditionScore = { gte: 5, lte: 7 }
    else if (condition === 'old') where.conditionScore = { lte: 4 }

    const orderBy: Record<string, unknown> =
      sort === 'price_asc' ? { sellingPrice: 'asc' } :
      sort === 'price_desc' ? { sellingPrice: 'desc' } :
      sort === 'views' ? { viewCount: 'desc' } :
      { createdAt: 'desc' }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where, orderBy, skip, take: limit,
        include: { images: { take: 1, orderBy: { sortOrder: 'asc' } }, seller: { select: { id: true, fullName: true, sellerProfile: { select: { avgRating: true, verificationStatus: true } } } } }
      }),
      prisma.book.count({ where })
    ])

    return successResponse({ books, total, page, pages: Math.ceil(total / limit) })
  } catch (error) { return handleApiError(error) }
}

export async function POST(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const body = await req.json()
    const data = createBookSchema.parse(body)

    const book = await prisma.book.create({
      data: { ...data, sellerId: payload.userId },
    })
    return successResponse({ book }, 201)
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse(error instanceof z.ZodError ? error.issues[0]?.message || 'Validation failed' : 'Validation failed')
    return handleApiError(error)
  }
}
