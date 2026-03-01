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

// GET - Fetch a single gig
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

// PATCH - Update a gig
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const prisma = await getPrisma()
    const body = await request.json()
    
    // Extract user ID from Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const token = authHeader.replace('Bearer ', '')
    const userId = Buffer.from(token, 'base64').toString().split(':')[0]
    
    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Check if gig exists and belongs to user
    const existingGig = await prisma.gig.findUnique({ where: { id } })
    if (!existingGig) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 })
    }
    
    if (existingGig.sellerId !== userId) {
      return NextResponse.json({ error: 'Not authorized to update this gig' }, { status: 403 })
    }
    
    // Validate pricing if provided
    if (body.pricing) {
      const pricingKeys = Object.keys(body.pricing)
      if (pricingKeys.length === 0) {
        return NextResponse.json({ error: 'At least one pricing tier is required' }, { status: 400 })
      }
    }
    
    // Update gig
    const gig = await prisma.gig.update({
      where: { id },
      data: {
        ...body,
        // Ensure tags is an array if provided
        ...(body.tags && { tags: Array.isArray(body.tags) ? body.tags : body.tags.split(',').map((t: string) => t.trim()).filter(Boolean) })
      }
    })
    
    return NextResponse.json({ gig })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete a gig
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const prisma = await getPrisma()
    
    // Extract user ID from Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const token = authHeader.replace('Bearer ', '')
    const userId = Buffer.from(token, 'base64').toString().split(':')[0]
    
    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Check if gig exists and belongs to user
    const existingGig = await prisma.gig.findUnique({ where: { id } })
    if (!existingGig) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 })
    }
    
    if (existingGig.sellerId !== userId) {
      return NextResponse.json({ error: 'Not authorized to delete this gig' }, { status: 403 })
    }
    
    // Delete gig
    await prisma.gig.delete({ where: { id } })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
