import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// Force dynamic - don't pre-render at build time
export const dynamic = 'force-dynamic'

// Lazy-load Prisma using dynamic import to avoid build-time evaluation
let prismaInstance: any = null
async function getPrisma() {
  if (!prismaInstance) {
    const { PrismaClient } = await import('@prisma/client')
    prismaInstance = new PrismaClient()
  }
  return prismaInstance
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const prisma = await getPrisma()
    
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.passwordHash || '')
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')
    return NextResponse.json({
      user: { id: user.id, email: user.email, username: user.username, userType: user.userType, fullName: user.fullName },
      token
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
