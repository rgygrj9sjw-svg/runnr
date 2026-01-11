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
    if (!/^[A-Z]{1,5}$/i.test(symbol)) {
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
