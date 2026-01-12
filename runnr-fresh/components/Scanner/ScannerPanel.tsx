'use client'

import { useEffect, useState } from 'react'
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Flame,
  Filter,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import {
  defaultScannerPayload,
  type ScannerPayload,
} from '@/lib/scanner-data'

const iconMap = {
  TrendingUp,
  BarChart3,
  Activity,
}

function Sparkline({ points, tone }: { points: number[]; tone: string }) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const path = points
    .map((value, index) => {
      const x = (index / (points.length - 1)) * 100
      const y = 30 - ((value - min) / range) * 30
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  return (
    <svg viewBox="0 0 100 30" className="h-8 w-24">
      <path d={path} fill="none" strokeWidth="2" className={tone} />
    </svg>
  )
}

export function ScannerPanel() {
  const [scannerData, setScannerData] = useState<ScannerPayload>(defaultScannerPayload)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const loadScanner = async () => {
      try {
        const response = await fetch('/api/scanner')
        const payload = await response.json()
        if (mounted && payload?.summaryCards) {
          setScannerData(payload)
        }
      } catch (error) {
        console.error('Scanner data fetch failed', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadScanner()
    return () => {
      mounted = false
    }
  }, [])

  const { summaryCards, filterChips, scanResults, focusStacks, catalysts, source } = scannerData

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto px-6 py-5 space-y-6">
        <header className="glass-card rounded-2xl px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Runnr Intelligence</p>
            <h1 className="text-2xl font-semibold mt-2">Atlas Scanner Command Center</h1>
            <p className="text-sm text-gray-400 mt-1">
              Institutional-grade signal routing, momentum scoring, and catalyst tracking.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 border border-runnr-border rounded-full px-3 py-1">
              {loading ? 'Syncing…' : source === 'supabase' ? 'Supabase Live' : 'Demo Data'}
            </span>
            <button className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Run Smart Scan
            </button>
            <button className="px-4 py-2 bg-runnr-hover border border-runnr-border rounded-lg text-sm text-gray-300 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Save Filters
            </button>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          {summaryCards.map((card) => {
            const Icon = iconMap[card.iconKey]
            return (
              <div key={card.title} className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">{card.title}</p>
                  <span className={`w-9 h-9 rounded-lg flex items-center justify-center bg-runnr-hover ${card.tone}`}>
                    <Icon className="w-5 h-5" />
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-semibold">{card.value}</p>
                  <p className="text-sm text-gray-400">{card.detail}</p>
                  <p className="text-xs text-gray-500 mt-2">{card.change}</p>
                </div>
              </div>
            )
          })}
        </section>

        <section className="glass-card rounded-xl p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-400">Active Filters</p>
              <h2 className="text-lg font-semibold">Momentum + Catalyst Composite</h2>
            </div>
            <button className="text-sm text-accent-primary flex items-center gap-2">
              Edit Recipe <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {filterChips.map((chip) => (
              <span
                key={chip.label}
                className="px-3 py-1 rounded-full text-xs bg-runnr-hover border border-runnr-border text-gray-300"
              >
                <span className="text-gray-500 mr-1">{chip.value}:</span>
                {chip.label}
              </span>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="glass-card rounded-xl p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Top Signals</p>
                <h3 className="text-lg font-semibold">Ranked Opportunities</h3>
              </div>
              <div className="text-sm text-gray-400">Updated 18s ago</div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-runnr-border">
                    <th className="py-2">Symbol</th>
                    <th className="py-2">Price</th>
                    <th className="py-2">Volume</th>
                    <th className="py-2">RVOL</th>
                    <th className="py-2">Setup</th>
                    <th className="py-2">Trend</th>
                    <th className="py-2 text-right">Conviction</th>
                  </tr>
                </thead>
                <tbody>
                  {scanResults.map((row) => (
                    <tr key={row.symbol} className="border-b border-runnr-border/60 hover:bg-runnr-hover">
                      <td className="py-3">
                        <div className="font-semibold">{row.symbol}</div>
                        <div className="text-xs text-gray-500">{row.name}</div>
                      </td>
                      <td className="py-3">
                        <div className="font-mono">${row.price.toFixed(2)}</div>
                        <div className={`text-xs ${row.change >= 0 ? 'text-bull' : 'text-bear'}`}>
                          {row.change >= 0 ? '+' : ''}{row.change}%
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="font-mono">{row.volume}</div>
                        <div className="text-xs text-gray-500">Float {row.float}</div>
                      </td>
                      <td className="py-3">
                        <div className="font-mono">{row.rvol.toFixed(1)}x</div>
                        <div className="text-xs text-gray-500">Vs 30D</div>
                      </td>
                      <td className="py-3">
                        <div className="font-medium">{row.setup}</div>
                        <div className="text-xs text-gray-500">Focus: AI/Core</div>
                      </td>
                      <td className="py-3">
                        <Sparkline
                          points={row.trend}
                          tone={row.change >= 0 ? 'stroke-bull' : 'stroke-bear'}
                        />
                      </td>
                      <td className="py-3 text-right">
                        <div className="font-semibold text-white">{row.conviction}%</div>
                        <div className="w-full h-1 bg-runnr-hover rounded-full mt-2">
                          <div
                            className="h-1 rounded-full bg-accent-primary"
                            style={{ width: `${row.conviction}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Market Pulse</p>
                  <h3 className="text-lg font-semibold">Focus Stack</h3>
                </div>
                <Flame className="w-5 h-5 text-accent-secondary" />
              </div>
              <div className="mt-4 space-y-3">
                {focusStacks.map((stack) => (
                  <div key={stack.label} className="p-3 rounded-lg bg-runnr-hover">
                    <div className="text-xs text-gray-400">{stack.label}</div>
                    <div className="font-semibold text-white">{stack.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{stack.change}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Catalyst Tracker</p>
                  <h3 className="text-lg font-semibold">Upcoming Triggers</h3>
                </div>
                <Target className="w-5 h-5 text-bull" />
              </div>
              <div className="mt-4 space-y-3">
                {catalysts.map((catalyst) => (
                  <div key={catalyst.title} className="border border-runnr-border rounded-lg p-3">
                    <div className="font-medium text-white">{catalyst.title}</div>
                    <div className="text-xs text-gray-400 mt-1">{catalyst.description}</div>
                    <div className="text-xs text-gray-500 mt-2">{catalyst.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Short-Term Risk</p>
                  <h3 className="text-lg font-semibold">Volatility Watch</h3>
                </div>
                <TrendingDown className="w-5 h-5 text-bear" />
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Gap Risk</span>
                  <span className="text-white">Low</span>
                </div>
                <div className="w-full h-1.5 bg-runnr-hover rounded-full mt-2">
                  <div className="h-1.5 rounded-full bg-bull" style={{ width: '28%' }} />
                </div>
                <div className="flex items-center justify-between text-sm mt-4">
                  <span className="text-gray-400">Crowding</span>
                  <span className="text-white">Moderate</span>
                </div>
                <div className="w-full h-1.5 bg-runnr-hover rounded-full mt-2">
                  <div className="h-1.5 rounded-full bg-accent-primary" style={{ width: '54%' }} />
                </div>
                <div className="flex items-center justify-between text-sm mt-4">
                  <span className="text-gray-400">Macro Sensitivity</span>
                  <span className="text-white">Low</span>
                </div>
                <div className="w-full h-1.5 bg-runnr-hover rounded-full mt-2">
                  <div className="h-1.5 rounded-full bg-bull" style={{ width: '22%' }} />
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  )
}
