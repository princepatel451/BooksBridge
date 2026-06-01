'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Search, BookOpen, TrendingUp, MapPin, Clock, Percent, ChevronRight, Bell, ShoppingCart } from 'lucide-react'
import { BookCard } from '@/components/ui/BookCard'
import { BookCardSkeleton } from '@/components/ui/Skeleton'
import Link from 'next/link'

const EXAM_QUICK = ['JEE', 'NEET', 'UPSC', 'GATE', 'SSC', 'CAT']

interface Book { id: string; title: string; author: string; edition?: string; examCategory: string; conditionScore: number; marketPrice: number; sellingPrice: number; city: string; images: { imageUrl: string }[]; seller: { id: string; fullName: string; sellerProfile?: { avgRating: number; verificationStatus: string } } }

export default function DashboardPage() {
  const { user, loading } = useAuth()
  console.log("Dashboard Render")
  console.log("User:", user)
  console.log("Loading:", loading)
  
  const router = useRouter()
  const [trending, setTrending] = useState<Book[]>([])
  const [nearby, setNearby] = useState<Book[]>([])
  const [recent, setRecent] = useState<Book[]>([])
  const [search, setSearch] = useState('')
  const [booksLoading, setBooksLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [user, loading])

  useEffect(() => {
    Promise.all([
      fetch('/api/books/trending').then(r => r.json()),
      fetch('/api/books?limit=6&sort=latest').then(r => r.json()),
    ]).then(([t, rec]) => {
      if (t.success) setTrending(t.data.books.slice(0, 4))
      if (rec.success) { setNearby(rec.data.books.slice(0, 4)); setRecent(rec.data.books.slice(0, 4)) }
    }).finally(() => setBooksLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="text-white/40 text-sm mb-1">Welcome back</div>
            <h1 className="font-display text-2xl font-bold text-cream">{user?.fullName?.split(' ')[0]} 👋</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/notifications" className="w-10 h-10 glass rounded-xl flex items-center justify-center text-white/40 hover:text-cream transition-colors">
              <Bell size={16} />
            </Link>
            <Link href="/cart" className="w-10 h-10 glass rounded-xl flex items-center justify-center text-white/40 hover:text-cream transition-colors">
              <ShoppingCart size={16} />
            </Link>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={e => { e.preventDefault(); if (search.trim()) router.push(`/books?search=${search}`) }}
          className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input-dark w-full pl-12 pr-32 py-3.5 rounded-2xl text-sm"
            placeholder="Search any book, author, exam..." />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-gold px-5 py-2 rounded-xl text-xs font-semibold">Search</button>
        </form>

        {/* Exam filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-10 scrollbar-hide">
          {EXAM_QUICK.map(e => (
            <Link key={e} href={`/books?exam=${e}`}
              className="flex-shrink-0 glass rounded-full px-5 py-2 text-xs font-medium text-white/50 hover:text-gold border border-white/8 hover:border-gold/30 transition-all">
              {e}
            </Link>
          ))}
          <Link href="/books" className="flex-shrink-0 glass rounded-full px-5 py-2 text-xs font-medium text-gold/60 border border-gold/20 hover:border-gold/40 transition-all">
            All Categories →
          </Link>
        </div>

        {/* Sections */}
        {[
          { title: 'Trending Books', icon: TrendingUp, books: trending, href: '/books?sort=views' },
          { title: 'Recently Added', icon: Clock, books: recent, href: '/books?sort=latest' },
        ].map(({ title, icon: Icon, books, href }) => (
          <section key={title} className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg glass flex items-center justify-center">
                  <Icon size={14} className="text-gold" />
                </div>
                <h2 className="font-semibold text-cream">{title}</h2>
              </div>
              <Link href={href} className="text-xs text-gold/70 hover:text-gold flex items-center gap-1">
                View All <ChevronRight size={11} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {booksLoading ? Array(4).fill(0).map((_, i) => <BookCardSkeleton key={i} />)
                : books.length > 0 ? books.map(b => <BookCard key={b.id} book={b} />)
                : <div className="col-span-4 text-center py-8 text-white/25 text-sm">No books yet</div>
              }
            </div>
          </section>
        ))}

        {/* Seller CTA */}
        {!user?.isSeller && (
          <div className="glass-gold rounded-2xl p-7 flex items-center justify-between gap-6">
            <div>
              <div className="font-display text-lg font-bold text-cream mb-1.5">Have books to sell?</div>
              <p className="text-white/40 text-sm">List your old books in minutes and earn money.</p>
            </div>
            <Link href="/seller/onboard" className="flex-shrink-0 btn-gold px-6 py-2.5 rounded-xl text-sm font-semibold">
              Start Selling
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
