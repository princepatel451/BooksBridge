'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Upload, X, ArrowLeft, BookOpen, CheckCircle, Camera, ArrowRight, Plus } from 'lucide-react'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import Link from 'next/link'
import toast from 'react-hot-toast'

const EXAMS = ['JEE', 'NEET', 'UPSC', 'GATE', 'SSC', 'CAT', 'CDS', 'Class 11/12', 'Others']
const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'History', 'Geography', 'Polity', 'Economics', 'General Studies', 'English', 'Other']

const CONDITIONS = [
  { val: 10, label: 'Brand New (10/10)' },
  { val: 9, label: 'Like New (9/10)' },
  { val: 8, label: 'Very Good (8/10)' },
  { val: 7, label: 'Good (7/10)' },
  { val: 6, label: 'Average (6/10)' },
  { val: 5, label: 'Acceptable (5/10)' },
  { val: 4, label: 'Worn (4/10)' },
  { val: 3, label: 'Old (3/10)' },
  { val: 2, label: 'Very Old (2/10)' },
  { val: 1, label: 'Poor (1/10)' },
]

export default function AddBookPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  // State for metadata fields
  const [form, setForm] = useState({
    title: '',
    author: '',
    edition: '',
    publisher: '',
    isbn: '',
    examCategory: '',
    subject: '',
    conditionScore: 8, // Default to Very Good (8/10)
    conditionNotes: '',
    description: '',
    marketPrice: '',
    sellingPrice: '',
    city: user?.city || '',
  })

  // State for up to 4 Cloudinary uploaded photos
  const [images, setImages] = useState<(string | null)[]>([null, null, null, null])
  const [uploading, setUploading] = useState<boolean[]>([false, false, false, false])
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0)
  
  // File input refs for each of the 4 slots
  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))
  
  const { saved, percent } = form.marketPrice && form.sellingPrice
    ? calculateDiscount(parseFloat(form.marketPrice), parseFloat(form.sellingPrice))
    : { saved: 0, percent: 0 }

  // Upload file logic
  const handleFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit file size to 5MB for safety
    if (file.size > 5 * 1024 * 1024) {
      const errMsg = 'Image file is too large. Max size is 5MB.'
      setError(errMsg)
      toast.error(errMsg)
      return
    }

    setUploading(prev => {
      const next = [...prev]
      next[index] = true
      return next
    })
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (data.success) {
        setImages(prev => {
          const next = [...prev]
          next[index] = data.data.imageUrl
          return next
        })
        setActiveImageIdx(index)
        toast.success('Image uploaded successfully!')
      } else {
        const errMsg = data.error || 'Failed to upload image'
        setError(errMsg)
        toast.error(errMsg)
      }
    } catch (err) {
      console.error(err)
      const errMsg = 'An error occurred during file upload. Please verify Cloudinary credentials.'
      setError(errMsg)
      toast.error(errMsg)
    } finally {
      setUploading(prev => {
        const next = [...prev]
        next[index] = false
        return next
      })
      // Clear output value to allow re-upload of the same file
      e.target.value = ''
    }
  }

  const triggerUpload = (index: number) => {
    if (uploading[index]) return
    fileInputRefs[index].current?.click()
  }

  const removeImage = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    setImages(prev => {
      const next = [...prev]
      next[index] = null
      return next
    })

    // Adjust active view index if removing current image
    if (activeImageIdx === index) {
      const nonNullIdx = images.findIndex((img, idx) => img !== null && idx !== index)
      setActiveImageIdx(nonNullIdx !== -1 ? nonNullIdx : 0)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { const msg = 'Please enter a book title'; setError(msg); toast.error(msg); return }
    if (!form.author.trim()) { const msg = 'Please enter an author name'; setError(msg); toast.error(msg); return }
    if (!form.examCategory) { const msg = 'Please select an exam category'; setError(msg); toast.error(msg); return }
    if (!form.city.trim()) { const msg = 'Please enter your city'; setError(msg); toast.error(msg); return }
    
    const market = parseFloat(form.marketPrice)
    const selling = parseFloat(form.sellingPrice)
    if (isNaN(market) || market <= 0) { const msg = 'Please enter a valid market price'; setError(msg); toast.error(msg); return }
    if (isNaN(selling) || selling <= 0) { const msg = 'Please enter a valid selling price'; setError(msg); toast.error(msg); return }
    if (selling >= market) { const msg = 'Selling price must be less than market price'; setError(msg); toast.error(msg); return }

    // Map image arrays
    const imageTypes: ('FRONT_COVER' | 'BACK_COVER' | 'INSIDE' | 'OTHER')[] = [
      'FRONT_COVER',
      'BACK_COVER',
      'INSIDE',
      'OTHER',
    ]
    const finalImages = images
      .map((url, idx) => {
        if (!url) return null
        return {
          imageUrl: url,
          imageType: imageTypes[idx],
          sortOrder: idx,
        }
      })
      .filter(Boolean)

    if (finalImages.length === 0) {
      const msg = 'Please upload at least one book photo (Front Cover)'
      setError(msg)
      toast.error(msg)
      return
    }

    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          marketPrice: market,
          sellingPrice: selling,
          conditionScore: Number(form.conditionScore),
          images: finalImages,
        }),
      })
      const data = await res.json()
      setSaving(false)

      if (data.success) {
        toast.success('Book listed successfully!')
        router.push('/seller/books')
      } else {
        const msg = data.error || 'Failed to publish book listing'
        setError(msg)
        toast.error(msg)
      }
    } catch (err) {
      console.error(err)
      const msg = 'An error occurred. Failed to submit listing.'
      setError(msg)
      toast.error(msg)
      setSaving(false)
    }
  }


  // Active cover preview source helper
  const activeImageSrc = images[activeImageIdx] || images.find(img => img !== null)

  return (
    <div className="min-h-screen bg-hero pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Navigation & Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/seller/books" className="w-9 h-9 glass rounded-xl flex items-center justify-center text-white/40 hover:text-cream transition-all hover:scale-105">
            <ArrowLeft size={15} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-cream">List Your Book</h1>
            <div className="h-1 w-28 bg-gold rounded-full mt-2" />
          </div>
        </div>


        <form onSubmit={submit} className="grid lg:grid-cols-[420px_1fr] gap-8 items-start">
          
          {/* LEFT COLUMN: Book Photos */}
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-6">
            <div>
              <h2 className="font-semibold text-cream text-base">Book Photos</h2>
              <p className="text-white/40 text-xs mt-1">Upload pictures showing book details</p>
            </div>

            {/* Large Active Image Preview Frame */}
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden glass border border-white/10 flex items-center justify-center bg-black/20 group">
              {activeImageSrc ? (
                <img src={activeImageSrc} alt="Book Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="text-center p-6 flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/30 border border-white/5">
                    <Camera size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-cream">Upload book cover</p>
                    <p className="text-xs text-white/30 mt-1">Accepts PNG, JPG (max 5MB)</p>
                  </div>
                </div>
              )}
            </div>

            {/* Row of 4 Photo Slots */}
            <div className="grid grid-cols-4 gap-2.5">
              {[0, 1, 2, 3].map((idx) => {
                const label = idx === 0 ? 'Front' : idx === 1 ? 'Back' : idx === 2 ? 'Inside' : 'Other'
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <div 
                      onClick={() => images[idx] ? setActiveImageIdx(idx) : triggerUpload(idx)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all flex items-center justify-center ${
                        images[idx] 
                          ? activeImageIdx === idx ? 'border-gold scale-102 bg-black/40' : 'border-white/10 hover:border-white/30' 
                          : 'border-dashed border-white/15 bg-white/3 hover:border-white/30 hover:bg-white/5'
                      }`}
                    >
                      {/* Hidden Input file selector */}
                      <input 
                        type="file" 
                        ref={fileInputRefs[idx]} 
                        onChange={(e) => handleFileChange(idx, e)}
                        accept="image/*"
                        className="hidden" 
                      />

                      {uploading[idx] ? (
                        <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                      ) : images[idx] ? (
                        <>
                          <img src={images[idx]!} alt="" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={(e) => removeImage(e, idx)}
                            className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow"
                          >
                            <X size={10} />
                          </button>
                        </>
                      ) : (
                        <div className="text-white/20 hover:text-white/40 flex flex-col items-center">
                          <Upload size={16} />
                          <span className="text-[9px] font-semibold mt-1 uppercase tracking-wider text-white/30">{label}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Tip Text */}
            <p className="text-xs text-white/30 text-center leading-relaxed italic bg-white/2 p-3 rounded-xl border border-white/5">
              Tip: Clear photos of the front, back, and any highlighted pages help your book sell 2x faster.
            </p>
          </div>

          {/* RIGHT COLUMN: Book Details Form */}
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-6">
            <div>
              <h2 className="font-semibold text-cream text-base">Book Information</h2>
              <p className="text-white/40 text-xs mt-1">Specify detailed listing parameters to match buyers</p>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-semibold">Book Title *</label>
                <input 
                  value={form.title} 
                  onChange={e => set('title', e.target.value)} 
                  required 
                  className="input-dark w-full px-4 py-3 rounded-xl text-sm" 
                  placeholder="Advanced Macroeconomics" 
                />
              </div>

              {/* Author & Subject */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-semibold">Author *</label>
                  <input 
                    value={form.author} 
                    onChange={e => set('author', e.target.value)} 
                    required 
                    className="input-dark w-full px-4 py-3 rounded-xl text-sm" 
                    placeholder="David Romer" 
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-semibold">Subject</label>
                  <select 
                    value={form.subject} 
                    onChange={e => set('subject', e.target.value)} 
                    className="input-dark w-full px-4 py-3 rounded-xl text-sm appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-ink">Select Subject</option>
                    {SUBJECTS.map(s => <option key={s} value={s} className="bg-ink">{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Category & Condition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-semibold">Category *</label>
                  <select 
                    value={form.examCategory} 
                    onChange={e => set('examCategory', e.target.value)} 
                    required 
                    className="input-dark w-full px-4 py-3 rounded-xl text-sm appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-ink">Select Category</option>
                    {EXAMS.map(e => <option key={e} value={e} className="bg-ink">{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-semibold">Condition *</label>
                  <select 
                    value={form.conditionScore} 
                    onChange={e => set('conditionScore', parseInt(e.target.value))} 
                    required
                    className="input-dark w-full px-4 py-3 rounded-xl text-sm appearance-none cursor-pointer"
                  >
                    {CONDITIONS.map(c => <option key={c.val} value={c.val} className="bg-ink">{c.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-semibold font-semibold">Description</label>
                <textarea 
                  value={form.description} 
                  onChange={e => set('description', e.target.value)} 
                  className="input-dark w-full px-4 py-3 rounded-xl text-sm resize-none h-24" 
                  placeholder="Mention any highlighting, wear on the cover, or if it includes a digital access code..." 
                />
              </div>

              {/* Condition Notes */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-semibold">Condition Notes (torn pages, writing, etc.)</label>
                <input 
                  value={form.conditionNotes} 
                  onChange={e => set('conditionNotes', e.target.value)} 
                  className="input-dark w-full px-4 py-3 rounded-xl text-sm" 
                  placeholder="Minor highlights on chapters 2-4, cover corners slightly bent" 
                />
              </div>

              {/* Optional Publisher & Edition info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Publisher</label>
                  <input 
                    value={form.publisher || ''} 
                    onChange={e => set('publisher', e.target.value)} 
                    className="input-dark w-full px-4 py-3 rounded-xl text-sm" 
                    placeholder="McGraw Hill" 
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Edition Year</label>
                  <input 
                    value={form.edition || ''} 
                    onChange={e => set('edition', e.target.value)} 
                    className="input-dark w-full px-4 py-3 rounded-xl text-sm" 
                    placeholder="2022" 
                  />
                </div>
              </div>

              {/* Pricing Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-semibold">Market Price (₹) *</label>
                  <input 
                    type="number" 
                    value={form.marketPrice} 
                    onChange={e => set('marketPrice', e.target.value)} 
                    required 
                    min={1} 
                    className="input-dark w-full px-4 py-3 rounded-xl text-sm font-semibold" 
                    placeholder="120.00" 
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-semibold">Your Selling Price (₹) *</label>
                  <input 
                    type="number" 
                    value={form.sellingPrice} 
                    onChange={e => set('sellingPrice', e.target.value)} 
                    required 
                    min={1} 
                    className="input-dark w-full px-4 py-3 rounded-xl text-sm font-semibold text-gold-light" 
                    placeholder="45.00" 
                  />
                </div>
              </div>

              {saved > 0 && (
                <div className="glass-gold rounded-xl px-4 py-3 text-sm text-center animate-fade-in flex items-center justify-center gap-2 border border-gold/15">
                  <span className="text-white/50">Buyers save </span>
                  <span className="text-emerald-400 font-bold">{formatPrice(saved)} ({percent}% off)</span>
                </div>
              )}

              {/* Location */}
              <div className="pt-2">
                <label className="block text-xs text-white/40 mb-1.5 font-semibold">Listing City *</label>
                <input 
                  value={form.city} 
                  onChange={e => set('city', e.target.value)} 
                  required 
                  className="input-dark w-full px-4 py-3 rounded-xl text-sm" 
                  placeholder="Delhi" 
                />
              </div>
            </div>

            {/* Submit button */}
            <button 
              type="submit" 
              disabled={saving}
              className="btn-gold w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-all hover:scale-[1.01] shadow-lg group cursor-pointer"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
              ) : (
                <>
                  Publish Listing 
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
