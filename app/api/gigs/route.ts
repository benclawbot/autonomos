import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
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
    const body = await request.json()
    const gig = await prisma.gig.create({
      data: { ...body, status: 'ACTIVE' }
    })
    return NextResponse.json({ gig })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
