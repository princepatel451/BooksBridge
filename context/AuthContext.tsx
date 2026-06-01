'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface User {
  id: string
  email: string
  fullName: string
  phone?: string
  city?: string
  role: string
  isSeller: boolean
  profilePictureUrl?: string
  sellerProfile?: { verificationStatus: string; avgRating: number; displayName: string }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

interface RegisterData {
  fullName: string; email: string; password: string; phone?: string; city?: string; isSeller?: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) { const data = await res.json(); setUser(data.data.user) }
      else setUser(null)
    } catch { setUser(null) } finally { setLoading(false) }
  }

  useEffect(() => { refresh() }, [])

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      const data = await res.json()
      if (data.success) { setUser(data.data.user); return { success: true } }
      return { success: false, error: data.error }
    } catch { return { success: false, error: 'Network error' } }
  }

  const register = async (formData: RegisterData) => {
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      const data = await res.json()
      if (data.success) { setUser(data.data.user); return { success: true } }
      return { success: false, error: data.error }
    } catch { return { success: false, error: 'Network error' } }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
