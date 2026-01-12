'use client'

import { useEffect, useState } from 'react'
import { Star, TrendingUp, TrendingDown, X } from 'lucide-react'
import { useStore } from '@/lib/store'

interface Quote {
  price: number
  changePercent: number
}

export function Sidebar() {
  const { symbol, watchlist, activeTab, setSymbol, removeFromWatchlist } = useStore()
  const [quotes, setQuotes] = useState<Record<string, Quote>>({})

  // Fetch quotes (staggered to avoid rate limits)
  useEffect(() => {
    let index = 0
    const fetchNext = async () => {
      if (index >= watchlist.length) return
      
      const item = watchlist[index]
      if (!quotes[item.symbol]) {
        try {
          const res = await fetch(`/api/chart?action=quote&symbol=${item.symbol}`)
          const data = await res.json()
          if (data.quote) {
            setQuotes(prev => ({ ...prev, [item.symbol]: data.quote }))
          }
        } catch (e) {
          console.error(`Quote fetch failed for ${item.symbol}`)
        }
      }
      index++
      setTimeout(fetchNext, 500) // 500ms between requests
    }
    
    fetchNext()
  }, [watchlist])

  return (
    <div className="w-60 bg-runnr-darker border-r border-runnr-border flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-runnr-border flex items-center gap-2">
        <Star className="w-4 h-4 text-yellow-500" />
        <span className="font-medium text-sm">Watchlist</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'scanner' && (
          <div className="p-3 space-y-3 text-xs text-gray-400">
            <div className="rounded-lg border border-runnr-border bg-runnr-card p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Scanner Preset</p>
              <p className="text-sm font-semibold text-white mt-1">Atlas Liquidity Prime</p>
              <p className="text-xs text-gray-500 mt-1">145 symbols · realtime</p>
            </div>
            <div className="rounded-lg border border-runnr-border bg-runnr-card p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Risk Filters</p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Float</span>
                  <span className="text-white">&lt; 350M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Spread</span>
                  <span className="text-white">&lt; 0.4%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>News</span>
                  <span className="text-white">Positive</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {watchlist.map((item) => {
          const quote = quotes[item.symbol]
          const isSelected = symbol === item.symbol

          return (
            <button
              key={item.symbol}
              onClick={() => setSymbol(item.symbol)}
              className={`w-full px-3 py-2.5 flex items-center justify-between border-b border-runnr-border/50 group relative ${
                isSelected
                  ? 'bg-accent-primary/10 border-l-2 border-l-accent-primary'
                  : 'hover:bg-runnr-hover border-l-2 border-l-transparent'
              }`}
            >
              <div className="text-left">
                <div className={`font-medium text-sm ${isSelected ? 'text-accent-primary' : ''}`}>
                  {item.symbol}
                </div>
                <div className="text-xs text-gray-500 truncate max-w-[90px]">{item.name}</div>
              </div>

              {quote ? (
                <div className="text-right">
                  <div className="font-mono text-sm">${quote.price.toFixed(2)}</div>
                  <div className={`flex items-center gap-0.5 text-xs ${quote.changePercent >= 0 ? 'text-bull' : 'text-bear'}`}>
                    {quote.changePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
                  </div>
                </div>
              ) : (
                <div className="w-3 h-3 border border-gray-600 border-t-accent-primary rounded-full spinner" />
              )}

              <button
                onClick={(e) => { e.stopPropagation(); removeFromWatchlist(item.symbol) }}
                className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-bear"
              >
                <X className="w-3 h-3" />
              </button>
            </button>
          )
        })}
      </div>

      <div className="p-2 border-t border-runnr-border text-xs text-gray-500 text-center">
        {watchlist.length} symbols
      </div>
    </div>
  )
}
