'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { BookOpen, Search, ShoppingCart, Bell, User, Menu, X, ChevronDown, LogOut, LayoutDashboard, Package, Heart } from 'lucide-react'

export function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-ink/90 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-muted flex items-center justify-center">
              <BookOpen size={16} className="text-ink" />
            </div>
            <span className="font-display text-xl font-bold text-cream">Book<span className="text-gold">Bridge</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/books" className="text-white/60 hover:text-cream text-sm font-medium transition-colors">Browse Books</Link>
            <Link href="/#how-it-works" className="text-white/60 hover:text-cream text-sm font-medium transition-colors">How It Works</Link>
            <Link href="/#categories" className="text-white/60 hover:text-cream text-sm font-medium transition-colors">Categories</Link>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/books" className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/50 hover:text-cream transition-colors">
              <Search size={16} />
            </Link>

            {user ? (
              <>
                <Link href="/cart" className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/50 hover:text-cream transition-colors">
                  <ShoppingCart size={16} />
                </Link>
                <Link href="/notifications" className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/50 hover:text-cream transition-colors">
                  <Bell size={16} />
                </Link>
                <div className="relative">
                  <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 glass rounded-xl px-3 py-2 text-sm hover:bg-white/8 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold to-gold-muted flex items-center justify-center text-ink text-xs font-bold">
                      {user.fullName[0]}
                    </div>
                    <span className="text-cream/80 text-xs font-medium max-w-[80px] truncate">{user.fullName.split(' ')[0]}</span>
                    <ChevronDown size={12} className={`text-white/40 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 top-12 w-52 glass rounded-2xl overflow-hidden shadow-2xl border border-white/10 py-1">
                      <div className="px-4 py-3 border-b border-white/5">
                        <div className="text-cream text-sm font-medium">{user.fullName}</div>
                        <div className="text-white/40 text-xs mt-0.5">{user.email}</div>
                      </div>
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-cream hover:bg-white/5 transition-colors" onClick={() => setProfileOpen(false)}>
                        <User size={14} /> My Profile
                      </Link>
                      <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-cream hover:bg-white/5 transition-colors" onClick={() => setProfileOpen(false)}>
                        <Package size={14} /> My Orders
                      </Link>
                      <Link href="/wishlist" className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-cream hover:bg-white/5 transition-colors" onClick={() => setProfileOpen(false)}>
                        <Heart size={14} /> Wishlist
                      </Link>
                      {user.isSeller && (
                        <Link href="/seller/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gold/80 hover:text-gold hover:bg-white/5 transition-colors" onClick={() => setProfileOpen(false)}>
                          <LayoutDashboard size={14} /> Seller Dashboard
                        </Link>
                      )}
                      {user.role === 'ADMIN' && (
                        <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-400/80 hover:text-blue-400 hover:bg-white/5 transition-colors" onClick={() => setProfileOpen(false)}>
                          <LayoutDashboard size={14} /> Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-white/5 mt-1">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400/70 hover:text-red-400 hover:bg-white/5 transition-colors">
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost text-sm px-5 py-2 rounded-xl font-medium">Login</Link>
                <Link href="/auth/register" className="btn-gold text-sm px-5 py-2 rounded-xl font-medium">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden w-9 h-9 glass rounded-xl flex items-center justify-center">
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden glass rounded-2xl mb-3 p-4 space-y-2 border border-white/10">
            <Link href="/books" className="block py-2.5 px-3 text-sm text-white/70 hover:text-cream rounded-xl hover:bg-white/5" onClick={() => setMobileOpen(false)}>Browse Books</Link>
            <Link href="/#how-it-works" className="block py-2.5 px-3 text-sm text-white/70 hover:text-cream rounded-xl hover:bg-white/5" onClick={() => setMobileOpen(false)}>How It Works</Link>
            {user ? (
              <>
                <Link href="/profile" className="block py-2.5 px-3 text-sm text-white/70 hover:text-cream rounded-xl hover:bg-white/5" onClick={() => setMobileOpen(false)}>Profile</Link>
                <button onClick={handleLogout} className="w-full text-left py-2.5 px-3 text-sm text-red-400/70 hover:text-red-400 rounded-xl hover:bg-white/5">Sign Out</button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link href="/auth/login" className="flex-1 btn-ghost text-sm py-2.5 rounded-xl text-center font-medium" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link href="/auth/register" className="flex-1 btn-gold text-sm py-2.5 rounded-xl text-center font-medium" onClick={() => setMobileOpen(false)}>Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
