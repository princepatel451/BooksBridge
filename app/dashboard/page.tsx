'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Search, BookOpen, TrendingUp, Clock, ChevronRight, Bell, ShoppingCart, GraduationCap, Stethoscope, Landmark, Code, Calculator, ChevronDown, ChevronUp, Award, Trophy, Shield, FileText, Layers, Scale, Lightbulb, Percent } from 'lucide-react'
import { BookCard } from '@/components/ui/BookCard'
import { BookCardSkeleton } from '@/components/ui/Skeleton'
import Link from 'next/link'

const CATEGORIES = [
  { name: 'JEE MAIN', icon: GraduationCap, color: 'glass bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/10 hover:border-blue-500/30 text-blue-400', iconColor: 'text-blue-400' },
  { name: 'NEET UG', icon: Stethoscope, color: 'glass bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/10 hover:border-emerald-500/30 text-emerald-400', iconColor: 'text-emerald-400' },
  { name: 'UPSC CIVIL', icon: Landmark, color: 'glass bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/10 hover:border-amber-500/30 text-amber-400', iconColor: 'text-amber-400' },
  { name: 'CS & IT', icon: Code, color: 'glass bg-indigo-500/5 hover:bg-indigo-500/10 border-indigo-500/10 hover:border-indigo-500/30 text-indigo-400', iconColor: 'text-indigo-400' },
  { name: 'COMMERCE', icon: Calculator, color: 'glass bg-teal-500/5 hover:bg-teal-500/10 border-teal-500/10 hover:border-teal-500/30 text-teal-400', iconColor: 'text-teal-400' },
  { name: 'GATE', icon: Award, color: 'glass bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/10 hover:border-rose-500/30 text-rose-400', iconColor: 'text-rose-400' },
  { name: 'CAT', icon: Trophy, color: 'glass bg-fuchsia-500/5 hover:bg-fuchsia-500/10 border-fuchsia-500/10 hover:border-fuchsia-500/30 text-fuchsia-400', iconColor: 'text-fuchsia-400' },
  { name: 'NDA', icon: Shield, color: 'glass bg-orange-500/5 hover:bg-orange-500/10 border-orange-500/10 hover:border-orange-500/30 text-orange-400', iconColor: 'text-orange-400' },
  { name: 'SSC CGL', icon: FileText, color: 'glass bg-sky-500/5 hover:bg-sky-500/10 border-sky-500/10 hover:border-sky-500/30 text-sky-400', iconColor: 'text-sky-400' },
  { name: 'SSC CHSL', icon: Layers, color: 'glass bg-pink-500/5 hover:bg-pink-500/10 border-pink-500/10 hover:border-pink-500/30 text-pink-400', iconColor: 'text-pink-400' },
  { name: 'CLAT', icon: Scale, color: 'glass bg-red-500/5 hover:bg-red-500/10 border-red-500/10 hover:border-red-500/30 text-red-400', iconColor: 'text-red-400' },
  { name: 'CA', icon: Percent, color: 'glass bg-lime-500/5 hover:bg-lime-500/10 border-lime-500/10 hover:border-lime-500/30 text-lime-400', iconColor: 'text-lime-400' },
  { name: 'UGC NET', icon: Lightbulb, color: 'glass bg-violet-500/5 hover:bg-violet-500/10 border-violet-500/10 hover:border-violet-500/30 text-violet-400', iconColor: 'text-violet-400' },
  { name: 'OTHERS', icon: BookOpen, color: 'glass bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/30 text-white/50', iconColor: 'text-white/60' },
]

interface Book { id: string; title: string; author: string; edition?: string; examCategory: string; conditionScore: number; marketPrice: number; sellingPrice: number; city: string; images: { imageUrl: string }[]; seller: { id: string; fullName: string; sellerProfile?: { avgRating: number; verificationStatus: string } } }

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [trending, setTrending] = useState<Book[]>([])
  const [recent, setRecent] = useState<Book[]>([])
  const [search, setSearch] = useState('')
  const [booksLoading, setBooksLoading] = useState(true)
  const [categoriesExpanded, setCategoriesExpanded] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [user, loading])

  useEffect(() => {
    Promise.all([
      fetch('/api/books/trending').then(r => r.json()),
      fetch('/api/books?limit=8&sort=latest').then(r => r.json()),
    ]).then(([t, rec]) => {
      if (t.success) setTrending(t.data.books.slice(0, 4))
      if (rec.success) setRecent(rec.data.books)
    }).finally(() => setBooksLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  )

  const renderedCategories = categoriesExpanded ? CATEGORIES : CATEGORIES.slice(0, 5)

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ── PREMIUM WARM HERO HEADER ─────────────────────────────── */}
        <section 
          className="relative rounded-3xl overflow-hidden mb-12 p-8 sm:p-12 shadow-2xl border border-white/5 bg-cover bg-center"
          style={{ backgroundImage: "linear-gradient(to bottom, rgba(10, 10, 15, 0.78), rgba(10, 10, 15, 0.9)), url('/library_hero_bg.png')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-blue-500/5 pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto text-center py-4">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-cream mb-4">
              Smart savings on student essentials
            </h1>
            <p className="text-white/50 text-sm sm:text-base max-w-lg mx-auto mb-8 leading-relaxed">
              Search HC Verma, Laxmikant, R.S. Aggarwal, or browse by your exam stream below.
            </p>

            {/* Centered inline white pill search input */}
            <form onSubmit={e => { e.preventDefault(); if (search.trim()) router.push(`/books?search=${search}`) }} 
              className="relative max-w-xl mx-auto">
              <div className="flex gap-2 bg-cream rounded-full p-1.5 shadow-2xl items-center justify-between border border-white/10">
                <div className="flex-1 flex items-center gap-3 px-4">
                  <Search size={18} className="text-ink/40 flex-shrink-0" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search HC Verma, Laxmikant, R.S. Aggarwal..."
                    className="bg-transparent text-sm text-ink placeholder-ink/40 font-medium outline-none flex-1 py-2"
                  />
                </div>
                <button type="submit" className="bg-[#1A2E5C] text-white hover:bg-[#253f7c] rounded-full px-6 py-2.5 text-xs font-bold font-sans uppercase tracking-wider transition-all">
                  Search
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* ── BROWSE BY EXAM & STREAM ─────────────── */}
        <section id="categories" className="mb-12 border-b border-white/5 pb-10">
          <div className="mb-8 flex items-center gap-3 justify-start">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-cream">Browse by Exam & Stream</h2>
            {categoriesExpanded && (
              <span className="text-white/30 text-xs font-sans mt-1.5 hidden sm:inline">(Showing all categories)</span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 transition-all duration-300">
            {renderedCategories.map(cat => (
              <Link key={cat.name} href={`/books?exam=${cat.name}`}
                className={`group rounded-2xl p-5 text-center border hover:scale-105 transition-all duration-200 flex flex-col items-center justify-center ${cat.color}`}>
                <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center mb-3 group-hover:scale-110 transition-transform bg-white/5">
                  <cat.icon size={20} className={cat.iconColor} />
                </div>
                <div className="font-bold text-cream text-xs tracking-wider uppercase">{cat.name}</div>
              </Link>
            ))}

            {/* Toggle Switch Tile */}
            <button 
              onClick={() => setCategoriesExpanded(!categoriesExpanded)}
              className="group rounded-2xl p-5 text-center border glass bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/30 hover:scale-105 transition-all duration-200 flex flex-col items-center justify-center text-white/50"
            >
              <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center mb-3 group-hover:scale-110 transition-transform bg-white/5">
                {categoriesExpanded ? <ChevronUp size={20} className="text-white/60" /> : <ChevronDown size={20} className="text-white/60" />}
              </div>
              <div className="font-bold text-cream text-xs tracking-wider uppercase">
                {categoriesExpanded ? 'Show Less' : 'View All'}
              </div>
            </button>
          </div>
        </section>

        {/* ── TRENDING BOOKS SECTION ─────────────────────── */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg glass flex items-center justify-center">
                <TrendingUp size={14} className="text-gold" />
              </div>
              <h2 className="font-semibold text-cream">Trending Books</h2>
            </div>
            <Link href="/books?sort=views" className="text-xs text-gold/70 hover:text-gold flex items-center gap-1">
              View All <ChevronRight size={11} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {booksLoading ? Array(4).fill(0).map((_, i) => <BookCardSkeleton key={i} />)
              : trending.length > 0 ? trending.map(b => <BookCard key={b.id} book={b} />)
              : <div className="col-span-4 text-center py-8 text-white/25 text-sm">No trending books yet</div>
            }
          </div>
        </section>

        {/* ── ALL BOOKS catalog / RECENT SECTION ───────────── */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg glass flex items-center justify-center">
                <Clock size={14} className="text-gold" />
              </div>
              <h2 className="font-semibold text-cream">Recently Added</h2>
            </div>
            <Link href="/books?sort=latest" className="text-xs text-gold/70 hover:text-gold flex items-center gap-1">
              View All <ChevronRight size={11} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {booksLoading ? Array(4).fill(0).map((_, i) => <BookCardSkeleton key={i} />)
              : recent.length > 0 ? recent.slice(0, 8).map(b => <BookCard key={b.id} book={b} />)
              : <div className="col-span-4 text-center py-8 text-white/25 text-sm">No books yet</div>
            }
          </div>
        </section>

        {/* Seller Onboard Call to Action Banner */}
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
