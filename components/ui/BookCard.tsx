'use client'
import { Heart, MapPin, Star, ShieldCheck, BookOpen } from 'lucide-react'
import { formatPrice, calculateDiscount, getConditionLabel, getConditionColor, cn } from '@/lib/utils'
import Link from 'next/link'
import { useState } from 'react'

interface Book {
  id: string; title: string; author: string; edition?: string; examCategory: string
  conditionScore: number; marketPrice: number; sellingPrice: number; city: string
  images: { imageUrl: string }[]
  seller: { id: string; fullName: string; sellerProfile?: { avgRating: number; verificationStatus: string } }
}

export function BookCard({ book }: { book: Book }) {
  const [wishlisted, setWishlisted] = useState(false)
  const { saved, percent } = calculateDiscount(book.marketPrice, book.sellingPrice)
  const coverImage = book.images[0]?.imageUrl

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
            onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted) }}
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
          <p className="text-white/40 text-xs mb-3">{book.author}{book.edition ? ` · ${book.edition}` : ''}</p>

          {/* Condition */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full" style={{ width: `${book.conditionScore * 10}%` }} />
            </div>
            <span className={cn('text-xs font-medium', getConditionColor(book.conditionScore))}>
              {getConditionLabel(book.conditionScore)}
            </span>
          </div>

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

          {/* Seller + City */}
          <div className="flex items-center justify-between text-xs text-white/40 border-t border-white/5 pt-3">
            <div className="flex items-center gap-1.5">
              {book.seller.sellerProfile?.verificationStatus === 'VERIFIED' && (
                <ShieldCheck size={11} className="text-blue-400 flex-shrink-0" />
              )}
              <span className="truncate max-w-[100px]">{book.seller.fullName}</span>
              {(book.seller.sellerProfile?.avgRating ?? 0) > 0 && (
                <span className="flex items-center gap-0.5 text-gold/70">
                  <Star size={9} className="fill-current" />
                  {(book?.seller?.sellerProfile?.avgRating ?? 0).toFixed(1)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={10} />
              <span>{book.city}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
