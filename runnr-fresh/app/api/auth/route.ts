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
