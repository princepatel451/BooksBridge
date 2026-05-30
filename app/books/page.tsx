'use client'
import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, X, ChevronDown, Grid, List } from 'lucide-react'
import { BookCard } from '@/components/ui/BookCard'
import { BookCardSkeleton } from '@/components/ui/Skeleton'

const EXAMS = ['JEE', 'NEET', 'UPSC', 'GATE', 'SSC', 'CAT', 'CDS', 'Others']
const CONDITIONS = [{ val: '', label: 'Any' }, { val: 'new', label: 'Like New (9-10)' }, { val: 'likenew', label: 'Good (7-8)' }, { val: 'good', label: 'Acceptable (5-6)' }, { val: 'old', label: 'Old (1-4)' }]
const SORTS = [{ val: 'latest', label: 'Latest First' }, { val: 'price_asc', label: 'Price: Low to High' }, { val: 'price_desc', label: 'Price: High to Low' }, { val: 'views', label: 'Most Popular' }]

interface Book { id: string; title: string; author: string; edition?: string; examCategory: string; conditionScore: number; marketPrice: number; sellingPrice: number; city: string; images: { imageUrl: string }[]; seller: { id: string; fullName: string; sellerProfile?: { avgRating: number; verificationStatus: string } } }

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState({ search: '', exam: '', condition: '', minPrice: '', maxPrice: '', sort: 'latest' })

  const fetchBooks = async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '12' })
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    const res = await fetch(`/api/books?${params}`)
    const data = await res.json()
    if (data.success) { setBooks(data.data.books); setTotal(data.data.total); setPages(data.data.pages) }
    setLoading(false)
  }

  useEffect(() => { fetchBooks() }, [filters, page])
  const setFilter = (k: string, v: string) => { setFilters(f => ({ ...f, [k]: v })); setPage(1) }
  const clearFilters = () => { setFilters({ search: '', exam: '', condition: '', minPrice: '', maxPrice: '', sort: 'latest' }); setPage(1) }
  const activeFilters = Object.entries(filters).filter(([k, v]) => v && k !== 'sort').length

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="border-b border-white/5 bg-ink/60 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex-1 relative max-w-lg">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={filters.search} onChange={e => setFilter('search', e.target.value)}
                className="input-dark w-full pl-11 pr-4 py-2.5 rounded-xl text-sm" placeholder="Search books, author, exam..." />
            </div>
            {/* Filter toggle */}
            <button onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filtersOpen ? 'btn-gold' : 'glass border border-white/8 text-white/60 hover:text-cream'}`}>
              <SlidersHorizontal size={14} />
              Filters
              {activeFilters > 0 && <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{activeFilters}</span>}
            </button>
            {/* Sort */}
            <div className="relative">
              <select value={filters.sort} onChange={e => setFilter('sort', e.target.value)}
                className="input-dark pl-3 pr-8 py-2.5 rounded-xl text-sm appearance-none cursor-pointer">
                {SORTS.map(s => <option key={s.val} value={s.val} className="bg-ink">{s.label}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            </div>
          </div>

          {/* Filter Panel */}
          {filtersOpen && (
            <div className="mt-4 glass rounded-2xl p-5 border border-white/8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-cream">Filters</span>
                {activeFilters > 0 && (
                  <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                    <X size={11} /> Clear All
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-white/40 mb-2 block">Exam</label>
                  <div className="flex flex-wrap gap-1.5">
                    {EXAMS.map(e => (
                      <button key={e} onClick={() => setFilter('exam', filters.exam === e ? '' : e)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${filters.exam === e ? 'badge-gold border-gold/30 bg-gold/10' : 'border-white/10 text-white/40 hover:text-cream hover:border-white/20'}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-2 block">Condition</label>
                  <div className="space-y-1.5">
                    {CONDITIONS.map(c => (
                      <button key={c.val} onClick={() => setFilter('condition', c.val)}
                        className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-all ${filters.condition === c.val ? 'bg-gold/10 text-gold' : 'text-white/40 hover:text-cream hover:bg-white/5'}`}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-white/40 mb-2 block">Price Range (₹)</label>
                  <div className="flex items-center gap-3">
                    <input type="number" value={filters.minPrice} onChange={e => setFilter('minPrice', e.target.value)}
                      className="input-dark flex-1 px-3 py-2 rounded-xl text-sm" placeholder="Min" />
                    <span className="text-white/30 text-sm">to</span>
                    <input type="number" value={filters.maxPrice} onChange={e => setFilter('maxPrice', e.target.value)}
                      className="input-dark flex-1 px-3 py-2 rounded-xl text-sm" placeholder="Max" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Books Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <span className="text-white/40 text-sm">{loading ? 'Loading...' : `${total} books found`}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading ? Array(12).fill(0).map((_, i) => <BookCardSkeleton key={i} />)
            : books.length > 0 ? books.map(b => <BookCard key={b.id} book={b} />)
            : (
              <div className="col-span-4 text-center py-24">
                <div className="text-white/20 text-6xl mb-4">📚</div>
                <div className="text-white/40 text-lg font-medium mb-2">No books found</div>
                <div className="text-white/25 text-sm">Try adjusting your filters</div>
              </div>
            )
          }
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {Array.from({ length: Math.min(pages, 7) }).map((_, i) => {
              const p = i + 1
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === p ? 'btn-gold' : 'glass text-white/50 hover:text-cream'}`}>
                  {p}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
