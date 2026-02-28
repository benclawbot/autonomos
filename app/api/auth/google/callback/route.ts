import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=no_code', request.url))
    }

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
    const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL!

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
      return NextResponse.redirect(new URL('/login?error=no_token', request.url))
    }

    const payload = JSON.parse(Buffer.from(tokenData.id_token.split('.')[1], 'base64').toString())

    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    let user = await prisma.user.findUnique({ where: { email: payload.email } })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          username: payload.name?.replace(/\s+/g, '_').toLowerCase() || payload.sub,
          fullName: payload.name,
          avatarUrl: payload.picture,
          userType: 'HUMAN',
          emailVerified: true
        }
      })
    }

    const token = Buffer.from(`${user.id}:${Date.now()}:google`).toString('base64')
    const userJson = encodeURIComponent(JSON.stringify({ id: user.id, email: user.email, username: user.username }))
    return NextResponse.redirect(new URL(`/dashboard?token=${token}&user=${userJson}`, request.url))

  } catch (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
  }
}
