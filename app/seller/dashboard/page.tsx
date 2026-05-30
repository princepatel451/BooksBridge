'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { TrendingUp, BookOpen, Package, DollarSign, Star, Plus, ChevronRight, Eye, ShoppingBag } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import Link from 'next/link'

interface SellerStats {
  totalListings: number; activeListings: number; soldBooks: number
  pendingOrders: number; totalEarnings: number; avgRating: number; pendingPayout: number
}
interface Listing {
  id: string; title: string; sellingPrice: number; status: string
  viewCount: number; createdAt: string; images: { imageUrl: string }[]
}

export default function SellerDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<SellerStats | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) { router.push('/auth/login'); return }
    if (!loading && user && !user.isSeller) router.push('/seller/onboard')
  }, [user, loading])

  useEffect(() => {
    if (!user?.isSeller) return
    Promise.all([
      fetch('/api/seller/dashboard').then(r => r.json()),
      fetch('/api/books?limit=6').then(r => r.json()),
    ]).then(([s, b]) => {
      if (s.success) setStats(s.data)
      if (b.success) setListings(b.data.books)
    }).finally(() => setDataLoading(false))
  }, [user])

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  )

  const statCards = [
    { label: 'Total Listings', value: stats?.totalListings ?? '—', Icon: BookOpen, color: 'text-blue-400', bg: 'from-blue-500/10' },
    { label: 'Active', value: stats?.activeListings ?? '—', Icon: Eye, color: 'text-emerald-400', bg: 'from-emerald-500/10' },
    { label: 'Books Sold', value: stats?.soldBooks ?? '—', Icon: ShoppingBag, color: 'text-gold', bg: 'from-gold/10' },
    { label: 'Pending Orders', value: stats?.pendingOrders ?? '—', Icon: Package, color: 'text-orange-400', bg: 'from-orange-500/10' },
    { label: 'Total Earnings', value: stats ? formatPrice(stats.totalEarnings) : '—', Icon: DollarSign, color: 'text-emerald-400', bg: 'from-emerald-500/10' },
    { label: 'Pending Payout', value: stats ? formatPrice(stats.pendingPayout) : '—', Icon: TrendingUp, color: 'text-gold', bg: 'from-gold/10' },
    { label: 'Avg Rating', value: stats?.avgRating ? `${stats.avgRating.toFixed(1)}★` : 'N/A', Icon: Star, color: 'text-gold', bg: 'from-gold/10' },
  ]

  const navItems = [
    { label: 'My Listings', href: '/seller/books', Icon: BookOpen },
    { label: 'Orders', href: '/seller/orders', Icon: Package },
    { label: 'Earnings', href: '/seller/earnings', Icon: DollarSign },
    { label: 'Analytics', href: '/seller/analytics', Icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="badge badge-gold mb-2">Seller Dashboard</div>
            <h1 className="font-display text-3xl font-bold text-cream">
              Welcome, {user.fullName.split(' ')[0]}
            </h1>
          </div>
          <Link href="/seller/books/add" className="btn-gold px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
            <Plus size={15} /> Add Book
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, Icon, color, bg }) => (
            <div key={label} className={`glass rounded-2xl p-5 border border-white/5 bg-gradient-to-b ${bg} to-transparent`}>
              <Icon size={18} className={`${color} mb-3`} />
              <div className="font-bold text-cream text-xl">{value}</div>
              <div className="text-white/40 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {navItems.map(({ label, href, Icon }) => (
            <Link key={label} href={href}
              className="glass rounded-xl p-4 border border-white/5 hover:border-gold/20 transition-all group flex items-center gap-3">
              <Icon size={15} className="text-gold/60 group-hover:text-gold transition-colors" />
              <span className="text-cream text-sm font-medium">{label}</span>
              <ChevronRight size={12} className="text-white/20 ml-auto group-hover:text-white/40" />
            </Link>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-cream">Recent Listings</h2>
            <Link href="/seller/books" className="text-xs text-gold/70 hover:text-gold flex items-center gap-1">
              View All <ChevronRight size={11} />
            </Link>
          </div>
          {dataLoading ? (
            <div className="space-y-2">
              {Array(4).fill(0).map((_, i) => <div key={i} className="glass rounded-xl h-16 shimmer" />)}
            </div>
          ) : listings.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center border border-white/5">
              <BookOpen size={40} className="text-white/10 mx-auto mb-3" />
              <div className="text-white/40 mb-3">No listings yet</div>
              <Link href="/seller/books/add" className="btn-gold px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
                <Plus size={13} /> Add Your First Book
              </Link>
            </div>
          ) : (
            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
              {listings.map((book, i) => (
                <div key={book.id} className={`flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors ${i < listings.length - 1 ? 'border-b border-white/5' : ''}`}>
                  <div className="w-10 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                    {book.images[0]
                      ? <img src={book.images[0].imageUrl} alt="" className="w-full h-full object-cover" />
                      : <BookOpen size={14} className="text-white/10 m-auto mt-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-cream text-sm font-medium line-clamp-1">{book.title}</div>
                    <div className="text-white/30 text-xs mt-0.5">{book.viewCount} views · {formatDate(book.createdAt)}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-gold-light font-semibold text-sm">{formatPrice(book.sellingPrice)}</div>
                    <div className={`text-xs mt-0.5 ${book.status === 'ACTIVE' ? 'text-emerald-400' : book.status === 'SOLD' ? 'text-white/30' : 'text-amber-400'}`}>
                      {book.status}
                    </div>
                  </div>
                  <Link href={`/seller/books/${book.id}/edit`} className="text-white/25 hover:text-white/50 text-xs">Edit</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
