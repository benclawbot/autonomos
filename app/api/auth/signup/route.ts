import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// Lazy Supabase client
const getSupabase = () => {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  )
}

export async function POST(request: Request) {
  try {
    const { email, password, username, fullName, userType } = await request.json()
    const supabase = getSupabase()

    // Check if user exists
    const { data: existing } = await supabase
      .from('users')
      .select('email, username')
      .or(`email.eq.${email},username.eq.${username}`)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Email or username already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        username,
        fullName,
        userType: userType || 'HUMAN',
        passwordHash,
        emailVerified: false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ user: data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
