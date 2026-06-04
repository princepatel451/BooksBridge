'use client'
import { Heart, BookOpen } from 'lucide-react'
import { formatPrice, calculateDiscount, getConditionLabel, getConditionColor, cn } from '@/lib/utils'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Book {
  id: string; title: string; author: string; edition?: string; examCategory: string
  conditionScore: number; marketPrice: number; sellingPrice: number; city: string
  images: { imageUrl: string }[]
  seller: { id: string; fullName: string; sellerProfile?: { avgRating: number; verificationStatus: string } }
}

export function BookCard({ book }: { book: Book }) {
  const { user } = useAuth()
  const router = useRouter()
  const [wishlisted, setWishlisted] = useState(false)
  const { saved, percent } = calculateDiscount(book.marketPrice, book.sellingPrice)
  const coverImage = book.images[0]?.imageUrl

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    const nextState = !wishlisted
    setWishlisted(nextState)

    try {
      const res = await fetch('/api/wishlist', {
        method: nextState ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: book.id })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(nextState ? 'Added to wishlist!' : 'Removed from wishlist!')
      } else {
        setWishlisted(!nextState)
        toast.error(data.error || 'Failed to update wishlist')
      }
    } catch {
      setWishlisted(!nextState)
      toast.error('Network error updating wishlist')
    }
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: book.id })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Added to cart!')
      } else {
        toast.error(data.error || 'Failed to add to cart')
      }
    } catch {
      toast.error('Network error adding to cart')
    }
  }

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/checkout?bookId=${book.id}`)
  }

  return (
    <Link href={`/books/${book.id}`}>
      <div className="glass rounded-2xl overflow-hidden card-hover hover-lift cursor-pointer border border-white/5 group">
        {/* Image */}
        <div className="relative h-52 bg-gradient-to-br from-white/5 to-white/[0.02] overflow-hidden">
          {coverImage ? (
            <img src={coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <BookOpen size={48} className="text-white/10" />
            </div>
          )}
          {/* Discount badge */}
          {percent > 0 && (
            <div className="absolute top-3 left-3 badge badge-green">Save {percent}%</div>
          )}
          {/* Wishlist */}
          <button
            onClick={toggleWishlist}
            className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center transition-all hover:scale-110"
          >
            <Heart size={14} className={wishlisted ? 'fill-red-400 text-red-400' : 'text-white/50'} />
          </button>
          {/* Exam badge */}
          <div className="absolute bottom-3 left-3 badge badge-gold">{book.examCategory}</div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-cream line-clamp-2 text-sm leading-snug mb-1">{book.title}</h3>
          <p className="text-white/40 text-xs mb-3">
            {book.author}
            {book.edition ? ` · ${book.edition}` : ''}
            {` · `}
            <span className={cn('font-semibold', getConditionColor(book.conditionScore))}>
              {getConditionLabel(book.conditionScore)}
            </span>
          </p>

          {/* Price */}
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="text-gold-light font-bold text-lg">{formatPrice(book.sellingPrice)}</div>
              <div className="text-white/30 text-xs line-through">{formatPrice(book.marketPrice)}</div>
            </div>
            {saved > 0 && (
              <div className="text-right">
                <div className="text-emerald-400 text-xs font-semibold">Save {formatPrice(saved)}</div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4 border-t border-white/5 pt-3">
            <button
              onClick={handleAddToCart}
              className="flex-1 btn-ghost py-2 rounded-xl text-[11px] font-semibold flex items-center justify-center transition-all cursor-pointer"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 btn-gold py-2 rounded-xl text-[11px] font-semibold text-ink flex items-center justify-center transition-all hover:scale-102 cursor-pointer"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
