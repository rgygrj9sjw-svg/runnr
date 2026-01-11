'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, CrosshairMode, IChartApi, ISeriesApi } from 'lightweight-charts'

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
        vertLine: { color: '#6366f1', width: 1, style: 2, labelBackgroundColor: '#6366f1' },
        horzLine: { color: '#6366f1', width: 1, style: 2, labelBackgroundColor: '#6366f1' },
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
    })

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })

    const volumeSeries = chart.addHistogramSeries({
      color: '#6366f1',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
      scaleMargins: { top: 0.85, bottom: 0 },
    })

    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData) {
        setCrosshair(null)
        return
      }
      const candle = param.seriesData.get(candleSeries) as any
      const vol = param.seriesData.get(volumeSeries) as any
      if (candle) {
        setCrosshair({ ...candle, volume: vol?.value || 0 })
      }
    })

    chartRef.current = chart
    candleSeriesRef.current = candleSeries
    volumeSeriesRef.current = volumeSeries

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [])

  // Update data
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || !data?.candles) return

    const candles = data.candles
    const volumeData = candles.map((c) => ({
      time: c.time as any,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
    }))

    candleSeriesRef.current.setData(candles as any)
    volumeSeriesRef.current.setData(volumeData)
    chartRef.current?.timeScale().fitContent()
  }, [data])

  const latest = data?.candles?.[data.candles.length - 1]
  const display = crosshair || latest
  const change = display ? display.close - display.open : 0
  const changePct = display ? (change / display.open) * 100 : 0

  return (
    <div className="flex flex-col h-full">
      {/* OHLCV Header */}
      <div className="flex items-center gap-6 px-4 py-2 border-b border-runnr-border bg-runnr-darker">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">{data?.symbol || '---'}</span>
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
