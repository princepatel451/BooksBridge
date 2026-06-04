'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { 
  Package, 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  MapPin, 
  CreditCard, 
  User, 
  Mail, 
  Phone,
  ShieldCheck,
  Calendar,
  DollarSign
} from 'lucide-react'
import { formatPrice, formatDate, getConditionLabel, getConditionColor } from '@/lib/utils'
import Link from 'next/link'

interface TrackingEvent {
  id: string
  status: string
  timestamp: string
  description?: string
}

interface OrderDetails {
  id: string
  orderNumber: string
  buyerId: string
  sellerId: string
  bookId: string
  deliveryAddressSnapshot: {
    fullName: string
    phone: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pinCode: string
  }
  sellingPrice: number
  platformFee: number
  discountAmount: number
  deliveryCharge: number
  totalAmount: number
  paymentStatus: string
  orderStatus: string
  cancellationReason?: string
  cancelledBy?: string
  createdAt: string
  deliveredAt?: string
  book: {
    id: string
    title: string
    author: string
    edition?: string
    conditionScore: number
    conditionNotes?: string
    images: { imageUrl: string }[]
    seller: {
      id: string
      fullName: string
      email: string
      phone?: string
    }
  }
  buyer: {
    id: string
    fullName: string
    email: string
    phone?: string
  }
  tracking: TrackingEvent[]
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PLACED: { label: 'Order Placed', color: 'badge-blue', icon: Package },
  ACCEPTED: { label: 'Accepted', color: 'badge-blue', icon: ShieldCheck },
  PICKUP_SCHEDULED: { label: 'Pickup Scheduled', color: 'badge-gold', icon: Clock },
  PICKED_UP: { label: 'Picked Up', color: 'badge-gold', icon: Package },
  IN_TRANSIT: { label: 'In Transit', color: 'badge-gold', icon: Truck },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'badge-gold', icon: Truck },
  DELIVERED: { label: 'Delivered', color: 'badge-green', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'badge-red', icon: XCircle },
}

// 5 core stages for the horizontal timeline
const TIMELINE_STAGES = [
  { key: 'PLACED', label: 'Ordered', icon: Package },
  { key: 'ACCEPTED', label: 'Accepted', icon: ShieldCheck },
  { key: 'PICKED_UP', label: 'Picked Up', icon: Package },
  { key: 'IN_TRANSIT', label: 'In Transit', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
]

export default function OrderTrackingPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading])

  useEffect(() => {
    if (!orderId) return

    const fetchOrderDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/orders/${orderId}`)
        const data = await response.json()
        
        if (data.success) {
          setOrder(data.data.order)
        } else {
          setError(data.message || 'Failed to fetch order details')
        }
      } catch (err) {
        setError('An error occurred while loading order details')
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-20 pb-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-gold/20 border-t-gold animate-spin mx-auto" />
          <p className="text-white/40 text-sm">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen pt-20 pb-16 flex items-center justify-center px-4">
        <div className="glass rounded-3xl p-8 max-w-md w-full border border-white/5 text-center">
          <XCircle size={48} className="text-danger mx-auto mb-4" />
          <h2 className="text-xl font-bold text-cream mb-2">Order Not Found</h2>
          <p className="text-white/40 text-sm mb-6">{error || "This order details couldn't be loaded."}</p>
          <Link href="/orders" className="btn-gold px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Back to My Orders
          </Link>
        </div>
      </div>
    )
  }

  const isBuyer = order.buyerId === user?.id
  const counterPartyRole = isBuyer ? 'Seller' : 'Buyer'
  const counterParty = isBuyer ? order.book.seller : order.buyer

  const currentStatus = order.orderStatus
  const isCancelled = currentStatus === 'CANCELLED'

  // Map internal database status to horizontal timeline index
  const getTimelineProgressIndex = (status: string) => {
    switch (status) {
      case 'PLACED':
        return 0
      case 'ACCEPTED':
      case 'PICKUP_SCHEDULED':
        return 1
      case 'PICKED_UP':
        return 2
      case 'IN_TRANSIT':
      case 'OUT_FOR_DELIVERY':
        return 3
      case 'DELIVERED':
        return 4
      default:
        return 0
    }
  }

  const activeIndex = isCancelled ? -1 : getTimelineProgressIndex(currentStatus)
  const progressPercent = isCancelled ? 0 : (activeIndex / 4) * 100

  // Helper to find tracking log timestamp for a status key
  const getEventTime = (statusKey: string) => {
    const event = order.tracking.find(t => {
      if (statusKey === 'ACCEPTED') {
        return ['ACCEPTED', 'PICKUP_SCHEDULED'].includes(t.status)
      }
      if (statusKey === 'IN_TRANSIT') {
        return ['IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(t.status)
      }
      return t.status === statusKey
    })
    return event ? new Date(event.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null
  }

  const getEventDate = (statusKey: string) => {
    const event = order.tracking.find(t => {
      if (statusKey === 'ACCEPTED') {
        return ['ACCEPTED', 'PICKUP_SCHEDULED'].includes(t.status)
      }
      if (statusKey === 'IN_TRANSIT') {
        return ['IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(t.status)
      }
      return t.status === statusKey
    })
    return event ? new Date(event.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : null
  }

  const statusConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.PLACED
  const StatusIcon = statusConfig.icon

  return (
    <div className="min-h-screen pt-20 pb-16 bg-hero">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Back navigation & Header */}
        <div className="mb-8">
          <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-cream transition-colors mb-4">
            <ArrowLeft size={16} /> Back to My Orders
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-cream">Order details</h1>
                <span className={`badge ${statusConfig.color} px-3 py-1 text-[10px] md:text-xs`}>
                  <StatusIcon size={12} /> {statusConfig.label}
                </span>
              </div>
              <p className="text-white/40 text-xs md:text-sm">
                Order <span className="text-gold font-mono">#{order.orderNumber}</span> · Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            {isCancelled && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 max-w-md">
                <div className="text-red-400 font-semibold text-xs uppercase tracking-wider mb-0.5">Order Cancelled</div>
                <p className="text-white/60 text-xs">
                  Reason: {order.cancellationReason || 'No reason provided.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stepper progress tracker */}
        <div className="glass rounded-3xl p-6 md:p-8 border border-white/5 mb-8 overflow-hidden relative">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-8 flex items-center gap-2">
            <Truck size={16} className="text-gold" /> Delivery Progress
          </h2>
          
          <div className="relative pt-4 pb-8 px-4 md:px-12">
            {/* Stepper bar container */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-[22px] rounded-full mx-10 md:mx-20" />
            <div 
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-gold to-gold-light -translate-y-[22px] rounded-full transition-all duration-700 ease-out mx-10 md:mx-20" 
              style={{ width: `calc(${progressPercent}% - 4px)` }}
            />

            {/* Stage nodes */}
            <div className="relative flex justify-between">
              {TIMELINE_STAGES.map((stage, idx) => {
                const reached = !isCancelled && activeIndex >= idx
                const active = !isCancelled && activeIndex === idx
                const StageIcon = stage.icon
                
                const eventTime = getEventTime(stage.key)
                const eventDate = getEventDate(stage.key)

                return (
                  <div key={stage.key} className="flex flex-col items-center text-center relative z-10">
                    {/* Ring/Sphere */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      reached 
                        ? 'bg-gradient-to-br from-gold-light to-gold text-ink font-bold shadow-[0_0_15px_rgba(201,168,76,0.3)]' 
                        : 'bg-ink-soft border-2 border-white/10 text-white/30'
                    } ${active ? 'ring-4 ring-gold/25 scale-110' : ''}`}>
                      <StageIcon size={16} />
                    </div>

                    {/* Stage Label */}
                    <span className={`text-[10px] md:text-xs font-semibold mt-3 transition-colors ${
                      reached ? 'text-cream' : 'text-white/30'
                    }`}>
                      {stage.label}
                    </span>

                    {/* Date/Time detail */}
                    {reached && eventDate && (
                      <div className="mt-1 flex flex-col text-[8px] md:text-[10px] text-white/40">
                        <span>{eventDate}</span>
                        <span>{eventTime}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Column 1: Book details */}
          <div className="glass rounded-3xl p-6 border border-white/5 flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2">
              <BookOpen size={14} className="text-gold" /> Item Details
            </h3>
            <div className="flex gap-4 flex-1">
              <div className="w-18 h-24 bg-white/5 rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                {order.book.images[0] ? (
                  <img src={order.book.images[0].imageUrl} alt={order.book.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={20} className="text-white/10" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h4 className="text-cream text-sm font-semibold line-clamp-2 leading-snug mb-1">{order.book.title}</h4>
                  <p className="text-white/45 text-xs mb-2">by {order.book.author}</p>
                  {order.book.edition && (
                    <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/40 border border-white/5">{order.book.edition} Edition</span>
                  )}
                </div>
                <div className="pt-2">
                  <span className={`text-[10px] font-bold uppercase ${getConditionColor(order.book.conditionScore)}`}>
                    {getConditionLabel(order.book.conditionScore)} ({order.book.conditionScore}/10)
                  </span>
                </div>
              </div>
            </div>
            {order.book.conditionNotes && (
              <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5 text-[11px] text-white/50">
                <span className="font-semibold text-white/60">Condition Notes:</span> {order.book.conditionNotes}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-xs text-white/40">Listing Price</span>
              <span className="text-gold-light font-semibold text-sm">{formatPrice(order.sellingPrice)}</span>
            </div>
          </div>

          {/* Column 2: Shipping details */}
          <div className="glass rounded-3xl p-6 border border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2">
              <MapPin size={14} className="text-gold" /> Shipping Address
            </h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-2.5">
                <User size={14} className="text-white/30 mt-0.5" />
                <span className="text-cream font-medium">{order.deliveryAddressSnapshot.fullName}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone size={14} className="text-white/30 mt-0.5" />
                <span className="text-white/60">{order.deliveryAddressSnapshot.phone}</span>
              </div>
              <div className="flex items-start gap-2.5 pt-2 border-t border-white/5">
                <MapPin size={14} className="text-white/30 mt-0.5" />
                <div className="text-white/60 leading-relaxed">
                  <p>{order.deliveryAddressSnapshot.addressLine1}</p>
                  {order.deliveryAddressSnapshot.addressLine2 && <p>{order.deliveryAddressSnapshot.addressLine2}</p>}
                  <p className="mt-1 text-cream font-medium">
                    {order.deliveryAddressSnapshot.city}, {order.deliveryAddressSnapshot.state} - {order.deliveryAddressSnapshot.pinCode}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Payment details */}
          <div className="glass rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-2">
                  <CreditCard size={14} className="text-gold" /> Payment Info
                </h3>
                <span className={`badge ${order.paymentStatus === 'PAID' ? 'badge-green' : 'badge-gold'} text-[9px]`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/40">Selling Price</span>
                  <span className="text-white/80">{formatPrice(order.sellingPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Delivery Charge</span>
                  <span className="text-white/80">{order.deliveryCharge > 0 ? formatPrice(order.deliveryCharge) : 'Free'}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                {isBuyer ? null : (
                  <div className="flex justify-between text-red-400">
                    <span>Platform Fee ({process.env.PLATFORM_FEE_PERCENT || '10'}%)</span>
                    <span>-{formatPrice(order.platformFee)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/5">
              <div className="flex justify-between items-baseline mb-3">
                <span className="text-xs font-semibold text-white/50">{isBuyer ? 'Total Paid' : 'Your Earnings'}</span>
                <span className="text-xl font-bold text-gold-light">
                  {formatPrice(isBuyer ? order.totalAmount : order.sellingPrice - order.platformFee)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/35 bg-white/5 p-2 rounded-lg">
                <DollarSign size={10} className="text-gold" />
                <span>Transaction processed securely via Razorpay</span>
              </div>
            </div>
          </div>

        </div>

        {/* Second Grid: Role-specific Context & Activity Logs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Buyer/Seller Details */}
          <div className="glass rounded-3xl p-6 border border-white/5 h-fit">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2">
              <User size={14} className="text-gold" /> {counterPartyRole} Information
            </h3>
            
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/30 to-gold-light/10 border border-gold/20 flex items-center justify-center text-gold font-bold uppercase text-sm">
                {counterParty.fullName.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <div className="text-cream text-sm font-semibold line-clamp-1">{counterParty.fullName}</div>
                <div className="text-white/40 text-[10px] capitalize">Verified BookBridge {counterPartyRole.toLowerCase()}</div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-white/60">
                <Mail size={13} className="text-white/30" />
                <span className="truncate">{counterParty.email}</span>
              </div>
              {counterParty.phone && (
                <div className="flex items-center gap-2.5 text-white/60">
                  <Phone size={13} className="text-white/30" />
                  <span>{counterParty.phone}</span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-5 border-t border-white/5 space-y-2">
              <a href={`mailto:${counterParty.email}`} className="btn-ghost w-full py-2.5 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5">
                <Mail size={13} /> Email {counterPartyRole}
              </a>
            </div>
          </div>

          {/* Detailed Activity Logs (Timeline) */}
          <div className="glass rounded-3xl p-6 border border-white/5 md:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-6 flex items-center gap-2">
              <Calendar size={14} className="text-gold" /> Status History Log
            </h3>

            <div className="relative pl-6 border-l border-white/10 space-y-6 ml-2.5">
              {order.tracking.map((event, index) => {
                const isLatest = index === order.tracking.length - 1
                return (
                  <div key={event.id} className="relative">
                    {/* Stepper Dot */}
                    <div className={`absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full border-2 bg-ink transition-all ${
                      isLatest 
                        ? 'border-gold-light scale-110 shadow-[0_0_8px_rgba(201,168,76,0.5)]' 
                        : 'border-white/20'
                    }`} />

                    <div>
                      <div className="flex items-baseline justify-between gap-4 mb-0.5">
                        <h4 className={`text-xs font-semibold ${isLatest ? 'text-gold-light' : 'text-cream'}`}>
                          {STATUS_CONFIG[event.status]?.label || event.status}
                        </h4>
                        <span className="text-[10px] text-white/30">
                          {new Date(event.timestamp).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-[11px] text-white/50 leading-relaxed">{event.description}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
