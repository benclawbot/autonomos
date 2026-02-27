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
            buyer: { select: { username: true, avatarUrl: true }}
          }
        },
        _count: { select: { reviews: true }}
      }
    })

    if (!gig) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 })
    }

    return NextResponse.json({ gig })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
