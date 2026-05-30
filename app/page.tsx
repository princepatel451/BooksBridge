'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { BookOpen, Search, ArrowRight, ShieldCheck, Package, Star, TrendingUp, Users, Zap, ChevronRight, Quote, BadgeCheck, Percent, MapPin } from 'lucide-react'
import { BookCard } from '@/components/ui/BookCard'
import { BookCardSkeleton } from '@/components/ui/Skeleton'
import { formatPrice } from '@/lib/utils'

const EXAM_CATEGORIES = [
  { name: 'JEE', icon: '⚗', color: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/20', books: '2,400+' },
  { name: 'NEET', icon: '🔬', color: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/20', books: '1,800+' },
  { name: 'UPSC', icon: '🏛', color: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/20', books: '3,200+' },
  { name: 'GATE', icon: '⚙', color: 'from-orange-500/20 to-orange-600/5', border: 'border-orange-500/20', books: '900+' },
  { name: 'SSC', icon: '📋', color: 'from-pink-500/20 to-pink-600/5', border: 'border-pink-500/20', books: '1,100+' },
  { name: 'CAT', icon: '📊', color: 'from-yellow-500/20 to-yellow-600/5', border: 'border-yellow-500/20', books: '600+' },
]

const STATS = [
  { value: '12,000+', label: 'Books Listed', icon: BookOpen },
  { value: '8,500+', label: 'Students Helped', icon: Users },
  { value: '₹85L+', label: 'Saved by Students', icon: Percent },
  { value: '4.8★', label: 'Average Rating', icon: Star },
]

const HOW_IT_WORKS_BUYER = [
  { icon: Search, title: 'Search Your Book', desc: 'Find books by title, author, exam, or subject. Filter by city and price.' },
  { icon: ShieldCheck, title: 'Verify & Connect', desc: 'Check seller ratings, book condition photos, and chat with the seller.' },
  { icon: Package, title: 'Receive at Home', desc: 'We pick up from the seller and deliver safely to your doorstep.' },
]

const HOW_IT_WORKS_SELLER = [
  { icon: BookOpen, title: 'List Your Book', desc: 'Add photos, set your price, and describe the condition in minutes.' },
  { icon: Zap, title: 'Get a Buyer', desc: 'Buyers discover your listing. Accept orders from your dashboard.' },
  { icon: TrendingUp, title: 'Get Paid', desc: 'We handle pickup. Money is transferred to your bank within 3 days.' },
]

const TESTIMONIALS = [
  { name: 'Arjun Sharma', college: 'IIT Bombay', rating: 5, text: 'Saved ₹3,200 on my JEE Advanced books. The condition was exactly as described. Will buy again!' },
  { name: 'Priya Nair', college: 'AIIMS Delhi', rating: 5, text: 'Sold all my NEET books in 3 days and got ₹4,500. Much better than selling to a local store.' },
  { name: 'Rahul Gupta', college: 'Delhi University', rating: 5, text: 'The UPSC books I got were in excellent condition. The chat feature to negotiate was very helpful.' },
]

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([])
  const [loadingTrending, setLoadingTrending] = useState(true)
  const heroRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    fetch('/api/books/trending')
      .then(r => r.json())
      .then(d => { if (d.success) setTrendingBooks(d.data.books) })
      .finally(() => setLoadingTrending(false))
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) window.location.href = `/books?search=${encodeURIComponent(searchQuery)}`
  }

  return (
    <div className="bg-hero">
      {/* ── HERO ─────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* Decorative orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold/8 blur-[120px] pointer-events-none" style={{ transform: `translateY(${scrollY * 0.15}px)` }} />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-blue-500/6 blur-[100px] pointer-events-none" style={{ transform: `translateY(${scrollY * 0.1}px)` }} />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full bg-emerald-500/5 blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="max-w-3xl mx-auto text-center">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-1.5 text-xs font-medium text-gold mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-gold" />
              India&apos;s #1 Student Book Marketplace
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] mb-6">
              <span className="text-cream">Buy & Sell</span>
              <br />
              <span className="text-gold-gradient">Exam Books</span>
              <br />
              <span className="text-cream">at Student Prices</span>
            </h1>

            <p className="text-white/50 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
              Save up to 70% on JEE, NEET, UPSC, GATE books. Connect with students nearby. Earn from books you no longer need.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mb-10">
              <div className="flex gap-2 glass rounded-2xl p-2 border border-white/10">
                <div className="flex-1 flex items-center gap-3 px-3">
                  <Search size={16} className="text-white/30 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search HC Verma, Laxmikant, R.S. Aggarwal..."
                    className="bg-transparent text-sm text-cream placeholder-white/30 outline-none flex-1 py-2"
                  />
                </div>
                <button type="submit" className="btn-gold px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
                  Search
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>

            {/* Exam quick filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {EXAM_CATEGORIES.slice(0, 5).map(cat => (
                <Link key={cat.name} href={`/books?exam=${cat.name}`}
                  className="glass rounded-full px-4 py-1.5 text-xs font-medium text-white/60 hover:text-gold border border-white/5 hover:border-gold/30 transition-all">
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/books" className="btn-gold px-8 py-3.5 rounded-2xl font-semibold flex items-center gap-2 text-sm">
                <BookOpen size={15} />
                Browse Books
              </Link>
              <Link href="/seller/onboard" className="btn-ghost px-8 py-3.5 rounded-2xl font-semibold flex items-center gap-2 text-sm">
                Start Selling
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-40">
          <span className="text-xs text-white/40">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* ── STATS ─────────────────────────────── */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center mx-auto mb-3">
                  <Icon size={18} className="text-gold" />
                </div>
                <div className="font-display text-3xl font-bold text-cream mb-1">{value}</div>
                <div className="text-white/40 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRENDING BOOKS ─────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="badge badge-gold mb-3">Trending Now</div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream">Popular Books</h2>
              <p className="text-white/40 mt-2">Most viewed books this week</p>
            </div>
            <Link href="/books" className="hidden md:flex items-center gap-2 text-gold text-sm font-medium hover:gap-3 transition-all">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loadingTrending
              ? Array(8).fill(0).map((_, i) => <BookCardSkeleton key={i} />)
              : trendingBooks.length > 0
              ? trendingBooks.map(book => <BookCard key={book.id} book={book} />)
              : <div className="col-span-4 text-center py-16 text-white/30 text-sm">No books yet. Be the first to list!</div>
            }
          </div>
        </div>
      </section>

      {/* ── EXAM CATEGORIES ───────────────────── */}
      <section id="categories" className="py-20 bg-gradient-to-b from-transparent to-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="badge badge-gold mb-3">Browse by Exam</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream">Find Books for Your Exam</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {EXAM_CATEGORIES.map(cat => (
              <Link key={cat.name} href={`/books?exam=${cat.name}`}
                className={`group glass rounded-2xl p-5 text-center border ${cat.border} hover:scale-105 transition-all duration-200 bg-gradient-to-br ${cat.color}`}>
                <div className="text-3xl mb-3">{cat.icon}</div>
                <div className="font-bold text-cream text-sm mb-1">{cat.name}</div>
                <div className="text-white/30 text-xs">{cat.books} books</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────── */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div className="badge badge-gold mb-3">Simple Process</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream">How BookBridge Works</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            {/* Buyers */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                  <ShieldCheck size={18} className="text-blue-400" />
                </div>
                <h3 className="font-display text-xl font-bold text-cream">For Buyers</h3>
              </div>
              <div className="space-y-6">
                {HOW_IT_WORKS_BUYER.map(({ icon: Icon, title, desc }, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl glass flex items-center justify-center">
                      <Icon size={16} className="text-gold" />
                    </div>
                    <div>
                      <div className="font-semibold text-cream text-sm mb-1">{title}</div>
                      <div className="text-white/40 text-sm leading-relaxed">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/books" className="inline-flex items-center gap-2 btn-gold mt-8 px-6 py-3 rounded-xl text-sm font-semibold">
                Browse Books <ArrowRight size={14} />
              </Link>
            </div>
            {/* Sellers */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/20 flex items-center justify-center">
                  <TrendingUp size={18} className="text-gold" />
                </div>
                <h3 className="font-display text-xl font-bold text-cream">For Sellers</h3>
              </div>
              <div className="space-y-6">
                {HOW_IT_WORKS_SELLER.map(({ icon: Icon, title, desc }, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl glass flex items-center justify-center">
                      <Icon size={16} className="text-gold" />
                    </div>
                    <div>
                      <div className="font-semibold text-cream text-sm mb-1">{title}</div>
                      <div className="text-white/40 text-sm leading-relaxed">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/seller/onboard" className="inline-flex items-center gap-2 btn-ghost mt-8 px-6 py-3 rounded-xl text-sm font-semibold">
                Start Selling <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY BOOKBRIDGE ─────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="badge badge-gold mb-3">Why Us</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream">Why Students Trust BookBridge</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: BadgeCheck, title: 'Verified Sellers', desc: 'ID-verified sellers for guaranteed trust', color: 'text-blue-400', bg: 'from-blue-500/10 to-transparent' },
              { icon: Percent, title: 'Save 50–80%', desc: 'Books at a fraction of market price', color: 'text-emerald-400', bg: 'from-emerald-500/10 to-transparent' },
              { icon: Package, title: 'Easy Logistics', desc: 'We handle pickup and delivery for you', color: 'text-gold', bg: 'from-gold/10 to-transparent' },
              { icon: ShieldCheck, title: 'Secure Payments', desc: 'Pay only after successful delivery', color: 'text-purple-400', bg: 'from-purple-500/10 to-transparent' },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className={`glass rounded-2xl p-6 border border-white/5 bg-gradient-to-b ${bg} hover-lift`}>
                <Icon size={24} className={`${color} mb-4`} />
                <h4 className="font-semibold text-cream mb-2">{title}</h4>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────── */}
      <section className="py-20 bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="badge badge-gold mb-3">Reviews</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream">What Students Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="glass rounded-2xl p-6 border border-white/5 hover-lift">
                <Quote size={24} className="text-gold/30 mb-4" />
                <p className="text-white/60 text-sm leading-relaxed mb-5">{t.text}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-cream text-sm">{t.name}</div>
                    <div className="text-white/30 text-xs mt-0.5">{t.college}</div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array(t.rating).fill(0).map((_, j) => (
                      <Star key={j} size={12} className="text-gold fill-gold" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SELL CTA BANNER ───────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="glass-gold rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/8 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="font-display text-3xl md:text-4xl font-bold text-cream mb-4">
                Done with your books?<br />
                <span className="text-gold-gradient">Turn them into cash.</span>
              </div>
              <p className="text-white/50 mb-8 max-w-md mx-auto">List for free. We handle pickup and delivery. Get paid directly to your bank account.</p>
              <Link href="/seller/onboard" className="inline-flex items-center gap-2 btn-gold px-8 py-3.5 rounded-2xl font-semibold text-sm">
                Start Selling Today <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

interface Book { id: string; title: string; author: string; edition?: string; examCategory: string; conditionScore: number; marketPrice: number; sellingPrice: number; city: string; images: { imageUrl: string }[]; seller: { id: string; fullName: string; sellerProfile?: { avgRating: number; verificationStatus: string } } }
