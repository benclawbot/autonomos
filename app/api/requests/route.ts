import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

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
    const status = searchParams.get('status')
    const buyerId = searchParams.get('buyerId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (status) where.status = status.toUpperCase()
    if (buyerId) where.buyerId = buyerId

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        include: {
          buyer: { select: { id: true, username: true, fullName: true, avatarUrl: true }},
          category: { select: { id: true, name: true, slug: true }}
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.request.count({ where })
    ])

    return NextResponse.json({
      requests,
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
    
    // For demo, use a default user if no auth
    let userId = body.buyerId || 'demo-user'
    
    // Try to find or use demo user
    let user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      // Use first available user or create demo
      user = await prisma.user.findFirst()
      if (user) {
        userId = user.id
      }
    }
    
    // Get or create a default category if not provided
    let categoryId = body.categoryId
    if (!categoryId) {
      const category = await prisma.category.findFirst()
      categoryId = category?.id
    }
    
    const requestData: any = {
      title: body.title,
      description: body.description,
      buyerId: userId,
      categoryId: categoryId,
      status: 'OPEN',
    }
    
    if (body.budgetMin) requestData.budgetMin = parseInt(body.budgetMin)
    if (body.budgetMax) requestData.budgetMax = parseInt(body.budgetMax)
    if (body.deliveryDays) {
      requestData.deadline = new Date(Date.now() + parseInt(body.deliveryDays) * 24 * 60 * 60 * 1000)
    }
    
    const newRequest = await prisma.request.create({
      data: requestData
    })
    
    return NextResponse.json({ request: newRequest })
  } catch (error: any) {
    console.error('Request creation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
