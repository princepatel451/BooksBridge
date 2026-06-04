'use client'

import { Toaster, toast } from 'react-hot-toast'
import { X, CheckCircle, AlertOctagon, Info } from 'lucide-react'

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
      }}
    >
      {(t) => {
        // Determine style properties based on the type of toast (success, error, standard)
        let bgClass = 'bg-ink-soft/90 border-white/10'
        let iconColor = 'text-white'
        let textClass = 'text-white/90'
        
        if (t.type === 'success') {
          bgClass = 'bg-emerald-950/90 border-emerald-500/30'
          iconColor = 'text-emerald-400'
          textClass = 'text-emerald-50'
        } else if (t.type === 'error') {
          bgClass = 'bg-red-950/90 border-red-500/30'
          iconColor = 'text-red-400'
          textClass = 'text-red-50'
        }

        return (
          <div
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-300 w-[90vw] md:w-[50vw] max-w-xl ${bgClass}`}
            style={{
              opacity: t.visible ? 1 : 0,
              transform: t.visible ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)',
            }}
          >
            {/* Custom Icon based on toast type */}
            <div className={`flex-shrink-0 ${iconColor}`}>
              {t.type === 'success' && <CheckCircle size={16} />}
              {t.type === 'error' && <AlertOctagon size={16} />}
              {t.type !== 'success' && t.type !== 'error' && <Info size={16} />}
            </div>

            {/* Message text */}
            <div className={`flex-1 text-xs font-semibold truncate ${textClass}`}>
              {typeof t.message === 'function' ? t.message(t) : t.message}
            </div>

            {/* Close button */}
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-shrink-0 text-white/40 hover:text-white/80 p-0.5 rounded-full hover:bg-white/5 transition-all cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )
      }}
    </Toaster>
  )
}
