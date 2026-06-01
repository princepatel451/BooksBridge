'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Search, ShieldCheck, UserX, UserCheck, MoreVertical, ArrowLeft } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

interface AdminUser { id: string; fullName: string; email: string; phone?: string; role: string; city?: string; isSeller: boolean; isActive: boolean; isSuspended: boolean; isBlocked: boolean; createdAt: string; sellerProfile?: { verificationStatus: string; avgRating: number } }

export default function AdminUsersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [dataLoading, setDataLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionUser, setActionUser] = useState<string | null>(null)

  useEffect(() => { if (!loading && (!user || user.role !== 'ADMIN')) router.push('/') }, [user, loading])

  const fetchUsers = () => {
    setDataLoading(true)
    fetch(`/api/admin/users?search=${search}`).then(r => r.json()).then(d => {
      if (d.success) { setUsers(d.data.users); setTotal(d.data.total) }
    }).finally(() => setDataLoading(false))
  }

  useEffect(() => { if (user?.role === 'ADMIN') fetchUsers() }, [user, search])

  const doAction = async (userId: string, action: string) => {
    await fetch(`/api/admin/users/${userId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) })
    fetchUsers(); setActionUser(null)
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-7">
          <Link href="/admin/dashboard" className="w-9 h-9 glass rounded-xl flex items-center justify-center text-white/40 hover:text-cream transition-colors">
            <ArrowLeft size={15} />
          </Link>
          <h1 className="font-display text-2xl font-bold text-cream">User Management</h1>
          <span className="badge badge-blue">{total} users</span>
        </div>

        <div className="relative mb-5">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input-dark w-full max-w-md pl-11 pr-4 py-3 rounded-xl text-sm" placeholder="Search by name or email..." />
        </div>

        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs text-white/40 uppercase tracking-wider">
                  {['User', 'Role', 'City', 'Seller Status', 'Account', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataLoading ? Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-white/5"><td colSpan={7} className="px-5 py-4"><div className="h-4 shimmer rounded-lg w-full" /></td></tr>
                )) : users.map(u => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-cream">{u.fullName}</div>
                      <div className="text-white/35 text-xs">{u.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`badge py-0.5 ${u.role === 'ADMIN' ? 'badge-blue' : u.isSeller ? 'badge-gold' : 'badge-green'}`}>{u.role}</span>
                    </td>
                    <td className="px-5 py-3.5 text-white/40">{u.city || '—'}</td>
                    <td className="px-5 py-3.5">
                      {u.sellerProfile ? (
                        <span className={`badge py-0.5 ${u.sellerProfile.verificationStatus === 'VERIFIED' ? 'badge-green' : 'badge-gold'}`}>
                          {u.sellerProfile.verificationStatus}
                        </span>
                      ) : <span className="text-white/25 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`badge py-0.5 ${u.isBlocked ? 'badge-red' : u.isSuspended ? 'badge-gold' : 'badge-green'}`}>
                        {u.isBlocked ? 'Blocked' : u.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-white/30 text-xs">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="relative">
                        <button onClick={() => setActionUser(actionUser === u.id ? null : u.id)} className="w-7 h-7 glass rounded-lg flex items-center justify-center text-white/30 hover:text-cream transition-colors">
                          <MoreVertical size={12} />
                        </button>
                        {actionUser === u.id && (
                          <div className="absolute right-0 top-8 z-10 glass rounded-xl shadow-xl border border-white/10 py-1 w-40">
                            {!u.isSuspended ? (
                              <button onClick={() => doAction(u.id, 'suspend')} className="w-full text-left px-4 py-2 text-xs text-amber-400 hover:bg-white/5">Suspend</button>
                            ) : (
                              <button onClick={() => doAction(u.id, 'unsuspend')} className="w-full text-left px-4 py-2 text-xs text-emerald-400 hover:bg-white/5">Unsuspend</button>
                            )}
                            {!u.isBlocked ? (
                              <button onClick={() => doAction(u.id, 'block')} className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-white/5">Block</button>
                            ) : (
                              <button onClick={() => doAction(u.id, 'unblock')} className="w-full text-left px-4 py-2 text-xs text-emerald-400 hover:bg-white/5">Unblock</button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
