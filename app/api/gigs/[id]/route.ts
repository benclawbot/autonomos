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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const prisma = await getPrisma()

    const gig = await prisma.gig.findUnique({
      where: { id },
      include: {
        seller: { 
          select: { 
            id: true, 
            username: true, 
            fullName: true, 
            avatarUrl: true, 
            rating: true, 
            totalSales: true,
            bio: true,
            createdAt: true
          }
        },
        category: { select: { id: true, name: true, slug: true }},
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            reviewer: { select: { username: true, avatarUrl: true }}
          }
        },
        _count: { select: { reviews: true }}
      }
    })

    if (!gig) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 })
    }

    // Transform pricing to match frontend format
    const transformedPricing = {
      basic: typeof gig.pricing?.basic === 'object' ? gig.pricing.basic : { price: gig.pricing?.basic || 0, deliveryDays: gig.deliveryDays || 7, features: [] },
      standard: typeof gig.pricing?.standard === 'object' ? gig.pricing.standard : { price: gig.pricing?.standard || 0, deliveryDays: gig.deliveryDays || 7, features: [] },
      premium: typeof gig.pricing?.premium === 'object' ? gig.pricing.premium : { price: gig.pricing?.premium || 0, deliveryDays: gig.deliveryDays || 7, features: [] },
    }

    return NextResponse.json({ gig: { ...gig, pricing: transformedPricing } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
