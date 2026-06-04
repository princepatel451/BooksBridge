'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { BookOpen, Mail, Lock, User, Phone, MapPin, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', city: '', isSeller: false })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) { 
      const errMsg = 'Password must be at least 8 characters'
      setError(errMsg)
      toast.error(errMsg)
      return 
    }
    setLoading(true); setError('')
    const result = await register(form)
    setLoading(false)
    if (result.success) {
      toast.success('Registered successfully!')
      router.push(form.isSeller ? '/seller/onboard' : '/dashboard')
    } else {
      const errMsg = result.error || 'Registration failed'
      setError(errMsg)
      toast.error(errMsg)
    }
  }

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 bg-hero">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-gold-muted flex items-center justify-center mx-auto mb-4">
            <BookOpen size={24} className="text-ink" />
          </div>
          <h1 className="font-display text-3xl font-bold text-cream">Create account</h1>
          <p className="text-white/40 mt-2 text-sm">Join 8,500+ students on BookBridge</p>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/8">

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input value={form.fullName} onChange={e => set('fullName', e.target.value)}
                  className="input-dark w-full pl-11 pr-4 py-3 rounded-xl text-sm" placeholder="Arjun Sharma" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  className="input-dark w-full pl-11 pr-4 py-3 rounded-xl text-sm" placeholder="you@example.com" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Phone</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input value={form.phone} onChange={e => set('phone', e.target.value)}
                    className="input-dark w-full pl-11 pr-4 py-3 rounded-xl text-sm" placeholder="9876543210" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">City</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input value={form.city} onChange={e => set('city', e.target.value)}
                    className="input-dark w-full pl-11 pr-4 py-3 rounded-xl text-sm" placeholder="Delhi" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                  className="input-dark w-full pl-11 pr-11 py-3 rounded-xl text-sm" placeholder="Min 8 characters" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Seller toggle */}
            <button type="button" onClick={() => set('isSeller', !form.isSeller)}
              className={`w-full rounded-xl p-4 border text-left transition-all ${form.isSeller ? 'border-gold/40 bg-gold/8' : 'border-white/8 bg-white/3'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${form.isSeller ? 'border-gold bg-gold' : 'border-white/30'}`}>
                  {form.isSeller && <CheckCircle size={12} className="text-ink" />}
                </div>
                <div>
                  <div className="text-sm font-medium text-cream">I also want to sell books</div>
                  <div className="text-xs text-white/40 mt-0.5">Activate your seller profile after registration</div>
                </div>
              </div>
            </button>

            <button type="submit" disabled={loading}
              className="btn-gold w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
              {loading ? <div className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" /> : <><span>Create Account</span><ArrowRight size={14} /></>}
            </button>
          </form>

          <p className="text-center text-white/30 text-xs mt-5">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-gold/60 hover:text-gold">Terms</Link> and{' '}
            <Link href="/privacy" className="text-gold/60 hover:text-gold">Privacy Policy</Link>.
          </p>

          <div className="mt-5 text-center">
            <p className="text-white/40 text-sm">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-gold hover:text-gold-light font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
