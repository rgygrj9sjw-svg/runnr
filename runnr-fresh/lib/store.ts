import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WatchlistItem {
  symbol: string
  name: string
}

interface AppState {
  // Current view
  symbol: string
  timeframe: string
  activeTab: 'chart' | 'scanner' | 'journal'
  chatOpen: boolean
  
  // Watchlist
  watchlist: WatchlistItem[]
  
  // User
  user: { id: string; email: string } | null
  
  // Actions
  setSymbol: (symbol: string) => void
  setTimeframe: (timeframe: string) => void
  setActiveTab: (tab: 'chart' | 'scanner' | 'journal') => void
  toggleChat: () => void
  addToWatchlist: (item: WatchlistItem) => void
  removeFromWatchlist: (symbol: string) => void
  setUser: (user: { id: string; email: string } | null) => void
}

const defaultWatchlist: WatchlistItem[] = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'META', name: 'Meta' },
  { symbol: 'SPY', name: 'S&P 500 ETF' },
]

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      symbol: 'AAPL',
      timeframe: 'daily',
      activeTab: 'chart',
      chatOpen: false,
      watchlist: defaultWatchlist,
      user: null,

      // Actions
      setSymbol: (symbol) => set({ symbol }),
      setTimeframe: (timeframe) => set({ timeframe }),
      setActiveTab: (activeTab) => set({ activeTab }),
      toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),
      
      addToWatchlist: (item) => set((state) => ({
        watchlist: state.watchlist.some(w => w.symbol === item.symbol)
          ? state.watchlist
          : [...state.watchlist, item]
      })),
      
      removeFromWatchlist: (symbol) => set((state) => ({
        watchlist: state.watchlist.filter(w => w.symbol !== symbol)
      })),
      
      setUser: (user) => set({ user }),
    }),
    {
      name: 'runnr-storage',
      partialize: (state) => ({ 
        watchlist: state.watchlist,
        symbol: state.symbol,
        timeframe: state.timeframe,
      }),
    }
  )
)
