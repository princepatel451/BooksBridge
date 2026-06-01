import { useState, useEffect, useCallback } from 'react'

interface BookFilters {
  search?: string; exam?: string; subject?: string; city?: string
  minPrice?: number; maxPrice?: number; condition?: string; sort?: string; page?: number
}

export function useBooks(filters: BookFilters = {}) {
  const [books, setBooks] = useState<Book[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBooks = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '') params.set(k, String(v)) })
      const res = await fetch(`/api/books?${params}`)
      const data = await res.json()
      if (data.success) { setBooks(data.data.books); setTotal(data.data.total); setPages(data.data.pages) }
      else setError(data.error)
    } catch { setError('Failed to fetch books') } finally { setLoading(false) }
  }, [JSON.stringify(filters)])

  useEffect(() => { fetchBooks() }, [fetchBooks])
  return { books, total, pages, loading, error, refetch: fetchBooks }
}

interface Book { id: string; title: string; author: string; edition?: string; examCategory: string; subject?: string; conditionScore: number; marketPrice: number; sellingPrice: number; city: string; images: { imageUrl: string }[]; seller: { id: string; fullName: string; sellerProfile?: { avgRating: number; verificationStatus: string } } }
