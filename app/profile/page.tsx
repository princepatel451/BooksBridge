'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Mail, Phone, MapPin, Package, Heart, Star, LogOut, Edit3, Save, X, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, loading, logout, refresh } = useAuth()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ fullName: '', phone: '', city: '', state: '' })
  const [msg, setMsg] = useState('')

  useEffect(() => { if (!loading && !user) router.push('/auth/login') }, [user, loading])
  useEffect(() => {
    if (user) setForm({ fullName: user.fullName, phone: user.phone || '', city: user.city || '', state: '' })
  }, [user])

  const save = async () => {
    setSaving(true)
    const res = await fetch('/api/users/profile', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
    })
    const data = await res.json()
    setSaving(false)
    if (data.success) { setMsg('Profile updated!'); setEditing(false); refresh(); setTimeout(() => setMsg(''), 3000) }
  }

  const handleLogout = async () => { await logout(); router.push('/') }

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  )

  const quickLinks = [
    { icon: Package, label: 'My Orders', href: '/orders', desc: 'Track your purchases' },
    { icon: Heart, label: 'Wishlist', href: '/wishlist', desc: 'Saved books' },
    ...(user.isSeller ? [{ icon: Star, label: 'Seller Dashboard', href: '/seller/dashboard', desc: 'Manage your listings' }] : []),
    ...(user.role === 'ADMIN' ? [{ icon: ShieldCheck, label: 'Admin Panel', href: '/admin/dashboard', desc: 'Platform management' }] : []),
  ]

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display text-3xl font-bold text-cream mb-8">My Profile</h1>

        {msg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-5 text-emerald-400 text-sm text-center">
            {msg}
          </div>
        )}

        {/* Avatar + Name */}
        <div className="glass rounded-3xl p-7 border border-white/5 mb-4">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/40 to-gold-muted/20 flex items-center justify-center text-2xl font-bold text-gold">
                {user.fullName[0]}
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-cream">{user.fullName}</h2>
                <div className="text-white/40 text-sm mt-0.5">{user.email}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="badge badge-green py-0.5"><ShieldCheck size={9} />Verified</span>
                  {user.isSeller && <span className="badge badge-gold py-0.5">Seller</span>}
                  {user.role === 'ADMIN' && <span className="badge badge-blue py-0.5">Admin</span>}
                </div>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${editing ? 'bg-red-500/10 text-red-400' : 'glass text-white/40 hover:text-cream'}`}
            >
              {editing ? <X size={15} /> : <Edit3 size={15} />}
            </button>
          </div>

          {editing ? (
            <div className="space-y-4">
              {[
                { label: 'Full Name', key: 'fullName', type: 'text', placeholder: 'Arjun Sharma' },
                { label: 'Phone', key: 'phone', type: 'tel', placeholder: '9876543210' },
                { label: 'City', key: 'city', type: 'text', placeholder: 'Delhi' },
                { label: 'State', key: 'state', type: 'text', placeholder: 'Delhi' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs text-white/40 mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="input-dark w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>
              ))}
              <button onClick={save} disabled={saving} className="btn-gold w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <div className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" /> : <><Save size={14} />Save Changes</>}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {[
                { Icon: Mail, label: 'Email', value: user.email },
                { Icon: Phone, label: 'Phone', value: user.phone || 'Not added' },
                { Icon: MapPin, label: 'City', value: user.city || 'Not set' },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 glass rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon size={13} className="text-gold/60" />
                  </div>
                  <div>
                    <div className="text-white/30 text-xs">{label}</div>
                    <div className="text-cream text-sm mt-0.5">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="glass rounded-2xl border border-white/5 overflow-hidden mb-4">
          {quickLinks.map(({ icon: Icon, label, href, desc }, i) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors group ${i < quickLinks.length - 1 ? 'border-b border-white/5' : ''}`}
            >
              <div className="w-9 h-9 glass rounded-xl flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                <Icon size={15} className="text-gold/60 group-hover:text-gold transition-colors" />
              </div>
              <div className="flex-1">
                <div className="text-cream text-sm font-medium">{label}</div>
                <div className="text-white/30 text-xs">{desc}</div>
              </div>
              <Package size={12} className="text-white/20 group-hover:text-white/40 transition-colors" />
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 glass rounded-2xl py-4 text-red-400/70 hover:text-red-400 border border-red-500/10 hover:border-red-500/20 transition-all text-sm font-medium"
        >
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </div>
  )
}
