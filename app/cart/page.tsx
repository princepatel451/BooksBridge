'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { ShoppingCart, Trash2, ArrowRight, BookOpen, Tag, AlertCircle } from 'lucide-react'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import Link from 'next/link'

interface CartItem {
  id: string; bookId: string
  book: { id: string; title: string; author: string; sellingPrice: number; marketPrice: number; city: string; status: string; images: { imageUrl: string }[]; seller: { fullName: string } }
}

export default function CartPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartLoading, setCartLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)
  const [coupon, setCoupon] = useState('')
  const [couponMsg, setCouponMsg] = useState('')

  useEffect(() => { if (!loading && !user) router.push('/auth/login') }, [user, loading])

  useEffect(() => {
    fetch('/api/cart').then(r => r.json()).then(d => { if (d.success) setCart(d.data.cart) }).finally(() => setCartLoading(false))
  }, [])

  const removeItem = async (bookId: string) => {
    setRemoving(bookId)
    await fetch('/api/cart', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookId }) })
    setCart(c => c.filter(i => i.bookId !== bookId))
    setRemoving(null)
  }

  const subtotal = cart.reduce((sum, i) => sum + i.book.sellingPrice, 0)
  const totalSaved = cart.reduce((sum, i) => sum + (i.book.marketPrice - i.book.sellingPrice), 0)

  if (cartLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display text-3xl font-bold text-cream mb-8 flex items-center gap-3">
          <ShoppingCart size={24} className="text-gold" /> My Cart
          <span className="text-white/30 text-lg font-normal">({cart.length})</span>
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-24 glass rounded-3xl border border-white/5">
            <ShoppingCart size={56} className="text-white/10 mx-auto mb-4" />
            <div className="text-white/40 text-lg font-medium mb-2">Your cart is empty</div>
            <p className="text-white/25 text-sm mb-6">Discover great books at student prices</p>
            <Link href="/books" className="btn-gold px-7 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
              <BookOpen size={14} /> Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            {/* Cart Items */}
            <div className="space-y-3">
              {cart.map(item => {
                const { saved, percent } = calculateDiscount(item.book.marketPrice, item.book.sellingPrice)
                return (
                  <div key={item.id} className="glass rounded-2xl p-4 border border-white/5 flex items-center gap-4">
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                      {item.book.images[0] ? (
                        <img src={item.book.images[0].imageUrl} alt={item.book.title} className="w-full h-full object-cover" />
                      ) : <div className="flex items-center justify-center h-full"><BookOpen size={20} className="text-white/10" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/books/${item.book.id}`} className="font-semibold text-cream text-sm hover:text-gold transition-colors line-clamp-2">{item.book.title}</Link>
                      <div className="text-white/40 text-xs mt-0.5">{item.book.author} · {item.book.seller.fullName}</div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-gold-light font-bold">{formatPrice(item.book.sellingPrice)}</span>
                        <span className="text-white/30 text-xs line-through">{formatPrice(item.book.marketPrice)}</span>
                        {percent > 0 && <span className="badge badge-green py-0.5">{percent}% off</span>}
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.bookId)} disabled={removing === item.bookId}
                      className="w-8 h-8 glass rounded-xl flex items-center justify-center text-white/30 hover:text-red-400 transition-colors flex-shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            <div className="space-y-4">
              {/* Coupon */}
              <div className="glass rounded-2xl p-5 border border-white/5">
                <label className="text-xs text-white/40 mb-2 block flex items-center gap-1.5"><Tag size={11} /> Coupon Code</label>
                <div className="flex gap-2">
                  <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())}
                    className="input-dark flex-1 px-3 py-2.5 rounded-xl text-sm" placeholder="BOOK20" />
                  <button className="btn-ghost px-4 py-2.5 rounded-xl text-xs font-semibold">Apply</button>
                </div>
                {couponMsg && <p className="text-xs text-emerald-400 mt-2">{couponMsg}</p>}
              </div>

              {/* Price Breakdown */}
              <div className="glass rounded-2xl p-5 border border-white/5">
                <h3 className="font-semibold text-cream mb-4 text-sm">Price Summary</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-white/50">
                    <span>Subtotal ({cart.length} books)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {totalSaved > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>You Save</span>
                      <span>-{formatPrice(totalSaved)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white/50">
                    <span>Delivery</span>
                    <span className="text-emerald-400">Free</span>
                  </div>
                  <div className="divider-gold my-2" />
                  <div className="flex justify-between text-cream font-bold text-base">
                    <span>Total</span>
                    <span className="text-gold-light">{formatPrice(subtotal)}</span>
                  </div>
                </div>
                <Link href="/checkout" className="btn-gold w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mt-5">
                  Proceed to Checkout <ArrowRight size={14} />
                </Link>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-white/30 px-1">
                <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                <span>Books are reserved for 30 minutes once you proceed to checkout.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
