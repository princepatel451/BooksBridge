'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Heart, Trash2, BookOpen, ShoppingCart, ArrowDown } from 'lucide-react'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface WishlistItem { id: string; bookId: string; priceAtSave: number; book: { id: string; title: string; author: string; sellingPrice: number; marketPrice: number; status: string; images: { imageUrl: string }[]; seller: { fullName: string } } }

export default function WishlistPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => { if (!loading && !user) router.push('/auth/login') }, [user, loading])
  useEffect(() => {
    fetch('/api/wishlist').then(r => r.json()).then(d => { if (d.success) setItems(d.data.items) }).finally(() => setDataLoading(false))
  }, [])

  const remove = async (bookId: string) => {
    try {
      const res = await fetch('/api/wishlist', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookId }) })
      const data = await res.json()
      if (data.success) {
        setItems(prev => prev.filter(i => i.bookId !== bookId))
        toast.success('Removed from wishlist!')
      } else {
        toast.error(data.error || 'Failed to remove from wishlist')
      }
    } catch {
      toast.error('Network error removing item')
    }
  }

  const addToCart = async (bookId: string) => {
    try {
      const res = await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookId }) })
      const data = await res.json()
      if (res.status === 401) {
        router.push('/auth/login')
        return
      }
      if (data.success) {
        toast.success('Added to cart!')
      } else {
        toast.error(data.error || 'Failed to add to cart')
      }
    } catch {
      toast.error('Network error adding to cart')
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display text-3xl font-bold text-cream mb-8 flex items-center gap-3">
          <Heart size={24} className="text-red-400" /> Wishlist
        </h1>

        {dataLoading ? (
          <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="glass rounded-2xl h-24 shimmer" />)}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 glass rounded-3xl border border-white/5">
            <Heart size={48} className="text-white/10 mx-auto mb-4" />
            <div className="text-white/40 text-lg font-medium mb-2">Your wishlist is empty</div>
            <Link href="/books" className="btn-gold px-7 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2 mt-4">
              <BookOpen size={14} /> Browse Books
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => {
              const { percent } = calculateDiscount(item.book.marketPrice, item.book.sellingPrice)
              const priceDrop = item.priceAtSave > item.book.sellingPrice
              return (
                <div key={item.id} className="glass rounded-2xl p-4 border border-white/5 flex items-center gap-4">
                  <Link href={`/books/${item.book.id}`} className="w-14 h-16 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                    {item.book.images[0] ? <img src={item.book.images[0].imageUrl} alt="" className="w-full h-full object-cover" /> : <BookOpen size={16} className="text-white/10 m-auto mt-4" />}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/books/${item.book.id}`} className="font-semibold text-cream text-sm hover:text-gold line-clamp-1">{item.book.title}</Link>
                    <div className="text-white/40 text-xs">{item.book.author}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-gold-light font-bold text-sm">{formatPrice(item.book.sellingPrice)}</span>
                      {priceDrop && (
                        <span className="badge badge-green py-0.5 flex items-center gap-0.5"><ArrowDown size={9} />Price dropped!</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => addToCart(item.bookId)} className="w-8 h-8 glass rounded-xl flex items-center justify-center text-white/40 hover:text-gold transition-colors">
                      <ShoppingCart size={13} />
                    </button>
                    <button onClick={() => remove(item.bookId)} className="w-8 h-8 glass rounded-xl flex items-center justify-center text-white/40 hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
