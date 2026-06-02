'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ShoppingCart, Zap, MessageCircle, Heart, ShieldCheck, Star, MapPin, ChevronLeft, BookOpen, AlertCircle, Share2, Award, Clock } from 'lucide-react'
import { formatPrice, calculateDiscount, getConditionLabel, getConditionColor, formatDate, cn } from '@/lib/utils'
import { StarRating } from '@/components/ui/StarRating'
import { BookCardSkeleton } from '@/components/ui/Skeleton'
import Link from 'next/link'

interface BookDetail {
  id: string; title: string; author: string; edition?: string; publisher?: string; isbn?: string
  examCategory: string; subject?: string; conditionScore: number; conditionNotes?: string; description?: string
  marketPrice: number; sellingPrice: number; city: string; state?: string; viewCount: number; createdAt: string
  images: { id: string; imageUrl: string; imageType: string }[]
  seller: { id: string; fullName: string; city: string; createdAt: string; sellerProfile?: { displayName: string; bio?: string; avgRating: number; totalReviews: number; totalBooksSold: number; verificationStatus: string } }
  reviews: { id: string; rating: number; title?: string; comment?: string; createdAt: string; buyer: { fullName: string; profilePictureUrl?: string } }[]
}

export default function BookDetailPage() {
  const { bookId } = useParams()
  const router = useRouter()
  const [book, setBook] = useState<BookDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [wishlisted, setWishlisted] = useState(false)
  const [addingCart, setAddingCart] = useState(false)
  const [cartMsg, setCartMsg] = useState('')

  useEffect(() => {
    fetch(`/api/books/${bookId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setBook(d.data.book) })
      .finally(() => setLoading(false))
  }, [bookId])

  const addToCart = async () => {
    setAddingCart(true)
    const res = await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookId }) })
    const data = await res.json()
    setAddingCart(false)
    if (data.success) { setCartMsg('Added to cart!'); setTimeout(() => setCartMsg(''), 3000) }
    else if (res.status === 401) router.push('/auth/login')
    else setCartMsg(data.error)
  }

  if (loading) return (
    <div className="min-h-screen pt-24 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid lg:grid-cols-2 gap-10"><BookCardSkeleton /><div className="space-y-4"><BookCardSkeleton /></div></div>
    </div>
  )

  if (!book) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center"><AlertCircle size={48} className="text-red-400 mx-auto mb-4" /><div className="text-white/60">Book not found</div></div>
    </div>
  )

  const { saved, percent } = calculateDiscount(book.marketPrice, book.sellingPrice)

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-white/30 mb-6">
          <Link href="/books" className="hover:text-gold flex items-center gap-1"><ChevronLeft size={12} /> Books</Link>
          <span>/</span>
          <span className="text-gold/60">{book.examCategory}</span>
          <span>/</span>
          <span className="text-white/50 line-clamp-1">{book.title}</span>
        </div>

        <div className="grid lg:grid-cols-[1fr_420px] gap-10">
          {/* LEFT: Images */}
          <div>
            {/* Main Image */}
            <div className="glass rounded-2xl overflow-hidden aspect-[4/3] mb-3 relative group">
              {book.images[activeImage] ? (
                <img src={book.images[activeImage].imageUrl} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full"><BookOpen size={64} className="text-white/10" /></div>
              )}
              {percent > 0 && <div className="absolute top-4 left-4 badge badge-green text-sm py-1">Save {percent}%</div>}
            </div>
            {/* Thumbnails */}
            {book.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {book.images.map((img, i) => (
                  <button key={img.id} onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-gold' : 'border-white/10'}`}>
                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            {book.description && (
              <div className="glass rounded-2xl p-6 mt-5 border border-white/5">
                <h3 className="font-semibold text-cream mb-3 text-sm">About this book</h3>
                <p className="text-white/50 text-sm leading-relaxed">{book.description}</p>
              </div>
            )}

            {/* Reviews */}
            {book.reviews.length > 0 && (
              <div className="mt-5">
                <h3 className="font-display text-xl font-bold text-cream mb-4">Buyer Reviews</h3>
                <div className="space-y-4">
                  {book.reviews.map(r => (
                    <div key={r.id} className="glass rounded-2xl p-5 border border-white/5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/30 to-gold-muted/20 flex items-center justify-center text-xs font-bold text-gold">{r.buyer.fullName[0]}</div>
                          <div>
                            <div className="text-cream text-sm font-medium">{r.buyer.fullName}</div>
                            <div className="text-white/30 text-xs">{formatDate(r.createdAt)}</div>
                          </div>
                        </div>
                        <StarRating rating={r.rating} size={12} />
                      </div>
                      {r.title && <div className="text-cream text-sm font-medium mb-1">{r.title}</div>}
                      {r.comment && <p className="text-white/50 text-sm">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Details */}
          <div className="space-y-4">
            {/* Main Info */}
            <div className="glass rounded-2xl p-6 border border-white/5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="badge badge-gold">{book.examCategory}</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setWishlisted(!wishlisted)} className={`w-9 h-9 glass rounded-xl flex items-center justify-center transition-all hover:scale-110 ${wishlisted ? 'text-red-400' : 'text-white/40'}`}>
                    <Heart size={15} className={wishlisted ? 'fill-current' : ''} />
                  </button>
                  <button className="w-9 h-9 glass rounded-xl flex items-center justify-center text-white/40 hover:text-cream transition-colors">
                    <Share2 size={15} />
                  </button>
                </div>
              </div>

              <h1 className="font-display text-2xl font-bold text-cream mb-2 leading-snug">{book.title}</h1>
              <p className="text-white/50 text-sm mb-4">{book.author}{book.edition ? ` · ${book.edition}` : ''}{book.publisher ? ` · ${book.publisher}` : ''}</p>

              {/* Condition */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full" style={{ width: `${book.conditionScore * 10}%` }} />
                </div>
                <span className={cn('text-sm font-semibold', getConditionColor(book.conditionScore))}>
                  {book.conditionScore}/10 — {getConditionLabel(book.conditionScore)}
                </span>
              </div>
              {book.conditionNotes && (
                <p className="text-white/30 text-xs bg-white/3 rounded-xl px-4 py-2.5 mb-5">{book.conditionNotes}</p>
              )}

              {/* Price */}
              <div className="glass-gold rounded-xl p-4 mb-5">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-white/40 text-xs mb-1">Selling Price</div>
                    <div className="text-gold-light text-3xl font-bold">{formatPrice(book.sellingPrice)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white/30 text-xs line-through">{formatPrice(book.marketPrice)}</div>
                    {saved > 0 && <div className="text-emerald-400 text-sm font-semibold">You save {formatPrice(saved)}</div>}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {cartMsg && (
                <div className="text-center text-xs text-emerald-400 mb-3 bg-emerald-400/10 rounded-lg py-2">{cartMsg}</div>
              )}
              <div className="space-y-2.5">
                <Link href={`/checkout?bookId=${book.id}`} className="btn-gold w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                  <Zap size={15} /> Buy Now
                </Link>
                <button onClick={addToCart} disabled={addingCart} className="btn-ghost w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  <ShoppingCart size={15} /> {addingCart ? 'Adding...' : 'Add to Cart'}
                </button>
                <button className="glass w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 text-white/50 hover:text-cream border border-white/8 transition-colors">
                  <MessageCircle size={14} /> Chat with Seller
                </button>
              </div>
            </div>

            {/* Seller Card */}
            <div className="glass rounded-2xl p-6 border border-white/5">
              <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">Seller Information</h3>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold/30 to-gold-muted/20 flex items-center justify-center text-lg font-bold text-gold flex-shrink-0">
                  {book.seller.fullName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-cream text-sm">{book.seller.sellerProfile?.displayName || book.seller.fullName}</span>
                    {book.seller.sellerProfile?.verificationStatus === 'VERIFIED' && (
                      <ShieldCheck size={13} className="text-blue-400 flex-shrink-0" />
                    )}
                  </div>
                  {book.seller.sellerProfile && (
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span className="flex items-center gap-1"><Star size={10} className="text-gold" />{book.seller.sellerProfile.avgRating.toFixed(1)} ({book.seller.sellerProfile.totalReviews})</span>
                      <span className="flex items-center gap-1"><Award size={10} />{book.seller.sellerProfile.totalBooksSold} sold</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-white/30 text-xs mt-1"><MapPin size={10} />{book.seller.city}</div>
                </div>
              </div>
              {book.seller.sellerProfile?.bio && (
                <p className="text-white/30 text-xs mt-3 leading-relaxed">{book.seller.sellerProfile.bio}</p>
              )}
            </div>

            {/* Safety */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              <div className="space-y-2.5">
                {[['ShieldCheck', 'Secure Payment', 'Pay only after delivery confirmation'],
                  ['Award', 'Verified Listings', 'All books reviewed for authenticity'],
                  ['Clock', 'Easy Returns', 'Report issues within 48 hours of delivery']].map(([_, title, desc]) => (
                  <div key={title} className="flex items-start gap-3">
                    <ShieldCheck size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-cream text-xs font-semibold">{title}</div>
                      <div className="text-white/30 text-xs">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center justify-between text-xs text-white/25 px-1">
              <span className="flex items-center gap-1"><Clock size={10} />Listed {formatDate(book.createdAt)}</span>
              <span>{book.viewCount} views</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

