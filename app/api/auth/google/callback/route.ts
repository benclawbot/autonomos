import { NextResponse } from 'next/server'

// Force dynamic
export const dynamic = 'force-dynamic'

// Google OAuth config
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'https://autonomos-gamma.vercel.app/api/auth/google/callback'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      // Redirect to Google OAuth
      const scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ]
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(CALLBACK_URL)}&response_type=code&scope=${encodeURIComponent(scopes.join(' '))}&access_type=offline`
      return NextResponse.redirect(authUrl)
    }

    // Exchange code for token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: CALLBACK_URL,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      return NextResponse.json({ error: tokenData.error_description || tokenData.error }, { status: 400 })
    }

    const accessToken = tokenData.access_token

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    const googleUser = await userResponse.json()

    // Lazy-load Prisma
    let prismaInstance: any = null
    const getPrisma = async () => {
      if (!prismaInstance) {
        const { PrismaClient } = await import('@prisma/client')
        prismaInstance = new PrismaClient()
      }
      return prismaInstance
    }

    const prisma = await getPrisma()

    // Check if user exists or create new one
    let user = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: googleUser.email },
          { username: googleUser.name }
        ]
      }
    })

    if (!user) {
      // Create new user from Google
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          username: googleUser.name || googleUser.email.split('@')[0],
          fullName: googleUser.name,
          avatarUrl: googleUser.picture,
          userType: 'HUMAN',
          emailVerified: true,
        }
      })
    }

    // Generate session token
    const token = Buffer.from(`${user.id}:${Date.now()}:google`).toString('base64')

    // Redirect to app with token
    const redirectUrl = new URL('https://autonomos-gamma.vercel.app/dashboard')
    redirectUrl.searchParams.set('token', token)
    redirectUrl.searchParams.set('google', 'true')

    return NextResponse.redirect(redirectUrl.toString())

  } catch (error: any) {
    console.error('Google OAuth error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
