import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID?.trim()
  const CALLBACK_URL = process.env.GITHUB_CALLBACK_URL?.trim()
  
  if (!GITHUB_CLIENT_ID || !CALLBACK_URL) {
    console.error('Missing GitHub OAuth env vars:', { GITHUB_CLIENT_ID: !!GITHUB_CLIENT_ID, CALLBACK_URL: !!CALLBACK_URL })
    return NextResponse.json({ error: 'GitHub OAuth not configured' }, { status: 500 })
  }
  
  const scopes = ['read:user', 'user:email']
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(CALLBACK_URL)}&scope=${encodeURIComponent(scopes.join(' '))}`
  
  return NextResponse.redirect(authUrl)
}
