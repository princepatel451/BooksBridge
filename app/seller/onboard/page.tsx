'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { BookOpen, User, CreditCard, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react'

const EXAMS = ['JEE', 'NEET', 'UPSC', 'GATE', 'SSC', 'CAT', 'CDS', 'Class 11/12', 'Others']

export default function SellerOnboardPage() {
  const { user, refresh } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    displayName: user?.fullName || '', bio: '', examSpecialization: [] as string[],
    bankAccount: '', bankIfsc: '', upiId: ''
  })

  const toggleExam = (e: string) => setForm(f => ({
    ...f,
    examSpecialization: f.examSpecialization.includes(e) ? f.examSpecialization.filter(x => x !== e) : [...f.examSpecialization, e]
  }))

  const finish = async () => {
    setSaving(true)
    const res = await fetch('/api/seller/onboard', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    setSaving(false)
    if (data.success) { await refresh(); router.push('/seller/dashboard') }
  }

  const STEPS = [
    { num: 1, label: 'Basic Info', icon: User },
    { num: 2, label: 'Specialization', icon: BookOpen },
    { num: 3, label: 'Bank Details', icon: CreditCard },
    { num: 4, label: 'Complete', icon: CheckCircle },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-4 pb-16 bg-hero">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="badge badge-gold mb-3 mx-auto">Seller Onboarding</div>
          <h1 className="font-display text-3xl font-bold text-cream">Set Up Your Seller Profile</h1>
          <p className="text-white/40 text-sm mt-2">Just 3 quick steps to start selling</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > s.num ? 'bg-emerald-500 text-white' : step === s.num ? 'bg-gold text-ink' : 'glass text-white/30'}`}>
                {step > s.num ? <CheckCircle size={14} /> : s.num}
              </div>
              {i < STEPS.length - 1 && <div className={`w-8 h-px ${step > s.num ? 'bg-emerald-500/50' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <div className="glass rounded-3xl p-8 border border-white/8">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-semibold text-cream mb-4">Basic Information</h2>
              <div>
                <label className="block text-xs text-white/40 mb-2">Display Name (shown to buyers)</label>
                <input value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                  className="input-dark w-full px-4 py-3 rounded-xl text-sm" placeholder="Your seller name" />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-2">Bio (optional)</label>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  className="input-dark w-full px-4 py-3 rounded-xl text-sm resize-none h-24" placeholder="Tell buyers about yourself..." />
              </div>
              <button onClick={() => setStep(2)} disabled={!form.displayName}
                className="btn-gold w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                Next <ArrowRight size={14} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-semibold text-cream mb-1">Exam Specialization</h2>
              <p className="text-white/40 text-sm">Which exams do you primarily sell books for?</p>
              <div className="flex flex-wrap gap-2">
                {EXAMS.map(e => (
                  <button key={e} onClick={() => toggleExam(e)}
                    className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${form.examSpecialization.includes(e) ? 'badge-gold border-gold/30 bg-gold/10' : 'border-white/10 text-white/40 hover:text-cream'}`}>
                    {e}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(1)} className="btn-ghost flex-1 py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                  <ArrowLeft size={14} /> Back
                </button>
                <button onClick={() => setStep(3)} className="btn-gold flex-1 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                  Next <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-semibold text-cream mb-1">Bank Details</h2>
              <p className="text-white/40 text-sm">For receiving your earnings (optional now, required to withdraw)</p>
              {[['UPI ID', 'upiId', 'text', 'yourname@upi'],
                ['Bank Account Number', 'bankAccount', 'text', '1234567890'],
                ['IFSC Code', 'bankIfsc', 'text', 'SBIN0001234']].map(([label, key, type, placeholder]) => (
                <div key={key}>
                  <label className="block text-xs text-white/40 mb-2">{label}</label>
                  <input type={type} value={String((form as Record<string, unknown>)[key] ?? '')} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="input-dark w-full px-4 py-3 rounded-xl text-sm" placeholder={placeholder} />
                </div>
              ))}
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-ghost flex-1 py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                  <ArrowLeft size={14} /> Back
                </button>
                <button onClick={finish} disabled={saving} className="btn-gold flex-1 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" /> : <><CheckCircle size={14} />Finish</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
