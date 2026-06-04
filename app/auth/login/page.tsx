'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login(form.email, form.password)
      console.log("LOGIN RESULT:", result)

      if (result.success) {
        console.log("REDIRECTING TO DASHBOARD")
        toast.success('Logged in successfully!')
        router.push('/dashboard')
      } else {
        console.log("LOGIN FAILED")
        const errMsg = result.error || 'Login failed'
        setError(errMsg)
        toast.error(errMsg)
        setLoading(false)
      }
    } catch (err) {
      console.error("Login unexpected error:", err)
      const errMsg = 'An unexpected error occurred. Please try again.'
      setError(errMsg)
      toast.error(errMsg)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 bg-hero">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-gold-muted flex items-center justify-center mx-auto mb-4">
            <BookOpen size={24} className="text-ink" />
          </div>
          <h1 className="font-display text-3xl font-bold text-cream">Welcome back</h1>
          <p className="text-white/40 mt-2 text-sm">Sign in to your BookBridge account</p>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/8">

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-dark w-full pl-11 pr-4 py-3 rounded-xl text-sm" placeholder="you@example.com" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-dark w-full pl-11 pr-11 py-3 rounded-xl text-sm" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <Link href="/auth/forgot-password" className="text-xs text-gold/70 hover:text-gold">Forgot password?</Link>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-gold w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <div className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" /> : <><span>Sign In</span><ArrowRight size={14} /></>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/40 text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-gold hover:text-gold-light font-medium">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
