<DOCUMENT filename="route.ts">
import { NextRequest, NextResponse } from 'next/server'
import { getTimeSeries, getQuote, searchSymbols, timeframes } from '@/lib/twelve-data'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const symbol = searchParams.get('symbol')
  const timeframe = searchParams.get('timeframe') || 'daily'
  const action = searchParams.get('action') // 'quote' or 'search'

  try {
    // Search symbols
    if (action === 'search') {
      const query = searchParams.get('q')
      if (!query) {
        return NextResponse.json({ error: 'Search query required' }, { status: 400 })
      }
      const results = await searchSymbols(query)
      return NextResponse.json({ success: true, results })
    }

    // Get quote
    if (action === 'quote') {
      if (!symbol) {
        return NextResponse.json({ error: 'Symbol required' }, { status: 400 })
      }
      const quote = await getQuote(symbol)
      return NextResponse.json({ success: true, quote })
    }

    // Get chart data (default)
    if (!symbol) {
      return NextResponse.json({ 
        error: 'Symbol required',
        example: '/api/chart?symbol=AAPL&timeframe=daily'
      }, { status: 400 })
    }

    // Validate symbol format
    if (!/^[A-Z]{1,5}$/i.test(symbol) ) {
      return NextResponse.json({ 
        error: 'Invalid symbol format',
        format: '1-5 letters (e.g., AAPL, MSFT)'
      }, { status: 400 })
    }

    // Validate timeframe
    if (!timeframes[timeframe]) {
      return NextResponse.json({ 
        error: 'Invalid timeframe',
        valid: Object.keys(timeframes)
      }, { status: 400 })
    }

    const data = await getTimeSeries(symbol, timeframe)
    return NextResponse.json({ success: true, ...data })

  } catch (error: any) {
    console.error('Chart API error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch data'
    }, { status: 500 })
  }
}

// Return available timeframes
export async function OPTIONS() {
  return NextResponse.json({
    timeframes: Object.keys(timeframes),
    endpoints: {
      chartData: 'GET /api/chart?symbol=AAPL&timeframe=daily',
      quote: 'GET /api/chart?action=quote&symbol=AAPL',
      search: 'GET /api/chart?action=search&q=apple',
    }
  })
}
</DOCUMENT>

 <DOCUMENT filename="TimeframeSelector.tsx">
'use client'

const timeframes = [
  { id: '1m', label: '1M' },
  { id: '5m', label: '5M' },
  { id: '15m', label: '15M' },
  { id: '1h', label: '1H' },
  { id: 'daily', label: '1D' },
  { id: 'weekly', label: '1W' },
  { id: 'monthly', label: '1MO' },
  { id: '3mo', label: '3MO' },
  { id: '6mo', label: '6MO' },
  { id: '1y', label: '1Y' },
  { id: '5y', label: '5Y' },
]

interface Props {
  selected: string
  onSelect: (tf: string) => void
}

export function TimeframeSelector({ selected, onSelect }: Props) {
  return (
    <div className="flex items-center gap-1 px-2 py-1.5 bg-runnr-darker border-b border-runnr-border">
      {timeframes.map((tf) => (
        <button
          key={tf.id}
          onClick={() => onSelect(tf.id)}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
            selected === tf.id
              ? 'bg-accent-primary text-white'
              : 'text-gray-400 hover:text-white hover:bg-runnr-hover'
          }`}
        >
          {tf.label}
        </button>
      ))}
    </div>
  )
}
</DOCUMENT>

 <DOCUMENT filename="ChatPanel.tsx">
'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, ChevronUp, ChevronDown, Sparkles } from 'lucide-react'
import { useStore } from '@/lib/store'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
}

export function ChatPanel() {
  const { symbol, chatOpen, toggleChat } = useStore()
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'assistant', content: `Hey! I'm your AI trading assistant. Ask me about chart patterns, price movements, or any trading questions.` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMsg: Message = { id: Date.now(), role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Simulated response (replace with real AI API)
    setTimeout(() => {
      const responses: Record<string, string> = {
        support: `For ${symbol}, look at recent swing lows for support levels.`,
        resistance: `Check recent swing highs on ${symbol} for resistance.`,
        trend: 'Higher highs + higher lows = uptrend. Lower highs + lower lows = downtrend.',
        volume: 'Volume confirms moves. Rising price + rising volume = strong move.',
        default: `Looking at ${symbol}. What timeframe are you analyzing?`
      }
      
      const q = input.toLowerCase()
      let reply = responses.default
      if (q.includes('support')) reply = responses.support
      else if (q.includes('resistance')) reply = responses.resistance
      else if (q.includes('trend')) reply = responses.trend
      else if (q.includes('volume')) reply = responses.volume

      setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: reply }])
      setLoading(false)
    }, 800)
  }

  if (!chatOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 p-3 bg-accent-primary rounded-full shadow-lg hover:bg-accent-primary/90"
      >
        <Sparkles className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-0 right-4 w-80 h-96 bg-runnr-dark border border-runnr-border rounded-t-lg shadow-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-runnr-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-primary" />
          <span className="font-medium">AI Assistant</span>
        </div>
        <button onClick={toggleChat} className="p-1 text-gray-500 hover:text-white">
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
              msg.role === 'user' 
                ? 'bg-accent-primary' 
                : 'bg-runnr-card border border-runnr-border text-gray-300'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-runnr-card border border-runnr-border px-3 py-2 rounded-lg flex gap-1">
              <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-runnr-border flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about charts, patterns, trading..."
          className="flex-1 px-3 py-2 bg-runnr-card border border-runnr-border rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:border-accent-primary"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="p-2 bg-accent-primary hover:bg-accent-primary/90 disabled:opacity-50 rounded-lg"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
</DOCUMENT>

 <DOCUMENT filename="page.tsx">
'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { useStore } from '@/lib/store'
import { TopNav } from '@/components/Layout/TopNav'
import { Sidebar } from '@/components/Layout/Sidebar'
import { CandlestickChart } from '@/components/Chart/CandlestickChart'
import { TimeframeSelector } from '@/components/Chart/TimeframeSelector'
import { ChatPanel } from '@/components/Chat/ChatPanel'

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
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Stock Scanner</h2>
                <p className="text-gray-500">Coming soon in v2</p>
              </div>
            </div>
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
</DOCUMENT>

 <DOCUMENT filename="route.ts">
import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, email, password } = body

  const supabase = createApiClient()

  try {
    switch (action) {
      case 'signup': {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        return NextResponse.json({ success: true, user: data.user })
      }

      case 'signin': {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        return NextResponse.json({ 
          success: true, 
          user: data.user,
          session: data.session 
        })
      }

      case 'signout': {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Auth error:', error)
    return NextResponse.json({ 
      error: error.message || 'Authentication failed' 
    }, { status: 401 })
  }
}
</DOCUMENT>

 <DOCUMENT filename="CandlestickChart.tsx">
'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, CrosshairMode, LineStyle, IChartApi, ISeriesApi } from 'lightweight-charts'

interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface ChartProps {
  data: {
    candles: Candle[]
    symbol: string
    exchange?: string
  } | null
  loading?: boolean
}

function formatPrice(price: number): string {
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatVolume(vol: number): string {
  if (vol >= 1e9) return (vol / 1e9).toFixed(2) + 'B'
  if (vol >= 1e6) return (vol / 1e6).toFixed(2) + 'M'
  if (vol >= 1e3) return (vol / 1e3).toFixed(2) + 'K'
  return vol.toString()
}

export function CandlestickChart({ data, loading }: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const [crosshair, setCrosshair] = useState<Candle | null>(null)

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0a0a0f' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#1e1e2e' },
        horzLines: { color: '#1e1e2e' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#6366f1', width: 1, style: LineStyle.Dashed, labelBackgroundColor: '#6366f1' },
        horzLine: { color: '#6366f1', width: 1, style: LineStyle.Dashed, labelBackgroundColor: '#6366f1' },
      },
      rightPriceScale: {
        borderColor: '#1e1e2e',
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: {
        borderColor: '#1e1e2e',
        timeVisible: true,
        secondsVisible: false,
      },
      localization: {
        priceFormatter: formatPrice,
      },
    })

    chartRef.current = chart

    // Candle series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })
    candleSeriesRef.current = candleSeries

    // Volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#6366f1',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
      scaleMargins: { top: 0.8, bottom: 0 },
    })
    volumeSeriesRef.current = volumeSeries

    // Crosshair move handler
    chart.subscribeCrosshairMove((param) => {
      if (param.time) {
        const data = param.seriesData.get(candleSeries) as Candle
        if (data) setCrosshair(data)
      } else {
        setCrosshair(null)
      }
    })

    // Resize handler
    const resize = () => chart.applyOptions({ width: containerRef.current?.clientWidth })
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      chart.remove()
    }
  }, [])

  // Update data
  useEffect(() => {
    if (!data?.candles || !candleSeriesRef.current || !volumeSeriesRef.current) return

    const candles = data.candles
    candleSeriesRef.current.setData(candles)
    volumeSeriesRef.current.setData(candles.map(c => ({
      time: c.time,
      value: c.volume,
      color: c.close > c.open ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
    })))

    // Auto fit
    chartRef.current?.timeScale().fitContent()
  }, [data])

  const display = crosshair || data?.candles[data.candles.length - 1]
  const change = display ? display.close - display.open : 0
  const changePct = display ? (change / display.open) * 100 : 0

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-runnr-border text-sm">
        <div className="flex items-center gap-3">
          <span className="font-semibold">{data?.symbol || 'No symbol'}</span>
          {data?.exchange && (
            <span className="text-xs text-gray-500 bg-runnr-card px-1.5 py-0.5 rounded">
              {data.exchange}
            </span>
          )}
        </div>

        {display && (
          <>
            <div className="flex items-center gap-4 text-sm">
              <div><span className="text-gray-500 mr-1">O</span><span className="font-mono">{formatPrice(display.open)}</span></div>
              <div><span className="text-gray-500 mr-1">H</span><span className="font-mono text-bull">{formatPrice(display.high)}</span></div>
              <div><span className="text-gray-500 mr-1">L</span><span className="font-mono text-bear">{formatPrice(display.low)}</span></div>
              <div><span className="text-gray-500 mr-1">C</span><span className={`font-mono ${change >= 0 ? 'text-bull' : 'text-bear'}`}>{formatPrice(display.close)}</span></div>
            </div>
            <div className={`text-sm font-medium ${change >= 0 ? 'text-bull' : 'text-bear'}`}>
              {change >= 0 ? '+' : ''}{formatPrice(change)} ({changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%)
            </div>
            <div className="text-sm">
              <span className="text-gray-500 mr-1">Vol</span>
              <span className="font-mono">{formatVolume(display.volume)}</span>
            </div>
          </>
        )}

        {loading && (
          <div className="ml-auto flex items-center gap-2 text-gray-500 text-sm">
            <div className="w-3 h-3 border border-gray-600 border-t-accent-primary rounded-full spinner" />
            Loading...
          </div>
        )}
      </div>

      {/* Chart */}
      <div ref={containerRef} className="flex-1 relative">
        {!data && !loading && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            Select a symbol to view chart
          </div>
        )}
      </div>
    </div>
  )
}
</DOCUMENT>

 <DOCUMENT filename="layout.tsx">
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrains = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Runnr - Trade Faster',
  description: 'TradingView-style charting platform for traders',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="bg-runnr-dark text-white antialiased">
        {children}
      </body>
    </html>
  )
}
</DOCUMENT>

 <DOCUMENT filename="supabase-server.ts">
import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client with service role (for API routes)
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Regular client for API routes that don't need elevated permissions
export function createApiClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  return createClient(supabaseUrl, supabaseAnonKey)
}
</DOCUMENT>

 <DOCUMENT filename="next.config.js">
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
}

module.exports = nextConfig
</DOCUMENT>

 <DOCUMENT filename="tailwind.config.js">
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        runnr: {
          dark: '#0a0a0f',
          darker: '#06060a',
          card: '#12121a',
          border: '#1e1e2e',
          hover: '#1a1a2a',
        },
        bull: '#22c55e',
        bear: '#ef4444',
        accent: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
</DOCUMENT>

 <DOCUMENT filename="twelve-data.ts">
 // Twelve Data API service for market data

const TWELVE_DATA_BASE_URL = 'https://api.twelvedata.com'

// Timeframe configuration
export const timeframes: Record<string, { interval: string; outputsize: number }> = {
  '1m': { interval: '1min', outputsize: 390 },
  '5m': { interval: '5min', outputsize: 390 },
  '15m': { interval: '15min', outputsize: 390 },
  '1h': { interval: '1h', outputsize: 500 },
  'daily': { interval: '1day', outputsize: 365 },
  'weekly': { interval: '1week', outputsize: 260 },
  'monthly': { interval: '1month', outputsize: 120 },
  '3mo': { interval: '1day', outputsize: 90 },
  '6mo': { interval: '1day', outputsize: 180 },
  '1y': { interval: '1day', outputsize: 365 },
  '5y': { interval: '1week', outputsize: 260 },
}

export interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface ChartData {
  symbol: string
  timeframe: string
  interval: string
  exchange?: string
  currency?: string
  candles: Candle[]
  meta: {
    firstDate: string | null
    lastDate: string | null
    count: number
  }
}

export interface Quote {
  symbol: string
  name: string
  exchange: string
  price: number
  open: number
  high: number
  low: number
  previousClose: number
  change: number
  changePercent: number
  volume: number
}

export interface SearchResult {
  symbol: string
  name: string
  type: string
  exchange: string
  country: string
}

// Format raw API data to our candle format
function formatCandleData(values: any[]): Candle[] {
  if (!Array.isArray(values)) return []
  
  return values
    .map(candle => ({
      time: new Date(candle.datetime).getTime() / 1000,
      open: parseFloat(candle.open),
      high: parseFloat(candle.high),
      low: parseFloat(candle.low),
      close: parseFloat(candle.close),
      volume: parseInt(candle.volume) || 0,
    }))
    .filter(c => !isNaN(c.open) && !isNaN(c.close))
    .reverse()
}

export async function getTimeSeries(symbol: string, timeframe: string): Promise<ChartData> {
  const apiKey = process.env.TWELVE_DATA_API_KEY
  if (!apiKey) {
    throw new Error('TWELVE_DATA_API_KEY not configured')
  }

  const tfConfig = timeframes[timeframe] || timeframes.daily

  const params = new URLSearchParams({
    symbol: symbol.toUpperCase(),
    interval: tfConfig.interval,
    outputsize: tfConfig.outputsize.toString(),
    apikey: apiKey,
  })

  const response = await fetch(`${TWELVE_DATA_BASE_URL}/time_series?${params}`)
  const data = await response.json()

  if (data.status === 'error') {
    throw new Error(data.message || 'Data not found')
  }

  const candles = formatCandleData(data.values || [])

  return {
    symbol: symbol.toUpperCase(),
    timeframe,
    interval: tfConfig.interval,
    exchange: data.meta?.exchange,
    currency: data.meta?.currency || 'USD',
    candles,
    meta: {
      firstDate: candles[0]?.time ? new Date(candles[0].time * 1000).toISOString() : null,
      lastDate: candles[candles.length - 1]?.time ? new Date(candles[candles.length - 1].time * 1000).toISOString() : null,
      count: candles.length,
    },
  }
}

export async function getQuote(symbol: string): Promise<Quote> {
  const apiKey = process.env.TWELVE_DATA_API_KEY
  if (!apiKey) {
    throw new Error('TWELVE_DATA_API_KEY not configured')
  }

  const params = new URLSearchParams({
    symbol: symbol.toUpperCase(),
    apikey: apiKey,
  })

  const response = await fetch(`${TWELVE_DATA_BASE_URL}/quote?${params}`)
  const data = await response.json()

  if (data.status === 'error') {
    throw new Error(data.message || 'Quote not found')
  }

  return {
    symbol: data.symbol,
    name: data.name,
    exchange: data.exchange,
    price: parseFloat(data.close),
    open: parseFloat(data.open),
    high: parseFloat(data.high),
    low: parseFloat(data.low),
    previousClose: parseFloat(data.previous_close),
    change: parseFloat(data.change),
    changePercent: parseFloat(data.percent_change),
    volume: parseInt(data.volume),
  }
}

export async function searchSymbols(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.TWELVE_DATA_API_KEY
  if (!apiKey) {
    throw new Error('TWELVE_DATA_API_KEY not configured')
  }

  const params = new URLSearchParams({
    symbol: query,
    outputsize: '10',
    apikey: apiKey,
  })

  const response = await fetch(`${TWELVE_DATA_BASE_URL}/symbol_search?${params}`)
  const data = await response.json()

  return (data.data || []).map((item: any) => ({
    symbol: item.symbol,
    name: item.instrument_name,
    type: item.instrument_type,
    exchange: item.exchange,
    country: item.country,
  }))
}
</DOCUMENT>

 <DOCUMENT filename="TickerSearch.tsx">
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
        if (selectedIndex >= 0) {
          handleSelect(results[selectedIndex])
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
</DOCUMENT>

 <DOCUMENT filename="globals.css">
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground: #ffffff;
  --background: #0a0a0f;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: 'Inter', system-ui, sans-serif;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #0a0a0f;
}

::-webkit-scrollbar-thumb {
  background: #1e1e2e;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #2a2a3e;
}

/* Selection */
::selection {
  background: rgba(99, 102, 241, 0.3);
}

/* Chart container */
.chart-container {
  width: 100%;
  height: 100%;
}

/* Disable transitions on chart for performance */
.tv-lightweight-charts * {
  transition: none !important;
}

/* Loading spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 0.8s linear infinite;
}

/* Price flash animations */
@keyframes priceUp {
  0% { background-color: rgba(34, 197, 94, 0.3); }
  100% { background-color: transparent; }
}

@keyframes priceDown {
  0% { background-color: rgba(239, 68, 68, 0.3); }
  100% { background-color: transparent; }
}
</DOCUMENT>

 <DOCUMENT filename="postcss.config.js">
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
</DOCUMENT>

 <DOCUMENT filename="TopNav.tsx">
'use client'

import { BarChart3, ScanLine, BookOpen, Settings, Zap } from 'lucide-react'
import { TickerSearch } from '../Chart/TickerSearch'
import { useStore } from '@/lib/store'

const tabs = [
  { id: 'chart' as const, label: 'Chart', icon: BarChart3 },
  { id: 'scanner' as const, label: 'Scanner', icon: ScanLine },
  { id: 'journal' as const, label: 'Journal', icon: BookOpen },
]

export function TopNav() {
  const { symbol, activeTab, setSymbol, setActiveTab } = useStore()

  return (
    <header className="h-14 bg-runnr-darker border-b border-runnr-border flex items-center justify-between px-4">
      {/* Logo & Tabs */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg">Runnr</span>
        </div>

        <nav className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-accent-primary/10 text-accent-primary'
                    : 'text-gray-400 hover:text-white hover:bg-runnr-hover'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Search & Settings */}
      <div className="flex items-center gap-4">
        <div className="w-64">
          <TickerSearch value={symbol} onChange={setSymbol} />
        </div>
        <button className="p-2 text-gray-400 hover:text-white hover:bg-runnr-hover rounded-lg">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
</DOCUMENT>

 <DOCUMENT filename="tsconfig.json">
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
</DOCUMENT>

 <DOCUMENT filename="README.md">
# 🏃 Runnr

TradingView-style charting platform for traders. Built with Next.js, Supabase, and Vercel.

## 🚀 Quick Deploy

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create account
2. Click **New Project**
3. Name it `runnr` and set a password
4. Wait for project to spin up (~2 min)
5. Go to **Settings → API** and copy:
   - `Project URL` → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → This is your `SUPABASE_SERVICE_ROLE_KEY`

### Step 2: Set Up Database Tables

Go to **SQL Editor** in Supabase and run:

```sql
-- Watchlists table
CREATE TABLE watchlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trades/Journal table
CREATE TABLE trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  side TEXT CHECK (side IN ('buy', 'sell')),
  quantity DECIMAL,
  price DECIMAL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Policies (users can only see their own data)
CREATE POLICY "Users can view own watchlists" ON watchlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlists" ON watchlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlists" ON watchlists
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own trades" ON trades
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades" ON trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Step 3: Push to GitHub

```bash
# Unzip the project if needed
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/runnr.git
git push -u origin main
```

### Step 4: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `TWELVE_DATA_API_KEY` (get from [twelvedata.com](https://twelvedata.com))
4. Deploy!

### Local Development

```bash
git clone https://github.com/YOUR_USERNAME/runnr.git
cd runnr

# Install dependencies
npm install

# Copy environment file and add your keys
cp .env.example .env.local
# Edit .env.local with your API keys

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
runnr/
├── app/
│   ├── api/
│   │   ├── chart/route.ts    # Market data API
│   │   └── auth/route.ts     # Auth endpoints
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # Main app
├── components/
│   ├── Chart/
│   │   ├── CandlestickChart.tsx
│   │   ├── TimeframeSelector.tsx
│   │   └── TickerSearch.tsx
│   ├── Chat/
│   │   └── ChatPanel.tsx
│   └── Layout/
│       ├── Sidebar.tsx
│       └── TopNav.tsx
├── lib/
│   ├── supabase.ts           # Client-side Supabase
│   ├── supabase-server.ts    # Server-side Supabase
│   ├── twelve-data.ts        # Market data service
│   └── store.ts              # Zustand state
├── public/
│   └── favicon.svg
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 🔑 API Keys

| Service | Free Tier | Get Key |
|---------|-----------|---------|
| Twelve Data | 800 calls/day | [twelvedata.com](https://twelvedata.com) |
| Supabase | 500MB DB, 50k auth | [supabase.com](https://supabase.com) |
| Vercel | Unlimited deploys | [vercel.com](https://vercel.com) |

---

## ✨ Features

- 📊 TradingView-style candlestick charts
- ⏱️ 11 timeframes (1m to 5y)
- 🔍 Symbol search with autocomplete
- ⭐ Watchlist with live quotes
- 💬 AI trading assistant
- 🔐 Supabase auth (ready)
- 📱 Responsive design

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Hosting**: Vercel
- **Charts**: Lightweight Charts
- **Styling**: Tailwind CSS
- **State**: Zustand

---

## 📝 License

MIT - Use it however you want!

---

**Runnr** - Trade faster. 🏃💨
</DOCUMENT>

 <DOCUMENT filename="store.ts">
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
</DOCUMENT>

 <DOCUMENT filename="package.json">
{
  "name": "runnr",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.1.0",
    "lightweight-charts": "^4.1.0",
    "lucide-react": "^0.294.0",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@types/node": "^20.10.4",
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.3.3"
  }
}
</DOCUMENT>

 <DOCUMENT filename="supabase.ts">
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface User {
  id: string
  email: string
  created_at: string
}

export interface Watchlist {
  id: string
  user_id: string
  symbol: string
  name: string
  created_at: string
}

export interface Trade {
  id: string
  user_id: string
  symbol: string
  side: 'buy' | 'sell'
  quantity: number
  price: number
  notes?: string
  created_at: string
}
</DOCUMENT>

 <DOCUMENT filename="supabase-setup.sql">
-- =============================================
-- RUNNR DATABASE SETUP FOR SUPABASE
-- =============================================
-- Run this in Supabase SQL Editor (supabase.com -> SQL Editor)

-- Watchlists table
CREATE TABLE IF NOT EXISTS watchlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trades/Journal table
CREATE TABLE IF NOT EXISTS trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  side TEXT CHECK (side IN ('buy', 'sell')),
  quantity DECIMAL,
  price DECIMAL,
  notes TEXT,
  tags TEXT[],
  screenshot_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scanner presets table
CREATE TABLE IF NOT EXISTS scanner_presets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE scanner_presets ENABLE ROW LEVEL SECURITY;

-- Watchlist policies
CREATE POLICY "Users can view own watchlists" ON watchlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlists" ON watchlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlists" ON watchlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlists" ON watchlists
  FOR DELETE USING (auth.uid() = user_id);

-- Trades policies
CREATE POLICY "Users can view own trades" ON trades
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades" ON trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades" ON trades
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades" ON trades
  FOR DELETE USING (auth.uid() = user_id);

-- Scanner presets policies
CREATE POLICY "Users can view own presets" ON scanner_presets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own presets" ON scanner_presets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own presets" ON scanner_presets
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_watchlists_user ON watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_user ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_created ON trades(created_at DESC);
</DOCUMENT>

 <DOCUMENT filename="Sidebar.tsx">
'use client'

import { useEffect, useState } from 'react'
import { Star, TrendingUp, TrendingDown, X } from 'lucide-react'
import { useStore } from '@/lib/store'

interface Quote {
  price: number
  changePercent: number
}

export function Sidebar() {
  const { symbol, watchlist, setSymbol, removeFromWatchlist } = useStore()
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
</DOCUMENT>
