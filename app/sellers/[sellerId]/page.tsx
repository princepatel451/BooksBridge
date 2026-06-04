'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Star, Award, ShieldCheck, MapPin, Calendar, ChevronLeft, BookOpen, AlertCircle, ShoppingBag } from 'lucide-react'
import { BookCard } from '@/components/ui/BookCard'
import { BookCardSkeleton, Skeleton } from '@/components/ui/Skeleton'
import { StarRating } from '@/components/ui/StarRating'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

interface SellerDetail {
  id: string
  fullName: string
  city: string | null
  createdAt: string
  sellerProfile?: {
    displayName: string
    bio?: string | null
    avgRating: number
    totalReviews: number
    totalBooksSold: number
    verificationStatus: string
    createdAt: string
  } | null
}

interface Book {
  id: string
  title: string
  author: string
  edition?: string | null
  examCategory: string
  conditionScore: number
  marketPrice: number
  sellingPrice: number
  city: string
  images: { imageUrl: string }[]
  seller: { id: string; fullName: string; sellerProfile?: { avgRating: number; verificationStatus: string } | null }
}

export default function SellerProfilePage() {
  const { sellerId } = useParams()
  const router = useRouter()
  const [seller, setSeller] = useState<SellerDetail | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sellerId) return

    fetch(`/api/sellers/${sellerId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setSeller(d.data.seller)
          setBooks(d.data.books)
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [sellerId])

  if (loading) {
    return (
      <div className="min-h-screen pt-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 text-xs text-white/30 mb-6">
          <Skeleton className="h-4 w-20" />
          <span>/</span>
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="grid lg:grid-cols-[380px_1fr] gap-10">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-2xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-16 w-full" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => <BookCardSkeleton key={i} />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <div className="text-white/60 mb-4">Seller not found</div>
          <Link href="/books" className="btn-gold px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
            <ChevronLeft size={16} /> Back to Books
          </Link>
        </div>
      </div>
    )
  }

  const displayName = seller.sellerProfile?.displayName || seller.fullName
  const initial = displayName ? displayName[0].toUpperCase() : 'S'

  return (
    <div className="min-h-screen bg-hero pt-20 pb-16">
      {/* Title Tag for SEO */}
      <title>{`${displayName} - Seller Profile | BookBridge`}</title>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-white/30 mb-6">
          <Link href="/books" className="hover:text-gold flex items-center gap-1">
            <ChevronLeft size={12} /> Books
          </Link>
          <span>/</span>
          <span className="text-gold/60">Sellers</span>
          <span>/</span>
          <span className="text-white/50">{displayName}</span>
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-10 items-start">
          {/* LEFT COLUMN: Seller Info Card */}
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-6 sticky top-24">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/30 to-gold-muted/20 flex items-center justify-center text-2xl font-bold text-gold flex-shrink-0 shadow-lg border border-gold/10">
                {initial}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h1 className="font-display text-xl font-bold text-cream leading-tight truncate">{displayName}</h1>
                  {seller.sellerProfile?.verificationStatus === 'VERIFIED' && (
                    <span title="Verified Seller">
                      <ShieldCheck size={16} className="text-blue-400 flex-shrink-0" />
                    </span>
                  )}
                </div>
                {seller.city && (
                  <div className="flex items-center gap-1 text-white/40 text-xs mt-1">
                    <MapPin size={12} className="text-white/30" />
                    <span>{seller.city}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Seller Bio */}
            {seller.sellerProfile?.bio ? (
              <div className="border-t border-b border-white/5 py-4">
                <h3 className="text-xs text-white/40 uppercase tracking-wider mb-2">About Seller</h3>
                <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">{seller.sellerProfile.bio}</p>
              </div>
            ) : (
              <div className="border-t border-b border-white/5 py-4">
                <p className="text-white/30 text-xs italic">No bio provided by this seller.</p>
              </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="glass-gold rounded-xl p-3 border border-gold/10 flex flex-col justify-between">
                <div className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Rating</div>
                <div className="text-gold-light text-base font-bold flex items-center justify-center gap-0.5">
                  <Star size={12} className="text-gold fill-gold" />
                  <span>{seller.sellerProfile?.avgRating ? seller.sellerProfile.avgRating.toFixed(1) : 'N/A'}</span>
                </div>
              </div>
              
              <div className="glass-gold rounded-xl p-3 border border-gold/10 flex flex-col justify-between">
                <div className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Reviews</div>
                <div className="text-cream text-base font-bold">
                  {seller.sellerProfile?.totalReviews ?? 0}
                </div>
              </div>
              
              <div className="glass-gold rounded-xl p-3 border border-gold/10 flex flex-col justify-between">
                <div className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Sold</div>
                <div className="text-cream text-base font-bold">
                  {seller.sellerProfile?.totalBooksSold ?? 0}
                </div>
              </div>
            </div>

            {/* Star Rating details if reviews exist */}
            {seller.sellerProfile && seller.sellerProfile.totalReviews > 0 && (
              <div className="bg-white/3 rounded-xl px-4 py-3 flex items-center justify-between text-xs">
                <span className="text-white/40">Rating Summary:</span>
                <div className="flex items-center gap-2">
                  <StarRating rating={seller.sellerProfile.avgRating} size={11} />
                  <span className="text-cream font-medium">({seller.sellerProfile.totalReviews})</span>
                </div>
              </div>
            )}

            {/* Registration Date */}
            <div className="flex items-center gap-2 text-xs text-white/30 pt-2 justify-center border-t border-white/5">
              <Calendar size={12} />
              <span>Member since {formatDate(seller.sellerProfile?.createdAt || seller.createdAt)}</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Books Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-gold" />
                <h2 className="font-display text-2xl font-bold text-cream">Listed Books</h2>
              </div>
              <span className="text-white/40 text-xs px-3 py-1 bg-white/3 rounded-full border border-white/5 font-semibold">
                {books.length} Active Listings
              </span>
            </div>

            {books.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {books.map((b) => {
                  const cardBook = {
                    ...b,
                    edition: b.edition || undefined,
                    seller: {
                      ...b.seller,
                      sellerProfile: b.seller.sellerProfile || undefined
                    }
                  }
                  return <BookCard key={cardBook.id} book={cardBook} />
                })}
              </div>
            ) : (
              <div className="glass rounded-2xl border border-white/5 p-16 text-center">
                <div className="w-16 h-16 rounded-full bg-white/3 flex items-center justify-center mx-auto mb-4 border border-white/5">
                  <BookOpen size={24} className="text-white/20" />
                </div>
                <h3 className="text-cream font-semibold text-base mb-1">No Active Listings</h3>
                <p className="text-white/40 text-sm max-w-sm mx-auto">
                  This seller doesn't have any books listed for sale right now. Check back later!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
