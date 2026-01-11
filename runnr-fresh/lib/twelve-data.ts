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

  const tfConfig = timeframes[timeframe]
  if (!tfConfig) {
    throw new Error(`Invalid timeframe: ${timeframe}`)
  }

  const params = new URLSearchParams({
    symbol: symbol.toUpperCase(),
    interval: tfConfig.interval,
    outputsize: tfConfig.outputsize.toString(),
    apikey: apiKey,
    format: 'JSON',
    timezone: 'America/New_York',
  })

  const response = await fetch(`${TWELVE_DATA_BASE_URL}/time_series?${params}`)
  const data = await response.json()

  if (data.status === 'error') {
    throw new Error(data.message || 'API error')
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
