'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Search, ArrowRight, ShieldCheck, Package, Star, TrendingUp, Users, Percent, GraduationCap, Stethoscope, Landmark, Code, Calculator, ChevronDown, ChevronUp, Award, Trophy, Shield, FileText, Layers, Scale, Lightbulb, BookCheck, ChevronRight } from 'lucide-react'
import { BookCard } from '@/components/ui/BookCard'
import { BookCardSkeleton } from '@/components/ui/Skeleton'

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
  { icon: BookCheck, title: 'Get a Buyer', desc: 'Buyers discover your listing. Accept orders from your dashboard.' },
  { icon: TrendingUp, title: 'Get Paid', desc: 'We handle pickup. Money is transferred to your bank within 3 days.' },
]

const TESTIMONIALS = [
  { name: 'Arjun Sharma', college: 'IIT Bombay', rating: 5, text: 'Saved ₹3,200 on my JEE Advanced books. The condition was exactly as described. Will buy again!' },
  { name: 'Priya Nair', college: 'AIIMS Delhi', rating: 5, text: 'Sold all my NEET books in 3 days and got ₹4,500. Much better than selling to a local store.' },
  { name: 'Rahul Gupta', college: 'Delhi University', rating: 5, text: 'The UPSC books I got were in excellent condition. The chat feature to negotiate was very helpful.' },
]

export default function Home() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([])
  const [allBooks, setAllBooks] = useState<Book[]>([])
  const [loadingTrending, setLoadingTrending] = useState(true)
  const [loadingAllBooks, setLoadingAllBooks] = useState(true)
  const [categoriesExpanded, setCategoriesExpanded] = useState(false)

  useEffect(() => {
    // Fetch Trending
    fetch('/api/books/trending')
      .then(r => r.json())
      .then(d => { if (d.success) setTrendingBooks(d.data.books.slice(0, 4)) })
      .finally(() => setLoadingTrending(false))

    // Fetch All Books
    fetch('/api/books?limit=8')
      .then(r => r.json())
      .then(d => { if (d.success) setAllBooks(d.data.books) })
      .finally(() => setLoadingAllBooks(false))
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) router.push(`/books?search=${encodeURIComponent(searchQuery)}`)
  }

  // Categories rendering list based on toggle
  const renderedCategories = categoriesExpanded ? CATEGORIES : CATEGORIES.slice(0, 5)

  return (
    <div className="bg-hero">
      {/* ── HERO ─────────────────────────────── */}
      <section 
        className="relative min-h-[90vh] flex items-center overflow-hidden pt-16 bg-cover bg-center" 
        style={{ backgroundImage: "linear-gradient(to bottom, rgba(10, 10, 15, 0.82), rgba(10, 10, 15, 0.9)), url('/library_hero_bg.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-blue-500/5 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
          <div className="max-w-3xl mx-auto text-center">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-1.5 text-xs font-medium text-gold mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-gold" />
              India&apos;s #1 Student Book Marketplace
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.12] mb-6 text-cream">
              Smart savings on student essentials
            </h1>

            <p className="text-white/60 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Join thousands of students across 500+ universities buying and selling textbooks directly to their peers.
            </p>

            {/* Search Pill */}
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-12">
              <div className="flex gap-2 bg-cream rounded-full p-1.5 shadow-2xl shadow-ink/80 border border-white/20 items-center justify-between">
                <div className="flex-1 flex items-center gap-3 px-4">
                  <Search size={18} className="text-ink/40 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by title, author, or ISBN..."
                    className="bg-transparent text-sm text-ink placeholder-ink/40 font-medium outline-none flex-1 py-2"
                  />
                </div>
                <button type="submit" className="bg-[#1A2E5C] text-white hover:bg-[#253f7c] rounded-full px-8 py-3.5 text-xs font-bold font-sans uppercase tracking-wider transition-all">
                  Search
                </button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
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
      </section>

      {/* ── STATS ─────────────────────────────── */}
      <section className="py-16 border-y border-white/5 bg-ink-soft/40 backdrop-blur-md">
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

      {/* ── BROWSE BY EXAM & STREAM ─────────────── */}
      <section id="categories" className="py-20 border-b border-white/5 bg-gradient-to-b from-transparent to-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-10 flex items-center gap-3 justify-center md:justify-start">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-cream">Browse by Exam & Stream</h2>
            {categoriesExpanded && (
              <span className="text-white/30 text-xs font-sans mt-2 hidden sm:inline">(Showing all categories)</span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 transition-all duration-300">
            {/* Render initial 5 or all 14 categories */}
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
        </div>
      </section>

      {/* ── ALL BOOKS CATALOG SECTION ───────────── */}
      <section className="py-20 border-b border-white/5 bg-ink-soft/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="badge badge-gold mb-3">Complete Catalog</div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream">All Books</h2>
              <p className="text-white/40 mt-2">Explore recently listed books across all categories</p>
            </div>
            <Link href="/books" className="flex items-center gap-2 text-gold text-sm font-medium hover:gap-3 transition-all">
              View All Books <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loadingAllBooks
              ? Array(8).fill(0).map((_, i) => <BookCardSkeleton key={i} />)
              : allBooks.length > 0
              ? allBooks.map(book => <BookCard key={book.id} book={book} />)
              : <div className="col-span-4 text-center py-16 text-white/30 text-sm">No books available. Be the first to list!</div>
            }
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
            <Link href="/books?sort=views" className="flex items-center gap-2 text-gold text-sm font-medium hover:gap-3 transition-all">
              View Popular <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loadingTrending
              ? Array(4).fill(0).map((_, i) => <BookCardSkeleton key={i} />)
              : trendingBooks.length > 0
              ? trendingBooks.map(book => <BookCard key={book.id} book={book} />)
              : <div className="col-span-4 text-center py-16 text-white/30 text-sm">No trending books yet.</div>
            }
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────── */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-transparent to-white/[0.01]">
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
              { icon: ShieldCheck, title: 'Verified Sellers', desc: 'ID-verified sellers for guaranteed trust', color: 'text-blue-400', bg: 'from-blue-500/10 to-transparent' },
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
      <section className="py-20 bg-gradient-to-b from-white/[0.01] to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="badge badge-gold mb-3">Reviews</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream">What Students Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="glass rounded-2xl p-6 border border-white/5 hover-lift">
                <TrendingUp size={24} className="text-gold/30 mb-4" />
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
