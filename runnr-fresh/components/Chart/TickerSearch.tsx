'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

interface SearchResult {
  symbol: string
  name: string
  exchange: string
  type: string
}

interface Props {
  value: string
  onChange: (symbol: string) => void
}

export function TickerSearch({ value, onChange }: Props) {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 1) {
      setResults([])
      return
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    
    timeoutRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/chart?action=search&q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.results || [])
        setIsOpen(true)
        setSelectedIndex(-1)
      } catch (e) {
        console.error('Search failed:', e)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [query])

  const handleSelect = (item: SearchResult) => {
    setQuery(item.symbol)
    setIsOpen(false)
    onChange(item.symbol)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Enter' && query) {
        onChange(query.toUpperCase())
        setIsOpen(false)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(i => Math.min(i + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(i => Math.max(i - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) handleSelect(results[selectedIndex])
        else if (query) {
          onChange(query.toUpperCase())
          setIsOpen(false)
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          onFocus={() => query && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search symbol..."
          className="w-full pl-9 pr-8 py-2 bg-runnr-card border border-runnr-border rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:border-accent-primary"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setIsOpen(false) }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {loading && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 border border-gray-600 border-t-accent-primary rounded-full spinner" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 py-1 bg-runnr-card border border-runnr-border rounded-lg shadow-xl max-h-80 overflow-auto">
          {results.map((item, i) => (
            <button
              key={`${item.symbol}-${i}`}
              onClick={() => handleSelect(item)}
              className={`w-full px-3 py-2 flex items-center justify-between text-left ${
                i === selectedIndex ? 'bg-accent-primary/20' : 'hover:bg-runnr-hover'
              }`}
            >
              <div>
                <div className="font-medium">{item.symbol}</div>
                <div className="text-xs text-gray-500 truncate max-w-[180px]">{item.name}</div>
              </div>
              <div className="text-xs text-gray-500">{item.exchange}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
