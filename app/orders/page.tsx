'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Package, ChevronRight, BookOpen, Clock, CheckCircle, XCircle, Truck } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import Link from 'next/link'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Package }> = {
  PLACED: { label: 'Order Placed', color: 'badge-blue', icon: Package },
  ACCEPTED: { label: 'Accepted', color: 'badge-blue', icon: Package },
  PICKUP_SCHEDULED: { label: 'Pickup Scheduled', color: 'badge-gold', icon: Clock },
  PICKED_UP: { label: 'Picked Up', color: 'badge-gold', icon: Truck },
  IN_TRANSIT: { label: 'In Transit', color: 'badge-gold', icon: Truck },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'badge-gold', icon: Truck },
  DELIVERED: { label: 'Delivered', color: 'badge-green', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'badge-red', icon: XCircle },
}

interface Order {
  id: string; orderNumber: string; orderStatus: string; paymentStatus: string
  totalAmount: number; createdAt: string; deliveredAt?: string
  book: { id: string; title: string; author: string; images: { imageUrl: string }[] }
  tracking: { status: string; timestamp: string; description?: string }[]
}

export default function OrdersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [tab, setTab] = useState('all')

  useEffect(() => { if (!loading && !user) router.push('/auth/login') }, [user, loading])

  useEffect(() => {
    fetch('/api/orders').then(r => r.json()).then(d => { if (d.success) setOrders(d.data.orders) }).finally(() => setOrdersLoading(false))
  }, [])

  const filtered = orders.filter(o => {
    if (tab === 'active') return !['DELIVERED', 'CANCELLED'].includes(o.orderStatus)
    if (tab === 'delivered') return o.orderStatus === 'DELIVERED'
    if (tab === 'cancelled') return o.orderStatus === 'CANCELLED'
    return true
  })

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display text-3xl font-bold text-cream mb-6 flex items-center gap-3">
          <Package size={24} className="text-gold" /> My Orders
        </h1>

        {/* Tabs */}
        <div className="flex gap-1 glass rounded-xl p-1 mb-6 w-fit">
          {[['all', 'All'], ['active', 'Active'], ['delivered', 'Delivered'], ['cancelled', 'Cancelled']].map(([val, label]) => (
            <button key={val} onClick={() => setTab(val)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${tab === val ? 'btn-gold' : 'text-white/40 hover:text-cream'}`}>
              {label}
            </button>
          ))}
        </div>

        {ordersLoading ? (
          <div className="space-y-3">{Array(3).fill(0).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 border border-white/5 shimmer h-24" />
          ))}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 glass rounded-3xl border border-white/5">
            <Package size={48} className="text-white/10 mx-auto mb-4" />
            <div className="text-white/40 text-lg font-medium mb-2">No orders yet</div>
            <Link href="/books" className="btn-gold px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 mt-4">
              <BookOpen size={13} /> Browse Books
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(order => {
              const status = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PLACED
              const StatusIcon = status.icon
              return (
                <div key={order.id} className="glass rounded-2xl p-5 border border-white/5 card-hover">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-18 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 w-14 h-16">
                      {order.book.images[0] ? (
                        <img src={order.book.images[0].imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : <div className="flex items-center justify-center h-full"><BookOpen size={16} className="text-white/10" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="text-cream font-medium text-sm line-clamp-1">{order.book.title}</div>
                        <span className={`badge ${status.color} flex-shrink-0`}><StatusIcon size={9} />{status.label}</span>
                      </div>
                      <div className="text-white/30 text-xs mb-2">#{order.orderNumber} · {formatDate(order.createdAt)}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-gold-light font-semibold text-sm">{formatPrice(order.totalAmount)}</span>
                        <Link href={`/orders/${order.id}`} className="flex items-center gap-1 text-xs text-gold/70 hover:text-gold transition-colors">
                          View Details <ChevronRight size={11} />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Mini timeline */}
                  {order.tracking.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-1 overflow-x-auto">
                        {['PLACED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].map((stage, i) => {
                          const reached = ['PLACED', 'ACCEPTED', 'PICKUP_SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].indexOf(order.orderStatus) >= i
                          return (
                            <div key={stage} className="flex items-center flex-1 min-w-0">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${reached ? 'bg-gold' : 'bg-white/15'}`} />
                              {i < 4 && <div className={`flex-1 h-px ${reached ? 'bg-gold/40' : 'bg-white/10'}`} />}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
