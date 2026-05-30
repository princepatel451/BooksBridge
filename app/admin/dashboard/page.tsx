'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Users, BookOpen, ShoppingBag, TrendingUp, AlertTriangle, DollarSign, ChevronRight, Shield } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

interface AdminStats {
  totalUsers: number; activeSellers: number; totalBooks: number
  totalOrders: number; pendingReports: number; revenue: number
}

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) router.push('/')
  }, [user, loading])

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetch('/api/admin/dashboard').then(r => r.json()).then(d => { if (d.success) setStats(d.data) })
    }
  }, [user])

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  )
  if (user.role !== 'ADMIN') return null

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? '—', Icon: Users, color: 'text-blue-400', bg: 'from-blue-500/10' },
    { label: 'Active Sellers', value: stats?.activeSellers ?? '—', Icon: TrendingUp, color: 'text-gold', bg: 'from-gold/10' },
    { label: 'Total Books', value: stats?.totalBooks ?? '—', Icon: BookOpen, color: 'text-purple-400', bg: 'from-purple-500/10' },
    { label: 'Total Orders', value: stats?.totalOrders ?? '—', Icon: ShoppingBag, color: 'text-emerald-400', bg: 'from-emerald-500/10' },
    { label: 'Pending Reports', value: stats?.pendingReports ?? '—', Icon: AlertTriangle, color: 'text-red-400', bg: 'from-red-500/10' },
    { label: 'Total Revenue', value: stats?.revenue ? formatPrice(stats.revenue) : '—', Icon: DollarSign, color: 'text-emerald-400', bg: 'from-emerald-500/10' },
  ]

  const navCards = [
    { label: 'User Management', href: '/admin/users', Icon: Users, desc: 'Manage accounts, verify sellers, block users' },
    { label: 'Book Moderation', href: '/admin/listings', Icon: BookOpen, desc: 'Approve, reject, and remove listings' },
    { label: 'Reports', href: '/admin/reports', Icon: AlertTriangle, desc: `${stats?.pendingReports || 0} pending reports` },
    { label: 'Orders', href: '/admin/orders', Icon: ShoppingBag, desc: 'Monitor all platform orders' },
    { label: 'Payments', href: '/admin/payments', Icon: DollarSign, desc: 'Commissions, payouts, refunds' },
    { label: 'Analytics', href: '/admin/analytics', Icon: TrendingUp, desc: 'Platform insights and trends' },
  ]

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
            <Shield size={18} className="text-blue-400" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-cream">Admin Dashboard</h1>
            <p className="text-white/40 text-xs">Platform management &amp; oversight</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {statCards.map(({ label, value, Icon, color, bg }) => (
            <div key={label} className={`glass rounded-2xl p-5 border border-white/5 bg-gradient-to-b ${bg} to-transparent`}>
              <Icon size={20} className={`${color} mb-3`} />
              <div className="font-bold text-cream text-2xl">{value}</div>
              <div className="text-white/40 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {navCards.map(({ label, href, Icon, desc }) => (
            <Link key={label} href={href}
              className="glass rounded-2xl p-5 border border-white/5 hover:border-blue-500/20 transition-all group flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center group-hover:bg-blue-500/10 transition-colors flex-shrink-0">
                <Icon size={16} className="text-blue-400/60 group-hover:text-blue-400 transition-colors" />
              </div>
              <div className="flex-1">
                <div className="text-cream font-medium text-sm mb-0.5">{label}</div>
                <div className="text-white/30 text-xs">{desc}</div>
              </div>
              <ChevronRight size={13} className="text-white/20 group-hover:text-white/40 mt-1 flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
