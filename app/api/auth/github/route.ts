import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!.trim()
  const CALLBACK_URL = process.env.GITHUB_CALLBACK_URL!.trim()
  
  const scopes = ['read:user', 'user:email']
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(CALLBACK_URL)}&scope=${encodeURIComponent(scopes.join(' '))}`
  
  return NextResponse.redirect(authUrl)
}
