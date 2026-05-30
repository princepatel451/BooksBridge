import { NextResponse } from 'next/server'

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export function handleApiError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401)
    if (error.message === 'FORBIDDEN') return errorResponse('Access denied', 403)
    if (error.message === 'INVALID_TOKEN') return errorResponse('Invalid token', 401)
    if (error.message === 'NOT_FOUND') return errorResponse('Not found', 404)
    console.error('API Error:', error.message)
    return errorResponse(error.message, 400)
  }
  console.error('Unknown error:', error)
  return errorResponse('Internal server error', 500)
}
