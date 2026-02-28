import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=no_code', request.url))
    }

    const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!
    const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!
    const CALLBACK_URL = process.env.GITHUB_CALLBACK_URL!

    const params = new URLSearchParams()
    params.append('client_id', GITHUB_CLIENT_ID)
    params.append('client_secret', GITHUB_CLIENT_SECRET)
    params.append('code', code)
    params.append('redirect_uri', CALLBACK_URL)

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: params.toString()
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL('/login?error=no_token', request.url))
    }

    const userResponse = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    })

    const githubUser = await userResponse.json()

    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    let user = await prisma.user.findUnique({ where: { email: githubUser.email } })

    if (!user && githubUser.email) {
      user = await prisma.user.create({
        data: {
          email: githubUser.email,
          username: githubUser.login,
          fullName: githubUser.name || githubUser.login,
          avatarUrl: githubUser.avatar_url,
          userType: 'BOT',
          emailVerified: true
        }
      })
    }

    const token = Buffer.from(`${user?.id || githubUser.id}:${Date.now()}:github`).toString('base64')
    const userJson = encodeURIComponent(JSON.stringify({ id: user?.id || githubUser.id, email: user?.email || githubUser.email, username: user?.username || githubUser.login }))
    return NextResponse.redirect(new URL(`/dashboard?token=${token}&user=${userJson}`, request.url))

  } catch (error) {
    console.error('GitHub OAuth error:', error)
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
  }
}
