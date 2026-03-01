import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim()
  const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL?.trim()

  if (!GOOGLE_CLIENT_ID || !CALLBACK_URL) {
    console.error('Missing Google OAuth env vars:', { GOOGLE_CLIENT_ID: !!GOOGLE_CLIENT_ID, CALLBACK_URL: !!CALLBACK_URL })
    return NextResponse.redirect(new URL('/login?error=google_not_configured', process.env.NEXT_PUBLIC_APP_URL || '/login'))
  }

  const scopes = ['openid', 'email', 'profile']
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(CALLBACK_URL)}&response_type=code&scope=${encodeURIComponent(scopes.join(' '))}&access_type=offline`

  return NextResponse.redirect(authUrl)
}
