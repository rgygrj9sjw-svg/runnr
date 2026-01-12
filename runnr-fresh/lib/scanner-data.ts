export interface SummaryCard {
  title: string
  value: string
  change: string
  iconKey: 'TrendingUp' | 'BarChart3' | 'Activity'
  tone: string
  detail: string
}

export interface FilterChip {
  label: string
  value: string
}

export interface ScanResult {
  symbol: string
  name: string
  price: number
  change: number
  volume: string
  rvol: number
  float: string
  setup: string
  conviction: number
  trend: number[]
}

export interface Catalyst {
  title: string
  description: string
  detail: string
}

export interface FocusStack {
  label: string
  value: string
  change: string
}

export interface ScannerPayload {
  summaryCards: SummaryCard[]
  filterChips: FilterChip[]
  scanResults: ScanResult[]
  catalysts: Catalyst[]
  focusStacks: FocusStack[]
  source: 'default' | 'supabase'
}

export const defaultSummaryCards: SummaryCard[] = [
  {
    title: 'Momentum Score',
    value: '92.4',
    change: '+4.2 this week',
    iconKey: 'TrendingUp',
    tone: 'text-bull',
    detail: 'Breakout velocity across top 200 leaders',
  },
  {
    title: 'Liquidity Pulse',
    value: '$18.6B',
    change: '+12.8% avg volume',
    iconKey: 'BarChart3',
    tone: 'text-accent-primary',
    detail: 'Institutional flow above 30-day mean',
  },
  {
    title: 'Risk Regime',
    value: 'Controlled',
    change: 'Volatility -7.4%',
    iconKey: 'Activity',
    tone: 'text-bull',
    detail: 'Tight spreads across mega & mid caps',
  },
]

export const defaultFilterChips: FilterChip[] = [
  { label: 'US Equities', value: 'Universe' },
  { label: 'Above $1B', value: 'Market Cap' },
  { label: 'Float < 300M', value: 'Float' },
  { label: 'RSI > 60', value: 'Momentum' },
  { label: 'RVOL > 1.8', value: 'Volume' },
  { label: 'Above 20D EMA', value: 'Trend' },
  { label: 'Catalyst: Earnings', value: 'Event' },
]

export const defaultScanResults: ScanResult[] = [
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    price: 129.42,
    change: 3.8,
    volume: '92.1M',
    rvol: 2.4,
    float: '24%',
    setup: 'Momentum Breakout',
    conviction: 96,
    trend: [10, 14, 12, 16, 18, 22, 20, 24, 29, 33],
  },
  {
    symbol: 'META',
    name: 'Meta Platforms',
    price: 512.34,
    change: 2.1,
    volume: '27.4M',
    rvol: 1.9,
    float: '13%',
    setup: 'Earnings Drift',
    conviction: 91,
    trend: [12, 13, 14, 13, 15, 17, 18, 19, 21, 23],
  },
  {
    symbol: 'AVGO',
    name: 'Broadcom',
    price: 1495.8,
    change: 1.6,
    volume: '3.4M',
    rvol: 2.1,
    float: '19%',
    setup: 'Institutional Push',
    conviction: 88,
    trend: [8, 9, 11, 12, 13, 15, 16, 19, 20, 22],
  },
  {
    symbol: 'SMCI',
    name: 'Super Micro',
    price: 913.2,
    change: -1.2,
    volume: '10.8M',
    rvol: 1.7,
    float: '32%',
    setup: 'Pullback Support',
    conviction: 83,
    trend: [18, 17, 16, 15, 14, 14, 15, 16, 17, 18],
  },
  {
    symbol: 'AMD',
    name: 'Advanced Micro',
    price: 171.6,
    change: 0.9,
    volume: '45.3M',
    rvol: 2.0,
    float: '28%',
    setup: 'Range Expansion',
    conviction: 86,
    trend: [11, 12, 13, 13, 14, 16, 17, 18, 18, 19],
  },
]

export const defaultCatalysts: Catalyst[] = [
  {
    title: 'Earnings Wave',
    description: '23 names reporting in next 5 days',
    detail: 'Semi, AI infra, Cloud',
  },
  {
    title: 'Options Heat',
    description: 'Call skew accelerating',
    detail: 'Top 15 high gamma tickers',
  },
  {
    title: 'Macro Signal',
    description: 'Rates stabilizing',
    detail: '10Y yield < 4.4%',
  },
]

export const defaultFocusStacks: FocusStack[] = [
  {
    label: 'Leadership Board',
    value: 'AI Infrastructure',
    change: '+18% MoM breadth',
  },
  {
    label: 'Institutional Flow',
    value: 'Net +$2.1B',
    change: '5-day positive streak',
  },
  {
    label: 'Risk Radar',
    value: 'Low',
    change: 'VIX < 14.2',
  },
]

export const defaultScannerPayload: ScannerPayload = {
  summaryCards: defaultSummaryCards,
  filterChips: defaultFilterChips,
  scanResults: defaultScanResults,
  catalysts: defaultCatalysts,
  focusStacks: defaultFocusStacks,
  source: 'default',
}
