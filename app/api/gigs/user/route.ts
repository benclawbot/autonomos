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
    
    // Get all gigs for this seller
    const gigs = await prisma.gig.findMany({
      where: { sellerId: userId },
      include: {
        category: { select: { id: true, name: true, slug: true }}
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ gigs })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
