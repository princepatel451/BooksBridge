'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Upload, Plus, X, ArrowLeft, BookOpen, CheckCircle } from 'lucide-react'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import Link from 'next/link'

const EXAMS = ['JEE', 'NEET', 'UPSC', 'GATE', 'SSC', 'CAT', 'CDS', 'Class 11/12', 'Others']
const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'History', 'Geography', 'Polity', 'Economics', 'General Studies', 'English', 'Other']

const CONDITION_LABELS: Record<number, string> = {1:'Poor',2:'Very Old',3:'Old',4:'Worn',5:'Acceptable',6:'Average',7:'Good',8:'Very Good',9:'Like New',10:'Brand New'}

export default function AddBookPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '', author: '', edition: '', publisher: '', isbn: '',
    examCategory: '', subject: '', conditionScore: 7, conditionNotes: '',
    description: '', marketPrice: '', sellingPrice: '', city: user?.city || '',
  })

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))
  const { saved, percent } = form.marketPrice && form.sellingPrice
    ? calculateDiscount(parseFloat(form.marketPrice), parseFloat(form.sellingPrice)) : { saved: 0, percent: 0 }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.examCategory) { setError('Please select an exam category'); return }
    if (parseFloat(form.sellingPrice) >= parseFloat(form.marketPrice)) { setError('Selling price must be less than market price'); return }
    setSaving(true); setError('')
    const res = await fetch('/api/books', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, marketPrice: parseFloat(form.marketPrice), sellingPrice: parseFloat(form.sellingPrice), conditionScore: form.conditionScore })
    })
    const data = await res.json()
    setSaving(false)
    if (data.success) { setSuccess(true); setTimeout(() => router.push('/seller/books'), 2000) }
    else setError(data.error || 'Failed to add book')
  }

  if (success) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <CheckCircle size={56} className="text-emerald-400 mx-auto mb-4" />
        <div className="font-display text-2xl font-bold text-cream mb-2">Book Listed!</div>
        <p className="text-white/40 text-sm">Redirecting to your listings...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-7">
          <Link href="/seller/books" className="w-9 h-9 glass rounded-xl flex items-center justify-center text-white/40 hover:text-cream transition-colors">
            <ArrowLeft size={15} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-cream">Add New Book</h1>
            <p className="text-white/40 text-xs mt-0.5">Fill in the details below</p>
          </div>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5 text-red-400 text-sm">{error}</div>}

        <form onSubmit={submit} className="space-y-5">
          {/* Book Info */}
          <div className="glass rounded-2xl p-6 border border-white/5">
            <h2 className="font-semibold text-cream mb-4 text-sm flex items-center gap-2"><BookOpen size={14} className="text-gold" />Book Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Title *</label>
                <input value={form.title} onChange={e => set('title', e.target.value)} required className="input-dark w-full px-4 py-3 rounded-xl text-sm" placeholder="e.g. Concepts of Physics Vol 1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Author *</label>
                  <input value={form.author} onChange={e => set('author', e.target.value)} required className="input-dark w-full px-4 py-3 rounded-xl text-sm" placeholder="H.C. Verma" />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Edition</label>
                  <input value={form.edition} onChange={e => set('edition', e.target.value)} className="input-dark w-full px-4 py-3 rounded-xl text-sm" placeholder="2023" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Exam Category *</label>
                  <select value={form.examCategory} onChange={e => set('examCategory', e.target.value)} required className="input-dark w-full px-4 py-3 rounded-xl text-sm appearance-none">
                    <option value="" className="bg-ink">Select Exam</option>
                    {EXAMS.map(e => <option key={e} value={e} className="bg-ink">{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Subject</label>
                  <select value={form.subject} onChange={e => set('subject', e.target.value)} className="input-dark w-full px-4 py-3 rounded-xl text-sm appearance-none">
                    <option value="" className="bg-ink">Select Subject</option>
                    {SUBJECTS.map(s => <option key={s} value={s} className="bg-ink">{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Condition */}
          <div className="glass rounded-2xl p-6 border border-white/5">
            <h2 className="font-semibold text-cream mb-4 text-sm">Book Condition</h2>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-white/40">Condition Rating</label>
                <span className="text-gold font-semibold text-sm">{form.conditionScore}/10 — {CONDITION_LABELS[form.conditionScore]}</span>
              </div>
              <input type="range" min={1} max={10} value={form.conditionScore} onChange={e => set('conditionScore', parseInt(e.target.value))}
                className="w-full accent-gold" />
              <div className="flex justify-between text-xs text-white/20 mt-1"><span>Poor</span><span>Brand New</span></div>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Condition Notes (highlights, torn pages, etc.)</label>
              <textarea value={form.conditionNotes} onChange={e => set('conditionNotes', e.target.value)} className="input-dark w-full px-4 py-3 rounded-xl text-sm resize-none h-20" placeholder="e.g. Minor highlights on chapters 3-5, cover slightly bent..." />
            </div>
            <div className="mt-3">
              <label className="block text-xs text-white/40 mb-1.5">Description (optional)</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} className="input-dark w-full px-4 py-3 rounded-xl text-sm resize-none h-20" placeholder="Any other details buyers should know..." />
            </div>
          </div>

          {/* Pricing */}
          <div className="glass rounded-2xl p-6 border border-white/5">
            <h2 className="font-semibold text-cream mb-4 text-sm">Pricing</h2>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Market Price (₹) *</label>
                <input type="number" value={form.marketPrice} onChange={e => set('marketPrice', e.target.value)} required min={1} className="input-dark w-full px-4 py-3 rounded-xl text-sm" placeholder="1200" />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Your Selling Price (₹) *</label>
                <input type="number" value={form.sellingPrice} onChange={e => set('sellingPrice', e.target.value)} required min={1} className="input-dark w-full px-4 py-3 rounded-xl text-sm" placeholder="450" />
              </div>
            </div>
            {saved > 0 && (
              <div className="glass-gold rounded-xl px-4 py-2.5 text-sm text-center">
                <span className="text-white/50">Buyers save </span>
                <span className="text-emerald-400 font-bold">{formatPrice(saved)} ({percent}% off)</span>
              </div>
            )}
          </div>

          {/* City */}
          <div className="glass rounded-2xl p-6 border border-white/5">
            <h2 className="font-semibold text-cream mb-3 text-sm">Location</h2>
            <input value={form.city} onChange={e => set('city', e.target.value)} required className="input-dark w-full px-4 py-3 rounded-xl text-sm" placeholder="Delhi" />
            <p className="text-white/25 text-xs mt-2">Nearby buyers see your book first</p>
          </div>

          <button type="submit" disabled={saving}
            className="btn-gold w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
            {saving ? <div className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" /> : <><Plus size={15} /> Publish Listing</>}
          </button>
        </form>
      </div>
    </div>
  )
}
