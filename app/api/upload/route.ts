import { NextRequest } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { requireAuth } from '@/lib/auth'
import { errorResponse, successResponse, handleApiError } from '@/lib/api'

// Configure Cloudinary from env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  try {
    // Authenticate user before allowing file uploads
    requireAuth(req)

    // Check that credentials exist
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary credentials missing in .env')
      return errorResponse('Cloudinary is not configured on this server.', 500)
    }

    const data = await req.formData()
    const file = data.get('file') as File | null
    if (!file) {
      return errorResponse('No file uploaded', 400)
    }

    // Convert file object to a Node.js Buffer for streaming to Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Stream upload to Cloudinary
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'bookbridge',
          resource_type: 'auto',
        },
        (error, uploadResult) => {
          if (error) {
            console.error('Cloudinary API upload error:', error)
            return reject(error)
          }
          if (!uploadResult) {
            return reject(new Error('Empty upload result from Cloudinary'))
          }
          resolve(uploadResult)
        }
      )
      uploadStream.end(buffer)
    })

    return successResponse({ imageUrl: result.secure_url })
  } catch (error) {
    return handleApiError(error)
  }
}
