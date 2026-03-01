import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(new URL(`/login?error=google_${error}`, request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=no_code', request.url))
    }

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim()
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET?.trim()
    const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL?.trim()

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !CALLBACK_URL) {
      console.error('Missing Google OAuth env vars in callback')
      return NextResponse.redirect(new URL('/login?error=config_error', request.url))
    }

    const params = new URLSearchParams()
    params.append('client_id', GOOGLE_CLIENT_ID)
    params.append('client_secret', GOOGLE_CLIENT_SECRET)
    params.append('code', code)
    params.append('grant_type', 'authorization_code')
    params.append('redirect_uri', CALLBACK_URL)

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.id_token) {
      console.error('No id_token from Google:', tokenData)
      return NextResponse.redirect(new URL('/login?error=no_token', request.url))
    }

    const payload = JSON.parse(Buffer.from(tokenData.id_token.split('.')[1], 'base64').toString())

    if (!payload.email) {
      return NextResponse.redirect(new URL('/login?error=no_email', request.url))
    }

    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      let user = await prisma.user.findUnique({ where: { email: payload.email } })

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: payload.email,
            username: payload.name?.replace(/\s+/g, '_').toLowerCase() || `user_${payload.sub}`,
            fullName: payload.name,
            avatarUrl: payload.picture,
            userType: 'HUMAN',
            emailVerified: true
          }
        })
      }

      const token = Buffer.from(`${user.id}:${Date.now()}:google`).toString('base64')
      const userJson = encodeURIComponent(JSON.stringify({
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl
      }))
      return NextResponse.redirect(new URL(`/dashboard?token=${token}&user=${userJson}`, request.url))
    } finally {
      await prisma.$disconnect()
    }

  } catch (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
  }
}
