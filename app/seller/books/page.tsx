'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Plus, BookOpen, Eye, Edit3, Trash2, Pause, Play, ChevronRight } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import Link from 'next/link'

interface Listing { id: string; title: string; author: string; sellingPrice: number; marketPrice: number; status: string; viewCount: number; createdAt: string; images: { imageUrl: string }[] }

export default function SellerBooksPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [books, setBooks] = useState<Listing[]>([])
  const [booksLoading, setBooksLoading] = useState(true)
  const [tab, setTab] = useState('ACTIVE')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => { if (!loading && !user) router.push('/auth/login') }, [user, loading])

  const fetchBooks = () => {
    setBooksLoading(true)
    fetch(`/api/books?limit=50`).then(r => r.json()).then(d => { if (d.success) setBooks(d.data.books) }).finally(() => setBooksLoading(false))
  }

  useEffect(() => { if (user) fetchBooks() }, [user])

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id)
    await fetch(`/api/books/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    fetchBooks(); setActionLoading(null)
  }

  const deleteBook = async (id: string) => {
    if (!confirm('Delete this listing?')) return
    setActionLoading(id)
    await fetch(`/api/books/${id}`, { method: 'DELETE' })
    fetchBooks(); setActionLoading(null)
  }

  const filtered = books.filter(b => tab === 'ALL' ? true : b.status === tab)

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-7">
          <h1 className="font-display text-2xl font-bold text-cream">My Listings</h1>
          <Link href="/seller/books/add" className="btn-gold px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
            <Plus size={14} /> Add Book
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 glass rounded-xl p-1 mb-6 w-fit">
          {[['ALL', 'All'], ['ACTIVE', 'Active'], ['PAUSED', 'Paused'], ['SOLD', 'Sold']].map(([val, label]) => (
            <button key={val} onClick={() => setTab(val)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${tab === val ? 'btn-gold' : 'text-white/40 hover:text-cream'}`}>{label}</button>
          ))}
        </div>

        {booksLoading ? (
          <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="glass rounded-2xl h-20 shimmer" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 glass rounded-3xl border border-white/5">
            <BookOpen size={44} className="text-white/10 mx-auto mb-3" />
            <div className="text-white/40 mb-4">No {tab.toLowerCase()} listings</div>
            <Link href="/seller/books/add" className="btn-gold px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"><Plus size={13} />Add a Book</Link>
          </div>
        ) : (
          <div className="glass rounded-2xl border border-white/5 overflow-hidden">
            {filtered.map((book, i) => (
              <div key={book.id} className={`flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors ${i < filtered.length - 1 ? 'border-b border-white/5' : ''}`}>
                <div className="w-12 h-14 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                  {book.images[0] ? <img src={book.images[0].imageUrl} alt="" className="w-full h-full object-cover" /> : <BookOpen size={14} className="text-white/10 m-auto mt-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-cream font-medium text-sm line-clamp-1">{book.title}</div>
                  <div className="text-white/35 text-xs mt-0.5">{book.author}</div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-white/30">
                    <span className="flex items-center gap-1"><Eye size={10} />{book.viewCount}</span>
                    <span>{formatDate(book.createdAt)}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-gold-light font-semibold text-sm">{formatPrice(book.sellingPrice)}</div>
                  <div className={`text-xs mt-0.5 ${book.status === 'ACTIVE' ? 'text-emerald-400' : book.status === 'SOLD' ? 'text-white/30' : 'text-amber-400'}`}>{book.status}</div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Link href={`/seller/books/${book.id}/edit`} className="w-7 h-7 glass rounded-lg flex items-center justify-center text-white/30 hover:text-cream transition-colors">
                    <Edit3 size={11} />
                  </Link>
                  {book.status === 'ACTIVE' && (
                    <button onClick={() => updateStatus(book.id, 'PAUSED')} disabled={actionLoading === book.id} className="w-7 h-7 glass rounded-lg flex items-center justify-center text-white/30 hover:text-amber-400 transition-colors">
                      <Pause size={11} />
                    </button>
                  )}
                  {book.status === 'PAUSED' && (
                    <button onClick={() => updateStatus(book.id, 'ACTIVE')} disabled={actionLoading === book.id} className="w-7 h-7 glass rounded-lg flex items-center justify-center text-white/30 hover:text-emerald-400 transition-colors">
                      <Play size={11} />
                    </button>
                  )}
                  <button onClick={() => deleteBook(book.id)} disabled={actionLoading === book.id} className="w-7 h-7 glass rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 transition-colors">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
