import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import {
  defaultScannerPayload,
  type Catalyst,
  type FilterChip,
  type FocusStack,
  type ScanResult,
  type SummaryCard,
} from '@/lib/scanner-data'

function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function GET() {
  if (!hasSupabaseConfig()) {
    return NextResponse.json(defaultScannerPayload)
  }

  try {
    const supabase = createServerClient()

    const [
      summaryResponse,
      filterResponse,
      signalResponse,
      catalystResponse,
      focusResponse,
    ] = await Promise.all([
      supabase.from('scanner_summary').select('*').order('rank', { ascending: true }),
      supabase.from('scanner_filters').select('*').order('rank', { ascending: true }),
      supabase.from('scanner_signals').select('*').order('rank', { ascending: true }),
      supabase.from('scanner_catalysts').select('*').order('rank', { ascending: true }),
      supabase.from('scanner_focus').select('*').order('rank', { ascending: true }),
    ])

    const summaryCards = (summaryResponse.data as SummaryCard[])?.length
      ? summaryResponse.data
      : defaultScannerPayload.summaryCards
    const filterChips = (filterResponse.data as FilterChip[])?.length
      ? filterResponse.data
      : defaultScannerPayload.filterChips
    const scanResults = (signalResponse.data as ScanResult[])?.length
      ? signalResponse.data
      : defaultScannerPayload.scanResults
    const catalysts = (catalystResponse.data as Catalyst[])?.length
      ? catalystResponse.data
      : defaultScannerPayload.catalysts
    const focusStacks = (focusResponse.data as FocusStack[])?.length
      ? focusResponse.data
      : defaultScannerPayload.focusStacks

    return NextResponse.json({
      summaryCards,
      filterChips,
      scanResults,
      catalysts,
      focusStacks,
      source: 'supabase' as const,
    })
  } catch (error) {
    console.error('Scanner API error:', error)
    return NextResponse.json(defaultScannerPayload)
  }
}
