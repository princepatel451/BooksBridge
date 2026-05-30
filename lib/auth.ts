import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  const cookieToken = request.cookies.get('auth-token')?.value
  return cookieToken || null
}

export function requireAuth(request: NextRequest): JWTPayload {
  const token = getTokenFromRequest(request)
  if (!token) throw new Error('UNAUTHORIZED')
  const payload = verifyToken(token)
  if (!payload) throw new Error('INVALID_TOKEN')
  return payload
}

export function requireRole(request: NextRequest, roles: string[]): JWTPayload {
  const user = requireAuth(request)
  if (!roles.includes(user.role)) throw new Error('FORBIDDEN')
  return user
}
