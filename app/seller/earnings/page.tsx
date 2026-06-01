'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { DollarSign, TrendingUp, Clock, ArrowLeft, Download } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import Link from 'next/link'

export default function SellerEarningsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<{ totalEarnings: number; pendingPayout: number } | null>(null)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => { if (!loading && !user) router.push('/auth/login') }, [user, loading])

  useEffect(() => {
    if (!user) return
    fetch('/api/seller/dashboard').then(r => r.json()).then(d => { if (d.success) setStats(d.data) })
    fetch('/api/seller/orders').then(r => r.json()).then(d => { if (d.success) setOrders(d.data.orders || []) })
  }, [user])

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-7">
          <Link href="/seller/dashboard" className="w-9 h-9 glass rounded-xl flex items-center justify-center text-white/40 hover:text-cream transition-colors"><ArrowLeft size={15} /></Link>
          <h1 className="font-display text-2xl font-bold text-cream">Earnings</h1>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { label: 'Total Earnings', value: stats ? formatPrice(stats.totalEarnings) : '—', icon: DollarSign, color: 'text-emerald-400', bg: 'from-emerald-500/10' },
            { label: 'Pending Payout', value: stats ? formatPrice(stats.pendingPayout) : '—', icon: Clock, color: 'text-gold', bg: 'from-gold/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`glass rounded-2xl p-6 border border-white/5 bg-gradient-to-b ${bg} to-transparent`}>
              <Icon size={20} className={`${color} mb-3`} />
              <div className="font-bold text-cream text-2xl">{value}</div>
              <div className="text-white/40 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>

        {(stats?.pendingPayout || 0) > 0 && (
          <div className="glass-gold rounded-2xl p-5 mb-6 flex items-center justify-between">
            <div>
              <div className="font-semibold text-cream text-sm">Withdraw Earnings</div>
              <div className="text-white/40 text-xs mt-0.5">Transfer to your bank account</div>
            </div>
            <button className="btn-gold px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
              <TrendingUp size={13} /> Withdraw
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-cream">Transaction History</h2>
          <button className="text-xs text-gold/60 hover:text-gold flex items-center gap-1"><Download size={11} />Export CSV</button>
        </div>

        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          {orders.length === 0 ? (
            <div className="text-center py-10 text-white/30 text-sm">No transactions yet</div>
          ) : orders.slice(0, 10).map((o: Order, i: number) => (
            <div key={o.id} className={`flex items-center justify-between px-5 py-4 ${i < Math.min(orders.length, 10) - 1 ? 'border-b border-white/5' : ''}`}>
              <div>
                <div className="text-cream text-sm font-medium">#{o.orderNumber}</div>
                <div className="text-white/30 text-xs mt-0.5">{formatDate(o.createdAt)}</div>
              </div>
              <div className="text-right">
                <div className="text-emerald-400 font-semibold text-sm">+{formatPrice(o.sellerPayout)}</div>
                <div className="text-white/30 text-xs">{o.paymentStatus}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface Order { id: string; orderNumber: string; createdAt: string; sellerPayout: number; paymentStatus: string }
