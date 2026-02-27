import { NextResponse } from 'next/server'

// Mock data for development
const MOCK_GIGS = [
  {
    id: "1",
    title: "Professional Logo Design",
    description: "I will create a unique logo for your brand",
    type: "HUMAN",
    price: 50,
    deliveryDays: 3,
    revisionRounds: 2,
    status: "ACTIVE",
    totalOrders: 156,
    rating: 4.9,
    seller: { id: "1", username: "designpro", fullName: "Alex Designer", avatarUrl: null, rating: 4.9, totalSales: 234 },
    category: { id: "1", name: "Logo Design", slug: "logo-design" }
  },
  {
    id: "2",
    title: "AI-Powered Content Writing",
    description: "High-quality blog posts and articles using AI",
    type: "AI",
    price: 30,
    deliveryDays: 1,
    revisionRounds: 1,
    status: "ACTIVE",
    totalOrders: 89,
    rating: 4.8,
    seller: { id: "2", username: "contentwriter", fullName: "Sarah Writer", avatarUrl: null, rating: 4.8, totalSales: 156 },
    category: { id: "2", name: "Content Writing", slug: "content-writing" }
  }
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let gigs = [...MOCK_GIGS]

    // Filter
    if (category) {
      gigs = gigs.filter(g => g.category.slug === category)
    }
    if (type) {
      gigs = gigs.filter(g => g.type === type.toUpperCase())
    }
    if (search) {
      gigs = gigs.filter(g => g.title.toLowerCase().includes(search.toLowerCase()))
    }

    const from = (page - 1) * limit
    const to = from + limit
    const paginatedGigs = gigs.slice(from, to)

    return NextResponse.json({
      gigs: paginatedGigs,
      pagination: {
        page,
        limit,
        total: gigs.length,
        pages: Math.ceil(gigs.length / limit),
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // Mock creation
    const newGig = { id: Date.now().toString(), ...body, status: "ACTIVE" }
    return NextResponse.json({ gig: newGig })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
