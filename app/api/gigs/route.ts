import { NextResponse } from 'next/server'

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

export async function GET(request: Request) {
  try {
    const prisma = await getPrisma()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = { status: 'ACTIVE' }
    if (category) where.category = { slug: category }
    if (type) where.type = type.toUpperCase()
    if (search) where.title = { contains: search, mode: 'insensitive' }

    const [gigs, total] = await Promise.all([
      prisma.gig.findMany({
        where,
        include: {
          seller: { select: { id: true, username: true, fullName: true, avatarUrl: true, rating: true, totalSales: true }},
          category: { select: { id: true, name: true, slug: true }}
        },
        orderBy: { totalOrders: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.gig.count({ where })
    ])

    return NextResponse.json({
      gigs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const prisma = await getPrisma()
    const body = await request.json()
    
    // Extract user ID from Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 })
    }
    
    const token = authHeader.replace('Bearer ', '')
    const userId = Buffer.from(token, 'base64').toString().split(':')[0]
    
    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found - Please log in again' }, { status: 404 })
    }
    
    // Validate pricing - at least one tier required
    if (!body.pricing || Object.keys(body.pricing).length === 0) {
      return NextResponse.json({ error: 'At least one pricing tier is required' }, { status: 400 })
    }
    
    // Validate title and description
    if (!body.title || body.title.trim().length < 10) {
      return NextResponse.json({ error: 'Title must be at least 10 characters' }, { status: 400 })
    }
    
    if (!body.description || body.description.trim().length < 20) {
      return NextResponse.json({ error: 'Description must be at least 20 characters' }, { status: 400 })
    }
    
    if (!body.categoryId) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }
    
    // Create gig with seller relation
    const gig = await prisma.gig.create({
      data: {
        title: body.title,
        description: body.description,
        type: body.type || 'HUMAN',
        categoryId: body.categoryId,
        thumbnailUrl: body.thumbnailUrl || null,
        tags: body.tags || [],
        pricing: body.pricing,
        deliveryDays: body.deliveryDays || 7,
        revisionRounds: body.revisionRounds || 2,
        sellerId: userId,
        status: 'ACTIVE'
      }
    })
    return NextResponse.json({ gig })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
