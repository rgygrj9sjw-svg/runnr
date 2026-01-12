'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { useStore } from '@/lib/store'
import { TopNav } from '@/components/Layout/TopNav'
import { Sidebar } from '@/components/Layout/Sidebar'
import { CandlestickChart } from '@/components/Chart/CandlestickChart'
import { TimeframeSelector } from '@/components/Chart/TimeframeSelector'
import { ChatPanel } from '@/components/Chat/ChatPanel'
import { ScannerPanel } from '@/components/Scanner/ScannerPanel'

export default function Home() {
  const { symbol, timeframe, activeTab, setTimeframe } = useStore()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch chart data
  useEffect(() => {
    if (!symbol) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/chart?symbol=${symbol}&timeframe=${timeframe}`)
        const json = await res.json()
        if (json.error) throw new Error(json.error)
        setData(json)
      } catch (e: any) {
        setError(e.message)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [symbol, timeframe])

  return (
    <div className="h-screen flex flex-col bg-runnr-dark overflow-hidden">
      <TopNav />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'chart' && (
            <>
              <TimeframeSelector selected={timeframe} onSelect={setTimeframe} />
              
              <div className="flex-1 relative">
                {error ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="flex items-center gap-2 text-bear">
                      <AlertCircle className="w-5 h-5" />
                      <span>Failed to load chart</span>
                    </div>
                    <p className="text-sm text-gray-500">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="flex items-center gap-2 px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 rounded-lg"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Retry
                    </button>
                  </div>
                ) : (
                  <CandlestickChart data={data} loading={loading} />
                )}
              </div>
            </>
          )}

          {activeTab === 'scanner' && (
            <ScannerPanel />
          )}

          {activeTab === 'journal' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Trading Journal</h2>
                <p className="text-gray-500">Coming soon in v2</p>
              </div>
            </div>
          )}

          <ChatPanel />
        </div>
      </div>

      {/* Status Bar */}
      <footer className="h-6 bg-runnr-darker border-t border-runnr-border flex items-center justify-between px-4 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>Runnr v1.0</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-bull rounded-full animate-pulse" />
            Connected
          </span>
        </div>
        <span>⌘K to search</span>
      </footer>
    </div>
  )
}
