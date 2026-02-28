import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!.trim()
  const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL!.trim()
  
  const scopes = ['openid', 'email', 'profile']
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(CALLBACK_URL)}&response_type=code&scope=${encodeURIComponent(scopes.join(' '))}&access_type=offline`
  
  return NextResponse.redirect(authUrl)
}
