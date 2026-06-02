import Link from 'next/link'
import { BookOpen, Globe, Share2, MessageCircle, Mail, Phone, MapPin } from 'lucide-react'

const socialIcons = [Globe, Share2, MessageCircle, Mail]

export function Footer() {
  return (
    <footer className="border-t border-white/5 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-muted flex items-center justify-center">
                <BookOpen size={16} className="text-ink" />
              </div>
              <span className="font-display text-xl font-bold">Book<span className="text-gold">Bridge</span></span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-5">
              India&apos;s trusted marketplace for competitive exam books. Save more, learn more.
            </p>
            <div className="flex items-center gap-3">
              {socialIcons.map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 glass rounded-lg flex items-center justify-center text-white/40 hover:text-gold transition-colors">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-cream font-semibold text-sm mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {[
                ['Browse Books', '/books'],
                ['Sell Your Books', '/seller/onboard'],
                ['How It Works', '/#how-it-works'],
                ['Exam Categories', '/#categories'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-white/40 hover:text-gold text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-cream font-semibold text-sm mb-4">Support</h4>
            <ul className="space-y-2.5">
              {[
                ['FAQ', '/faq'],
                ['Privacy Policy', '/privacy'],
                ['Terms of Service', '/terms'],
                ['Contact Us', '/contact'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-white/40 hover:text-gold text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-cream font-semibold text-sm mb-4">Contact</h4>
            <ul className="space-y-3">
              {[
                { Icon: Mail, text: 'support@bookbridge.in' },
                { Icon: Phone, text: '+91 6202618910' },
                { Icon: MapPin, text: 'India' },
              ].map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5 text-white/40 text-sm">
                  <Icon size={13} className="text-gold/60 flex-shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="divider-gold my-10" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/25">
          <span>© 2026 BookBridge. All rights reserved.</span>
          <span>Made with Love for Indian students</span>
        </div>
      </div>
    </footer>
  )
}
