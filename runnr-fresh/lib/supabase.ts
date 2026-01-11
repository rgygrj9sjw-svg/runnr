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
