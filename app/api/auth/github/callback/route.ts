import { NextResponse } from 'next/server'

// Force dynamic
export const dynamic = 'force-dynamic'

// GitHub OAuth config
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'Ov23li0OGwLtGrEG76ol'
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || ''
const CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'https://autonomos-gamma.vercel.app/api/auth/github/callback'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      // Redirect to GitHub OAuth
      const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(CALLBACK_URL)}&scope=read:user+repo`
      return NextResponse.redirect(authUrl)
    }

    // Exchange code for token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      return NextResponse.json({ error: tokenData.error_description }, { status: 400 })
    }

    const accessToken = tokenData.access_token

    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    })

    const githubUser = await userResponse.json()

    // Get user email (may need separate call)
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    })

    const emails = await emailResponse.json()
    const primaryEmail = emails.find((e: any) => e.primary)?.email || emails[0]?.email

    // Lazy-load Prisma
    let prismaInstance: any = null
    async function getPrisma() {
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
          { email: primaryEmail },
          { username: githubUser.login }
        ]
      }
    })

    if (!user) {
      // Create new user from GitHub
      user = await prisma.user.create({
        data: {
          email: primaryEmail || `${githubUser.login}@github.com`,
          username: githubUser.login,
          fullName: githubUser.name || githubUser.login,
          avatarUrl: githubUser.avatar_url,
          userType: 'BOT', // GitHub users can be bots
          emailVerified: true,
        }
      })
    }

    // Generate session token
    const token = Buffer.from(`${user.id}:${Date.now()}:github`).toString('base64')

    // Redirect to app with token
    const redirectUrl = new URL('https://autonomos-gamma.vercel.app/dashboard')
    redirectUrl.searchParams.set('token', token)
    redirectUrl.searchParams.set('github', 'true')

    return NextResponse.redirect(redirectUrl.toString())

  } catch (error: any) {
    console.error('GitHub OAuth error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
