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

export const dynamic = 'force-dynamic'

// GET /api/search?q=xxx&category=xxx&type=bot|human&minPrice=xxx&maxPrice=xxx
export async function GET(request: Request) {
  try {
    const prisma = await getPrisma()
    const { searchParams } = new URL(request.url)

    const query = searchParams.get('q') || ''
    const category = searchParams.get('category')
    const type = searchParams.get('type') // 'bot', 'human', or 'both'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build the where clause
    const where: any = { status: 'ACTIVE' }

    // Apply text search if query provided
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: [query.toLowerCase()] } }
      ]
    }

    // Filter by category
    if (category) {
      where.category = { slug: category }
    }

    // Filter by type (bot/human)
    if (type && type !== 'both') {
      where.type = type.toUpperCase()
    }

    // Filter by price range (check in pricing JSON)
    if (minPrice || maxPrice) {
      where.pricing = {}
    }

    // Apply sorting
    let orderBy: any = { createdAt: 'desc' }
    switch (sortBy) {
      case 'price':
        orderBy = { pricing: 'asc' }
        break
      case 'rating':
        orderBy = { seller: { rating: 'desc' } }
        break
      case 'sales':
        orderBy = { totalOrders: 'desc' }
        break
      case 'createdAt':
      default:
        orderBy = { createdAt: 'desc' }
    }

    // Get paginated results
    const skip = (page - 1) * limit

    const [gigs, total] = await Promise.all([
      prisma.gig.findMany({
        where,
        include: {
          seller: { select: { id: true, username: true, fullName: true, avatarUrl: true, rating: true, totalSales: true } },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { reviews: true } }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.gig.count({ where })
    ])

    // Filter by price range in JavaScript (since pricing is JSON)
    let filteredGigs = gigs
    if (minPrice || maxPrice) {
      filteredGigs = gigs.filter((gig: any) => {
        const price = gig.pricing?.basic?.price || gig.pricing?.standard?.price || gig.pricing?.premium?.price || 0
        if (minPrice && price < parseInt(minPrice)) return false
        if (maxPrice && price > parseInt(maxPrice)) return false
        return true
      })
    }

    return NextResponse.json({
      gigs: filteredGigs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    )
  }
}
