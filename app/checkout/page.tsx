'use client'
import { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Lock,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  BookOpen
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

interface BookDetail {
  id: string
  title: string
  author: string
  edition?: string
  publisher?: string
  conditionScore: number
  conditionNotes?: string
  marketPrice: number
  sellingPrice: number
  images: { id: string; imageUrl: string }[]
  seller: { fullName: string }
}

interface Address {
  id: string
  label: string
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pinCode: string
  isDefault: boolean
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry', 'Chandigarh'
]

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookId = searchParams.get('bookId')

  // Step state
  const [step, setStep] = useState<1 | 2>(1)

  // Data states
  const [book, setBook] = useState<BookDetail | null>(null)
  const [bookLoading, setBookLoading] = useState(true)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressesLoading, setAddressesLoading] = useState(true)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)

  // Form states
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add')
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    fullName: '',
    phone: '',
    pinCode: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    isDefault: false
  })
  const [showInstructions, setShowInstructions] = useState(false)
  const [instructionsText, setInstructionsText] = useState('')

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI_ID' | 'UPI_SCAN' | 'COD'>('CARD')
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  })
  const [upiId, setUpiId] = useState('')

  // Status & Submit states
  const [formError, setFormError] = useState('')
  const [apiError, setApiError] = useState('')
  const [submittingOrder, setSubmittingOrder] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)

  // Redirect if unauthorized
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/checkout?bookId=${bookId}`)
    }
  }, [user, authLoading, bookId, router])

  // Fetch book details
  useEffect(() => {
    if (!bookId) return
    setBookLoading(true)
    fetch(`/api/books/${bookId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setBook(d.data.book)
        } else {
          setApiError(d.error || 'Failed to load textbook details')
        }
      })
      .catch(() => setApiError('Failed to load textbook details'))
      .finally(() => setBookLoading(false))
  }, [bookId])

  // Fetch addresses
  const loadAddresses = async () => {
    setAddressesLoading(true)
    try {
      const res = await fetch('/api/addresses')
      const data = await res.json()
      if (data.success) {
        setAddresses(data.data.addresses)
        // Auto-select default address if available
        const defaultAddr = data.data.addresses.find((a: Address) => a.isDefault)
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id)
        } else if (data.data.addresses.length > 0) {
          setSelectedAddressId(data.data.addresses[0].id)
        }
      }
    } catch {
      setApiError('Failed to load delivery addresses')
    } finally {
      setAddressesLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadAddresses()
    }
  }, [user])

  // Price calculations
  const platformFee = book ? Math.round(book.sellingPrice * 0.08) : 50 // roughly 8% or standard platform fee
  const subtotalPrice = book ? book.sellingPrice - platformFee : 0
  const totalPrice = book ? book.sellingPrice : 0

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSavingAddress(true)

    // Basic validation
    if (!addressForm.fullName.trim()) return setFormError('Recipient name is required')
    if (!addressForm.phone.trim() || addressForm.phone.length < 10) return setFormError('Valid mobile number is required')
    if (!addressForm.pinCode.trim() || addressForm.pinCode.length < 6) return setFormError('Pincode must be 6 digits')
    if (!addressForm.addressLine1.trim()) return setFormError('Flat/House details are required')
    if (!addressForm.city.trim()) return setFormError('City is required')
    if (!addressForm.state) return setFormError('State selection is required')

    // Concatenate landmark into addressLine2
    const completeAddressLine2 = addressForm.landmark.trim()
      ? `${addressForm.addressLine2.trim()} (Landmark: ${addressForm.landmark.trim()})`
      : addressForm.addressLine2.trim()

    const payload = {
      label: addressForm.label,
      fullName: addressForm.fullName.trim(),
      phone: addressForm.phone.trim(),
      addressLine1: addressForm.addressLine1.trim(),
      addressLine2: completeAddressLine2,
      city: addressForm.city.trim(),
      state: addressForm.state,
      pinCode: addressForm.pinCode.trim(),
      isDefault: addressForm.isDefault
    }

    try {
      const url = formMode === 'add' ? '/api/addresses' : `/api/addresses/${editingAddressId}`
      const method = formMode === 'add' ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (data.success) {
        setShowAddressForm(false)
        await loadAddresses()
        if (formMode === 'add') {
          setSelectedAddressId(data.data.address.id)
        }
      } else {
        setFormError(data.error || 'Failed to save delivery address')
      }
    } catch {
      setFormError('Network error occurred while saving address')
    } finally {
      setSavingAddress(false)
    }
  }

  const handleDeleteAddress = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        if (selectedAddressId === id) {
          setSelectedAddressId(null)
        }
        await loadAddresses()
      }
    } catch {
      setApiError('Failed to delete address')
    }
  }

  const handleEditAddressClick = (addr: Address, e: React.MouseEvent) => {
    e.stopPropagation()
    setFormMode('edit')
    setEditingAddressId(addr.id)

    // Extract landmark from addressLine2 if stored as (Landmark: x)
    let mainAddressLine2 = addr.addressLine2 || ''
    let landmarkText = ''
    const match = mainAddressLine2.match(/\(Landmark:\s*(.*?)\)/)
    if (match) {
      landmarkText = match[1]
      mainAddressLine2 = mainAddressLine2.replace(/\s*\(Landmark:\s*(.*?)\)/, '')
    }

    setAddressForm({
      label: addr.label || 'Home',
      fullName: addr.fullName,
      phone: addr.phone,
      pinCode: addr.pinCode,
      addressLine1: addr.addressLine1,
      addressLine2: mainAddressLine2,
      landmark: landmarkText,
      city: addr.city,
      state: addr.state,
      isDefault: addr.isDefault
    })
    setShowAddressForm(true)
  }

  const handleAddNewAddressClick = () => {
    setFormMode('add')
    setEditingAddressId(null)
    setAddressForm({
      label: 'Home',
      fullName: '',
      phone: '',
      pinCode: '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: '',
      state: '',
      isDefault: false
    })
    setShowAddressForm(true)
  }

  const handlePlaceOrder = async () => {
    if (!book || !selectedAddressId) return
    setSubmittingOrder(true)
    setApiError('')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: book.id,
          addressId: selectedAddressId
        })
      })

      const data = await res.json()
      if (data.success) {
        setOrderSuccess(true)
        setTimeout(() => {
          router.push('/orders')
        }, 2500)
      } else {
        setApiError(data.error || 'Failed to place order. Try again.')
      }
    } catch {
      setApiError('Network connection error. Failed to complete transaction.')
    } finally {
      setSubmittingOrder(false)
    }
  }

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId)

  if (authLoading || bookLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-ink">
        <Loader2 className="w-8 h-8 text-gold animate-spin mb-4" />
        <span className="text-white/40 text-sm font-semibold tracking-wider uppercase">Loading Checkout...</span>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-ink text-center px-4">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-cream text-lg font-bold">Book Not Found</h2>
        <p className="text-white/45 text-xs max-w-sm mt-1 mb-6">We could not load details for this textbook. It may have been sold or removed.</p>
        <Link href="/books" className="btn-gold px-6 py-3 rounded-xl text-xs uppercase tracking-wider font-bold">Back to Browse</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-20 bg-ink">
      {orderSuccess && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center p-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 float">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-cream font-display text-2.5xl font-bold mb-2">Order Confirmed!</h2>
          <p className="text-white/50 text-sm max-w-xs leading-relaxed">
            Your textbook checkout was processed successfully. Redirecting you to order tracking...
          </p>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 font-sans">

        {/* Breadcrumb Navigation */}
        <button
          onClick={() => {
            if (step === 2) setStep(1)
            else router.push(`/books/${book.id}`)
          }}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-gold font-bold mb-6 cursor-pointer select-none transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {step === 2 ? 'Back to delivery details' : 'Back to Listings'}
        </button>

        {/* Process Header */}
        <div className="mb-8">
          <h1 className="text-cream font-display text-2xl sm:text-3xl font-bold leading-tight tracking-tight">Checkout Process</h1>
          <p className="text-white/45 text-xs font-semibold mt-1">
            Global delivery protection, secure transit tracking, and guaranteed buyer escrow safeguard
          </p>
        </div>

        {/* Multi-step indicator */}
        <div className="flex items-center justify-center gap-4 max-w-sm mx-auto mb-10 select-none">
          <div className="flex items-center gap-2">
            {step === 1 ? (
              <span className="w-6 h-6 rounded-full bg-gold text-ink text-[11px] font-black flex items-center justify-center shadow-md">1</span>
            ) : (
              <span className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </span>
            )}
            <span className={`text-xs font-black uppercase tracking-wider ${step === 1 ? 'text-gold' : 'text-emerald-400'}`}>Delivery</span>
          </div>

          <div className="h-px bg-white/10 flex-1 min-w-[40px]" />

          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center ${step === 2 ? 'bg-gold text-ink shadow-md' : 'bg-white/5 border border-white/10 text-white/30'}`}>2</span>
            <span className={`text-xs font-black uppercase tracking-wider ${step === 2 ? 'text-gold' : 'text-white/30'}`}>Payment</span>
          </div>
        </div>

        {apiError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/25 flex gap-3 text-red-400 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold">Checkout Alert</p>
              <p className="opacity-90 mt-0.5">{apiError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: Steps contents */}
          <div className="lg:col-span-8 space-y-6">

            {/* STEP 1: Delivery address selection & creation */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="glass rounded-3xl p-6 border border-white/5 space-y-6 shadow-2xl">
                  <div>
                    <h3 className="text-cream text-sm sm:text-base font-bold">Delivery Address</h3>
                    <p className="text-white/40 text-[11px] font-semibold mt-0.5">Select a saved delivery destination or create/edit one.</p>
                  </div>

                  {addressesLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="w-6 h-6 text-gold animate-spin mr-2" />
                      <span className="text-xs text-white/30 font-bold uppercase">Loading addresses...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id && !showAddressForm
                        return (
                          <div
                            key={addr.id}
                            onClick={() => {
                              setSelectedAddressId(addr.id)
                              setShowAddressForm(false)
                            }}
                            className={`glass rounded-2.5xl p-5 border cursor-pointer select-none transition-all duration-300 relative group flex flex-col justify-between min-h-[170px] ${isSelected
                                ? 'border-gold bg-gold/[0.03] shadow-lg shadow-gold/5 scale-[0.99]'
                                : 'border-white/5 hover:border-white/15'
                              }`}
                          >
                            <div className="space-y-3 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'border-gold bg-transparent' : 'border-white/30'}`}>
                                    {isSelected && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#C9A84C' }} />}
                                  </div>
                                  <span className="badge badge-gold text-[9px] px-2 py-0.5 rounded">{addr.label || 'Home'}</span>
                                </div>
                                {addr.isDefault && (
                                  <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded">
                                    Default
                                  </span>
                                )}
                              </div>

                              <div className="text-xs space-y-1 text-white/80 font-medium leading-relaxed min-w-0">
                                <p className="font-bold text-cream truncate">{addr.fullName}</p>
                                <p className="truncate opacity-75">{addr.addressLine1}</p>
                                {addr.addressLine2 && <p className="truncate opacity-70 text-[11px]">{addr.addressLine2}</p>}
                                <p className="opacity-75">{addr.city}, {addr.state} - {addr.pinCode}</p>
                                <p className="text-[11px] opacity-40 font-bold uppercase tracking-wider mt-1.5">India | Phone: {addr.phone}</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => handleEditAddressClick(addr, e)}
                                className="text-[10px] font-black uppercase tracking-widest text-gold hover:text-gold-light cursor-pointer select-none"
                              >
                                Edit
                              </button>
                              <span className="text-white/10 text-[10px] font-bold">|</span>
                              <button
                                onClick={(e) => handleDeleteAddress(addr.id, e)}
                                className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 cursor-pointer select-none"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )
                      })}

                      {/* ADD NEW ADDRESS CARD */}
                      <div
                        onClick={handleAddNewAddressClick}
                        className="glass rounded-2.5xl p-6 border border-dashed border-white/10 hover:border-gold/30 hover:bg-gold/[0.01] transition-all cursor-pointer flex flex-col items-center justify-center text-center group min-h-[170px] select-none"
                      >
                        <div className="w-10 h-10 rounded-full bg-white/3 group-hover:bg-gold/10 flex items-center justify-center text-white/40 group-hover:text-gold transition-colors mb-3 border border-white/5">
                          <Plus className="w-5 h-5" />
                        </div>
                        <span className="text-cream text-xs font-black uppercase tracking-widest group-hover:text-gold transition-colors">+ ADD NEW ADDRESS</span>
                        <span className="text-white/30 text-[10px] font-semibold mt-1">Enter custom shipping coordinates</span>
                      </div>
                    </div>
                  )}
                </div>

                {showAddressForm && (
                  /* ADDRESS FORM */
                  <div className="glass rounded-3xl p-6 border border-white/5 space-y-6 shadow-2xl animate-fadeIn">
                    <div>
                      <h3 className="text-cream text-sm sm:text-base font-bold">
                        {formMode === 'add' ? 'Enter a new delivery address' : 'Modify delivery address'}
                      </h3>
                      <p className="text-white/40 text-[11px] font-semibold mt-0.5">Please provide precise geographical markers for reliable global routing.</p>
                    </div>

                    {formError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>{formError}</span>
                      </div>
                    )}

                    <form onSubmit={handleSaveAddress} className="space-y-4 text-xs font-semibold">

                      {/* Label selector */}
                      <div>
                        <label className="text-[11px] text-white/40 font-bold uppercase tracking-wider block mb-2">Address Type / Label</label>
                        <div className="flex gap-2">
                          {['Home', 'Work', 'Office', 'Other'].map((lbl) => (
                            <button
                              key={lbl}
                              type="button"
                              onClick={() => setAddressForm({ ...addressForm, label: lbl })}
                              className={`px-4 py-2 rounded-xl font-bold uppercase tracking-widest text-[10px] border transition-all cursor-pointer ${addressForm.label === lbl
                                  ? 'bg-gold-light/10 border-gold text-gold-light'
                                  : 'bg-white/2 border-white/5 text-white/50 hover:border-white/15'
                                }`}
                            >
                              {lbl}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Country Dropdown */}
                      <div>
                        <label className="text-[11px] text-white/40 font-bold uppercase tracking-wider block mb-1.5">Country/Region</label>
                        <select
                          disabled
                          className="w-full px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-white/60 focus:outline-none cursor-not-allowed"
                        >
                          <option value="India">India</option>
                        </select>
                      </div>

                      {/* Grid Full Name & Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] text-white/40 font-bold uppercase tracking-wider block mb-1.5">Full name (First and Last name)</label>
                          <input
                            type="text"
                            placeholder="Enter full recipient name"
                            value={addressForm.fullName}
                            onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl input-dark text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-white/40 font-bold uppercase tracking-wider block mb-1.5">Mobile number</label>
                          <input
                            type="text"
                            placeholder="e.g. +91 98765 43210"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl input-dark text-xs"
                          />
                          <p className="text-[9px] text-white/25 mt-1">May be used to assist delivery</p>
                        </div>
                      </div>

                      {/* Pincode */}
                      <div>
                        <label className="text-[11px] text-white/40 font-bold uppercase tracking-wider block mb-1.5">Pincode</label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="6 digits [0-9] PIN code"
                          value={addressForm.pinCode}
                          onChange={(e) => setAddressForm({ ...addressForm, pinCode: e.target.value.replace(/\D/g, '') })}
                          className="w-full px-4 py-3 rounded-xl input-dark text-xs font-mono"
                        />
                      </div>

                      {/* Address Line 1 */}
                      <div>
                        <label className="text-[11px] text-white/40 font-bold uppercase tracking-wider block mb-1.5">Flat, House no., Building, Company, Apartment</label>
                        <input
                          type="text"
                          placeholder="Flat, Mansion, Wing, Floor Number"
                          value={addressForm.addressLine1}
                          onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl input-dark text-xs"
                        />
                      </div>

                      {/* Address Line 2 */}
                      <div>
                        <label className="text-[11px] text-white/40 font-bold uppercase tracking-wider block mb-1.5">Area, Street, Sector, Village</label>
                        <input
                          type="text"
                          placeholder="Street Lane, Sector Unit, Locality"
                          value={addressForm.addressLine2}
                          onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl input-dark text-xs"
                        />
                      </div>

                      {/* Landmark */}
                      <div>
                        <label className="text-[11px] text-white/40 font-bold uppercase tracking-wider block mb-1.5">Landmark</label>
                        <input
                          type="text"
                          placeholder="e.g. near Apollo Hospital"
                          value={addressForm.landmark}
                          onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl input-dark text-xs"
                        />
                      </div>

                      {/* Grid Town/City & State */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] text-white/40 font-bold uppercase tracking-wider block mb-1.5">Town/City</label>
                          <input
                            type="text"
                            placeholder="e.g. Ahmedabad"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl input-dark text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-white/40 font-bold uppercase tracking-wider block mb-1.5">State</label>
                          <select
                            value={addressForm.state}
                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl input-dark text-xs focus:outline-none"
                          >
                            <option value="">Choose a state</option>
                            {INDIAN_STATES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Default address checkbox */}
                      <div className="flex items-center gap-2 py-2 select-none">
                        <input
                          type="checkbox"
                          id="make-default"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                          className="w-4 h-4 rounded border-white/10 bg-white/2 accent-gold"
                        />
                        <label htmlFor="make-default" className="text-white/60 font-semibold cursor-pointer">
                          Make this my default address
                        </label>
                      </div>

                      {/* Collapsible Delivery Instructions */}
                      <div className="border-t border-white/5 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowInstructions(!showInstructions)}
                          className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-light font-bold"
                        >
                          <span>Delivery instructions (optional)</span>
                          <span className="opacity-45 font-normal">•</span>
                          <span>Add preferences, notes, access codes and more</span>
                          {showInstructions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {showInstructions && (
                          <textarea
                            rows={3}
                            placeholder="Add access codes, safe drop locations, or courier preferences..."
                            value={instructionsText}
                            onChange={(e) => setInstructionsText(e.target.value)}
                            className="w-full mt-3 p-3 rounded-xl input-dark text-xs"
                          />
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="px-4 py-3 rounded-xl text-white/50 hover:text-cream text-xs uppercase tracking-widest font-black"
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          disabled={savingAddress}
                          className="btn-gold px-6 py-3 rounded-xl text-xs uppercase tracking-widest font-black flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                        >
                          {savingAddress ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 text-ink" />
                          )}
                          Save Address for later
                        </button>
                      </div>

                    </form>
                  </div>
                )}

                {/* safeguard warranty details */}
                <div className="glass bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 flex gap-4 text-emerald-400 shadow-sm leading-relaxed">
                  <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-emerald-400">Global Buyer Safeguard Warranty</h4>
                    <p className="text-[11px] sm:text-xs text-emerald-400/80 font-medium mt-1">
                      Your shipment is trackable with direct insurance cover. We hold any disputed charge back for verified condition matches, keeping global peer transactions honest and efficient.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Payment step with active address block */}
            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">

                {/* selected address summary summary card */}
                <div className="glass rounded-2.5xl p-5 border border-white/5 flex items-start justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gold shrink-0" />
                      <h4 className="text-cream text-xs font-bold">Delivering to:</h4>
                    </div>
                    {selectedAddress && (
                      <div className="text-[11px] sm:text-xs text-white/60 font-medium leading-relaxed pl-6">
                        <p className="font-bold text-cream">{selectedAddress.fullName}</p>
                        <p className="opacity-95">{selectedAddress.addressLine1}{selectedAddress.addressLine2 ? `, ${selectedAddress.addressLine2}` : ''}</p>
                        <p className="opacity-95">{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pinCode} | India</p>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1.5">
                          Estimated delivery: Tomorrow, 10:00 AM - 2:00 PM
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-gold hover:text-gold-light text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                {/* Payment selectors block */}
                <div className="glass rounded-3xl p-6 border border-white/5 space-y-6 shadow-2xl">
                  <div>
                    <h3 className="text-cream text-sm sm:text-base font-bold">Payment Methods</h3>
                    <p className="text-white/40 text-[11px] font-semibold mt-0.5">Choose a convenient Peer transaction gateway.</p>
                  </div>

                  <div className="space-y-4">

                    {/* Method 1: CREDIT / DEBIT CARD */}
                    <div
                      onClick={() => setPaymentMethod('CARD')}
                      className={`glass rounded-2.5xl border p-5 cursor-pointer select-none transition-all duration-300 ${paymentMethod === 'CARD'
                          ? 'border-gold bg-gold/[0.03] shadow-lg'
                          : 'border-white/5 hover:border-white/12'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${paymentMethod === 'CARD' ? 'border-gold bg-transparent' : 'border-white/30'}`}>
                            {paymentMethod === 'CARD' && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#C9A84C' }} />}
                          </div>
                          <span className="text-cream text-xs font-black uppercase tracking-widest">Credit / Debit Card</span>
                        </div>
                        <CreditCard className="w-4 h-4 text-white/40" />
                      </div>

                      {paymentMethod === 'CARD' && (
                        <div className="space-y-4 pt-2 text-xs font-semibold animate-fadeIn">
                          <div>
                            <label className="text-[10px] text-white/45 font-bold uppercase tracking-wider block mb-1.5">Card Number</label>
                            <input
                              type="text"
                              maxLength={19}
                              placeholder="XXXX XXXX XXXX XXXX"
                              value={cardDetails.number}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim()
                                setCardDetails({ ...cardDetails, number: val })
                              }}
                              className="w-full px-4 py-3 rounded-xl input-dark text-xs font-mono"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] text-white/45 font-bold uppercase tracking-wider block mb-1.5">Expiry Date</label>
                              <input
                                type="text"
                                maxLength={5}
                                placeholder="MM / YY"
                                value={cardDetails.expiry}
                                onChange={(e) => {
                                  let val = e.target.value.replace(/\D/g, '')
                                  if (val.length > 2) val = `${val.substring(0, 2)}/${val.substring(2, 4)}`
                                  setCardDetails({ ...cardDetails, expiry: val })
                                }}
                                className="w-full px-4 py-3 rounded-xl input-dark text-xs font-mono text-center"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] text-white/45 font-bold uppercase tracking-wider block mb-1.5">CVV</label>
                              <input
                                type="password"
                                maxLength={3}
                                placeholder="***"
                                value={cardDetails.cvv}
                                onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '') })}
                                className="w-full px-4 py-3 rounded-xl input-dark text-xs font-mono text-center"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] text-white/45 font-bold uppercase tracking-wider block mb-1.5">Cardholder Name</label>
                            <input
                              type="text"
                              placeholder="Name as on card"
                              value={cardDetails.name}
                              onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl input-dark text-xs"
                            />
                          </div>

                          <button
                            type="button"
                            className="w-full py-3 bg-emerald-600/90 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-4 h-4 text-white" />
                            Save Card for Later
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Method 2: PAY USING UPI ID */}
                    <div
                      onClick={() => setPaymentMethod('UPI_ID')}
                      className={`glass rounded-2.5xl border p-5 cursor-pointer select-none transition-all duration-300 ${paymentMethod === 'UPI_ID'
                          ? 'border-gold bg-gold/[0.03] shadow-lg'
                          : 'border-white/5 hover:border-white/12'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${paymentMethod === 'UPI_ID' ? 'border-gold bg-transparent' : 'border-white/30'}`}>
                            {paymentMethod === 'UPI_ID' && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#C9A84C' }} />}
                          </div>
                          <span className="text-cream text-xs font-black uppercase tracking-widest">Pay using UPI ID</span>
                        </div>
                      </div>

                      {paymentMethod === 'UPI_ID' && (
                        <div className="space-y-3 pt-4 text-xs font-semibold animate-fadeIn">
                          <div>
                            <label className="text-[10px] text-white/45 font-bold uppercase tracking-wider block mb-1.5">UPI Address / VPA</label>
                            <input
                              type="text"
                              placeholder="username@bank"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl input-dark text-xs font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Method 3: SCAN AND PAY WITH UPI */}
                    <div
                      onClick={() => setPaymentMethod('UPI_SCAN')}
                      className={`glass rounded-2.5xl border p-5 cursor-pointer select-none transition-all duration-300 ${paymentMethod === 'UPI_SCAN'
                          ? 'border-gold bg-gold/[0.03] shadow-lg'
                          : 'border-white/5 hover:border-white/12'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${paymentMethod === 'UPI_SCAN' ? 'border-gold bg-transparent' : 'border-white/30'}`}>
                            {paymentMethod === 'UPI_SCAN' && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#C9A84C' }} />}
                          </div>
                          <span className="text-cream text-xs font-black uppercase tracking-widest">Scan and Pay with UPI</span>
                        </div>
                      </div>

                      {paymentMethod === 'UPI_SCAN' && (
                        <div className="pt-4 text-center space-y-3 animate-fadeIn">
                          <div className="w-36 h-36 bg-white p-3 rounded-2xl mx-auto shadow-inner border border-white/10 flex items-center justify-center">
                            <img
                              src="/image.png"
                              alt="UPI QR Code"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-wide">Scan QR using any UPI app (GPay, PhonePe, Paytm)</p>
                        </div>
                      )}
                    </div>

                    {/* Method 4: CASH ON DELIVERY */}
                    <div
                      onClick={() => setPaymentMethod('COD')}
                      className={`glass rounded-2.5xl border p-5 cursor-pointer select-none transition-all duration-300 ${paymentMethod === 'COD'
                          ? 'border-gold bg-gold/[0.03] shadow-lg'
                          : 'border-white/5 hover:border-white/12'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${paymentMethod === 'COD' ? 'border-gold bg-transparent' : 'border-white/30'}`}>
                            {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#C9A84C' }} />}
                          </div>
                          <span className="text-cream text-xs font-black uppercase tracking-widest">Cash on Delivery</span>
                        </div>
                      </div>

                      {paymentMethod === 'COD' && (
                        <div className="pt-3 text-[11px] text-white/50 leading-relaxed font-semibold pl-6 animate-fadeIn">
                          A small fee might apply on home inspections. Please verify the book physical condition directly with the peer courier agent upon exchange before dispersing payment.
                        </div>
                      )}
                    </div>

                  </div>
                </div>

              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Price Breakdown Sidebar */}
          <div className="lg:col-span-4 space-y-4">

            {/* Textbook Summary Card */}
            <div className="glass rounded-3xl p-6 border border-white/5 space-y-6 shadow-2xl">
              <div>
                <h3 className="text-cream text-xs font-black uppercase tracking-wider mb-4">Review booked items (1)</h3>

                <div className="flex gap-4">
                  <div className="w-16 h-20 bg-white/2 border border-white/5 rounded-xl shrink-0 overflow-hidden flex items-center justify-center">
                    {book.images.length > 0 ? (
                      <img
                        src={book.images[0].imageUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="w-6 h-6 text-white/10" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <h4 className="text-cream font-bold text-xs truncate leading-snug">{book.title}</h4>
                    <p className="text-[10px] text-white/40 font-bold truncate">By {book.author}</p>
                    <div className="inline-block px-2 py-0.5 bg-gold/10 border border-gold/25 rounded-md text-[9px] text-gold font-extrabold uppercase tracking-wide">
                      Condition Rating: {book.conditionScore}/10
                    </div>
                    <p className="text-[10px] text-white/30 font-semibold truncate">Seller: {book.seller.fullName}</p>
                  </div>
                </div>
              </div>

              {/* Price calculations */}
              <div className="border-t border-white/5 pt-4 space-y-3 font-semibold text-xs text-white/60">
                <span className="text-[10px] text-white/30 font-extrabold uppercase tracking-widest block mb-1">Price Breakdown</span>

                <div className="flex justify-between">
                  <span>Subtotal price</span>
                  <span className="text-cream font-bold">{formatPrice(subtotalPrice)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span className="text-cream font-bold">{formatPrice(platformFee)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Standard Insured Shipping</span>
                  <span className="text-emerald-400 font-extrabold uppercase tracking-wider text-[10px]">Free</span>
                </div>

                <div className="flex justify-between items-baseline border-t border-white/5 pt-4">
                  <span className="text-[10.5px] text-white/40 font-extrabold uppercase tracking-wider">Total Price Check</span>
                  <span className="text-gold-light font-black text-xl sm:text-2xl">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {/* Step CTA Button */}
              <div>
                {step === 1 ? (
                  <button
                    onClick={() => {
                      if (!selectedAddressId) {
                        setApiError('Please select or add a delivery address to proceed.')
                        return
                      }
                      setStep(2)
                      setApiError('')
                    }}
                    className="w-full py-3.5 btn-gold hover:opacity-95 text-ink font-bold text-xs uppercase tracking-widest rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer select-none active:scale-[0.98] transition-all"
                  >
                    <ArrowLeft className="w-4 h-4 text-ink rotate-180 shrink-0" />
                    Proceed to Payment ({formatPrice(totalPrice)})
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={submittingOrder}
                    className="w-full py-3.5 bg-gradient-to-r from-gold-light to-gold hover:opacity-95 text-ink font-bold text-xs uppercase tracking-widest rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer select-none active:scale-[0.98] transition-all disabled:opacity-60"
                  >
                    {submittingOrder ? (
                      <Loader2 className="w-4.5 h-4.5 animate-spin text-ink" />
                    ) : (
                      <Lock className="w-4 h-4 text-ink shrink-0" />
                    )}
                    {submittingOrder ? 'Processing...' : `Pay Now (${formatPrice(totalPrice)})`}
                  </button>
                )}

                {step === 2 && (
                  <button
                    onClick={() => setStep(1)}
                    className="w-full text-center text-[10px] text-white/30 hover:text-cream font-bold uppercase tracking-widest mt-3 transition-colors cursor-pointer select-none"
                  >
                    Modify delivery details
                  </button>
                )}
              </div>

              {/* SSL connection info */}
              <div className="flex items-center gap-1.5 justify-center text-[9px] text-white/35 font-extrabold tracking-widest uppercase py-1 select-none">
                <Lock className="w-3 h-3 text-white/30" />
                <span>Fully Secured 256-bit Connection</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
