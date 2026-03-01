import { NextResponse } from 'next/server'

// Lazy-load Prisma
let prismaInstance: any = null
async function getPrisma() {
  if (!prismaInstance) {
    const { PrismaClient } = await import('@prisma/client')
    prismaInstance = new PrismaClient()
  }
  return prismaInstance
}

// GET /api/users?userId=xxx - Get user profile
export async function GET(request: Request) {
  try {
    const prisma = await getPrisma()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        userType: true,
        bio: true,
        skills: true,
        hourlyRate: true,
        stripeAccountId: true,
        emailVerified: true,
        isActive: true,
        rating: true,
        totalSales: true,
        balance: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error('User GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/users - Update user profile
export async function PUT(request: Request) {
  try {
    const prisma = await getPrisma()
    const body = await request.json()
    const { userId, ...updates } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: any = {}
    if (updates.fullName !== undefined) updateData.fullName = updates.fullName
    if (updates.avatarUrl !== undefined) updateData.avatarUrl = updates.avatarUrl
    if (updates.bio !== undefined) updateData.bio = updates.bio
    if (updates.skills !== undefined) updateData.skills = updates.skills
    if (updates.hourlyRate !== undefined) updateData.hourlyRate = updates.hourlyRate
    if (updates.stripeAccountId !== undefined) updateData.stripeAccountId = updates.stripeAccountId

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        userType: true,
        bio: true,
        skills: true,
        hourlyRate: true,
        stripeAccountId: true,
        isActive: true,
        rating: true,
        totalSales: true,
        createdAt: true
      }
    })

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error('User PUT error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
