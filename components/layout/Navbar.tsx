'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { BookOpen, Search, ShoppingCart, Bell, User, Menu, X, LogOut, LayoutDashboard, Package, Heart } from 'lucide-react'

export function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
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

  // Derive mode dynamically from the active URL path
  const isSellerMode = user && pathname.startsWith('/seller')
  const isAdminMode = user && pathname.startsWith('/admin')

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-ink/90 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-muted flex items-center justify-center">
              <BookOpen size={16} className="text-ink" />
            </div>
            <span className="font-display text-xl font-bold text-cream">Book<span className="text-gold">Bridge</span></span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {!user ? (
              <>
                <Link href="/books" className="text-white/60 hover:text-cream text-sm font-medium transition-colors">Browse Books</Link>
                <Link href="/#how-it-works" className="text-white/60 hover:text-cream text-sm font-medium transition-colors">How It Works</Link>
                <Link href="/#categories" className="text-white/60 hover:text-cream text-sm font-medium transition-colors">Categories</Link>
              </>
            ) : isSellerMode ? (
              <>
                <Link href="/seller/dashboard" className={`text-sm font-medium transition-colors ${pathname === '/seller/dashboard' ? 'text-gold' : 'text-white/60 hover:text-cream'}`}>Dashboard</Link>
                <Link href="/seller/books/add" className={`text-sm font-medium transition-colors ${pathname === '/seller/books/add' ? 'text-gold' : 'text-white/60 hover:text-cream'}`}>Add Book</Link>
                <Link href="/seller/books" className={`text-sm font-medium transition-colors ${pathname === '/seller/books' ? 'text-gold' : 'text-white/60 hover:text-cream'}`}>Listings</Link>
                <Link href="/seller/orders" className={`text-sm font-medium transition-colors ${pathname === '/seller/orders' ? 'text-gold' : 'text-white/60 hover:text-cream'}`}>Orders</Link>
              </>
            ) : isAdminMode ? (
              <>
                <Link href="/admin/dashboard" className={`text-sm font-medium transition-colors ${pathname === '/admin/dashboard' ? 'text-gold' : 'text-white/60 hover:text-cream'}`}>Admin Dashboard</Link>
                <Link href="/admin/users" className={`text-sm font-medium transition-colors ${pathname === '/admin/users' ? 'text-gold' : 'text-white/60 hover:text-cream'}`}>Manage Users</Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className={`text-sm font-medium transition-colors ${pathname === '/dashboard' ? 'text-gold' : 'text-white/60 hover:text-cream'}`}>Home</Link>
                <Link href="/books" className={`text-sm font-medium transition-colors ${pathname === '/books' ? 'text-gold' : 'text-white/60 hover:text-cream'}`}>Browse</Link>
                <Link href="/orders" className={`text-sm font-medium transition-colors ${pathname === '/orders' ? 'text-gold' : 'text-white/60 hover:text-cream'}`}>Orders</Link>
              </>
            )}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <>
                <Link href="/books" className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/50 hover:text-cream transition-colors">
                  <Search size={16} />
                </Link>
                <Link href="/auth/login" className="btn-ghost text-sm px-5 py-2 rounded-xl font-medium">Login</Link>
                <Link href="/auth/register" className="btn-gold text-sm px-5 py-2 rounded-xl font-medium">Sign Up</Link>
              </>
            ) : (
              <>
                {/* Search Icon - Buyer Mode Only */}
                {!isSellerMode && !isAdminMode && (
                  <Link href="/books" className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/50 hover:text-cream transition-colors">
                    <Search size={16} />
                  </Link>
                )}

                {/* Cart Icon - Buyer Mode Only */}
                {!isSellerMode && !isAdminMode && (
                  <Link href="/cart" className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/50 hover:text-cream transition-colors">
                    <ShoppingCart size={16} />
                  </Link>
                )}

                {/* Notification Icon - All Logged In Roles */}
                <Link href="/notifications" className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/50 hover:text-cream transition-colors">
                  <Bell size={16} />
                </Link>

                {/* Profile Circle Avatar showing ONLY first letter */}
                <div className="relative">
                  <button onClick={() => setProfileOpen(!profileOpen)} 
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-gold-muted flex items-center justify-center text-ink text-sm font-bold shadow-lg hover:scale-105 active:scale-95 transition-all">
                    {user.fullName[0].toUpperCase()}
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-12 w-52 glass rounded-2xl overflow-hidden shadow-2xl border border-white/10 py-1">
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-white/5">
                        <div className="text-cream text-sm font-medium truncate">{user.fullName}</div>
                        <div className="text-white/40 text-xs mt-0.5 truncate">{user.email}</div>
                      </div>

                      {/* Dropdown Items based on current Mode */}
                      {isSellerMode ? (
                        <>
                          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gold/80 hover:text-gold hover:bg-white/5 transition-colors" onClick={() => setProfileOpen(false)}>
                            <ShoppingCart size={14} /> Switch to Buyer Mode
                          </Link>
                        </>
                      ) : isAdminMode ? (
                        <>
                          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gold/80 hover:text-gold hover:bg-white/5 transition-colors" onClick={() => setProfileOpen(false)}>
                            <ShoppingCart size={14} /> Switch to Buyer Mode
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-cream hover:bg-white/5 transition-colors" onClick={() => setProfileOpen(false)}>
                            <User size={14} /> My Profile
                          </Link>
                          <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-cream hover:bg-white/5 transition-colors" onClick={() => setProfileOpen(false)}>
                            <Package size={14} /> My Orders
                          </Link>
                          <Link href="/wishlist" className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-cream hover:bg-white/5 transition-colors" onClick={() => setProfileOpen(false)}>
                            <Heart size={14} /> Wishlist
                          </Link>

                          {user.isSeller ? (
                            <Link href="/seller/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gold/80 hover:text-gold hover:bg-white/5 transition-colors" onClick={() => setProfileOpen(false)}>
                              <LayoutDashboard size={14} /> Switch to Seller Mode
                            </Link>
                          ) : (
                            <Link href="/seller/onboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gold/80 hover:text-gold hover:bg-white/5 transition-colors" onClick={() => setProfileOpen(false)}>
                              <LayoutDashboard size={14} /> Start Selling
                            </Link>
                          )}

                          {user.role === 'ADMIN' && (
                            <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-400/80 hover:text-blue-400 hover:bg-white/5 transition-colors" onClick={() => setProfileOpen(false)}>
                              <LayoutDashboard size={14} /> Admin Panel
                            </Link>
                          )}
                        </>
                      )}

                      {/* Sign Out */}
                      <div className="border-t border-white/5 mt-1">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400/70 hover:text-red-400 hover:bg-white/5 transition-colors">
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
            {!user ? (
              <>
                <Link href="/books" className="block py-2.5 px-3 text-sm text-white/70 hover:text-cream rounded-xl hover:bg-white/5" onClick={() => setMobileOpen(false)}>Browse Books</Link>
                <Link href="/#how-it-works" className="block py-2.5 px-3 text-sm text-white/70 hover:text-cream rounded-xl hover:bg-white/5" onClick={() => setMobileOpen(false)}>How It Works</Link>
                <div className="flex gap-2 pt-2">
                  <Link href="/auth/login" className="flex-1 btn-ghost text-sm py-2.5 rounded-xl text-center font-medium" onClick={() => setMobileOpen(false)}>Login</Link>
                  <Link href="/auth/register" className="flex-1 btn-gold text-sm py-2.5 rounded-xl text-center font-medium" onClick={() => setMobileOpen(false)}>Sign Up</Link>
                </div>
              </>
            ) : isSellerMode ? (
              <>
                <Link href="/seller/dashboard" className="block py-2.5 px-3 text-sm text-white/70 hover:text-cream rounded-xl hover:bg-white/5" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <Link href="/seller/books/add" className="block py-2.5 px-3 text-sm text-white/70 hover:text-cream rounded-xl hover:bg-white/5" onClick={() => setMobileOpen(false)}>Add Book</Link>
                <Link href="/seller/books" className="block py-2.5 px-3 text-sm text-white/70 hover:text-cream rounded-xl hover:bg-white/5" onClick={() => setMobileOpen(false)}>Listings</Link>
                <Link href="/seller/orders" className="block py-2.5 px-3 text-sm text-white/70 hover:text-cream rounded-xl hover:bg-white/5" onClick={() => setMobileOpen(false)}>Orders</Link>
                <div className="border-t border-white/5 pt-2 mt-2">
                  <Link href="/dashboard" className="block py-2.5 px-3 text-sm text-gold/80 hover:text-gold rounded-xl hover:bg-white/5" onClick={() => setMobileOpen(false)}>Switch to Buyer Mode</Link>
                  <button onClick={handleLogout} className="w-full text-left py-2.5 px-3 text-sm text-red-400/70 hover:text-red-400 rounded-xl hover:bg-white/5">Sign Out</button>
                </div>
              </>
            ) : isAdminMode ? (
              <>
                <Link href="/admin/dashboard" className="block py-2.5 px-3 text-sm text-white/70 hover:text-cream rounded-xl hover:bg-white/5" onClick={() => setMobileOpen(false)}>Admin Dashboard</Link>
                <Link href="/admin/users" className="block py-2.5 px-3 text-sm text-white/70 hover:text-cream rounded-xl hover:bg-white/5" onClick={() => setMobileOpen(false)}>Manage Users</Link>
                <div className="border-t border-white/5 pt-2 mt-2">
                  <Link href="/dashboard" className="block py-2.5 px-3 text-sm text-gold/80 hover:text-gold rounded-xl hover:bg-white/5" onClick={() => setMobileOpen(false)}>Switch to Buyer Mode</Link>
                  <button onClick={handleLogout} className="w-full text-left py-2.5 px-3 text-sm text-red-400/70 hover:text-red-400 rounded-xl hover:bg-white/5">Sign Out</button>
                </div>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="block py-2.5 px-3 text-sm text-white/70 hover:text-cream rounded-xl hover:bg-white/5" onClick={() => setMobileOpen(false)}>Home</Link>
                <Link href="/books" className="block py-2.5 px-3 text-sm text-white/70 hover:text-cream rounded-xl hover:bg-white/5" onClick={() => setMobileOpen(false)}>Browse</Link>
                <Link href="/orders" className="block py-2.5 px-3 text-sm text-white/70 hover:text-cream rounded-xl hover:bg-white/5" onClick={() => setMobileOpen(false)}>Orders</Link>
                <div className="border-t border-white/5 pt-2 mt-2 space-y-1">
                  <Link href="/profile" className="block py-2.5 px-3 text-sm text-white/70 hover:text-cream rounded-xl hover:bg-white/5" onClick={() => setMobileOpen(false)}>My Profile</Link>
                  {user.isSeller && (
                    <Link href="/seller/dashboard" className="block py-2.5 px-3 text-sm text-gold/80 hover:text-gold rounded-xl hover:bg-white/5" onClick={() => setMobileOpen(false)}>Switch to Seller Mode</Link>
                  )}
                  {user.role === 'ADMIN' && (
                    <Link href="/admin/dashboard" className="block py-2.5 px-3 text-sm text-blue-400/80 hover:text-blue-400 rounded-xl hover:bg-white/5" onClick={() => setMobileOpen(false)}>Admin Panel</Link>
                  )}
                  <button onClick={handleLogout} className="w-full text-left py-2.5 px-3 text-sm text-red-400/70 hover:text-red-400 rounded-xl hover:bg-white/5">Sign Out</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
