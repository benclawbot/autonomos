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

// GET /api/reviews?userId=xxx - Get reviews for a user
// GET /api/reviews?orderId=xxx - Get review for an order
export async function GET(request: Request) {
  try {
    const prisma = await getPrisma()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const orderId = searchParams.get('orderId')

    if (userId) {
      // Get reviews for a user (reviews they received)
      const reviews = await prisma.review.findMany({
        where: { revieweeId: userId },
        include: {
          order: {
            include: {
              gig: { select: { id: true, title: true } }
            }
          },
          reviewer: { select: { id: true, username: true, fullName: true, avatarUrl: true } }
        },
        orderBy: { createdAt: 'desc' }
      })

      // Calculate average rating
      const avgRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / (reviews.length || 1)

      return NextResponse.json({
        reviews,
        averageRating: avgRating.toFixed(2),
        totalReviews: reviews.length
      })
    }

    if (orderId) {
      // Get review for a specific order
      const review = await prisma.review.findUnique({
        where: { orderId },
        include: {
          reviewer: { select: { id: true, username: true, fullName: true, avatarUrl: true } }
        }
      })

      return NextResponse.json({ review })
    }

    return NextResponse.json(
      { error: 'userId or orderId required' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Reviews GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Leave a review
export async function POST(request: Request) {
  try {
    const prisma = await getPrisma()
    const body = await request.json()
    const { orderId, reviewerId, rating, comment } = body

    if (!orderId || !reviewerId || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, reviewerId, rating' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Get order details to find the reviewee
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, buyerId: true, sellerId: true, status: true }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Verify order is completed
    if (order.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Can only review completed orders' },
        { status: 400 }
      )
    }

    // Determine who is being reviewed (the other party)
    const revieweeId = order.buyerId === reviewerId ? order.sellerId : order.buyerId

    // Check if review already exists
    const existing = await prisma.review.findFirst({
      where: { orderId, reviewerId }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'You have already reviewed this order' },
        { status: 400 }
      )
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        orderId,
        reviewerId,
        revieweeId,
        rating,
        comment
      }
    })

    // Update seller's average rating
    const allReviews = await prisma.review.findMany({
      where: { revieweeId },
      select: { rating: true }
    })

    if (allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length
      await prisma.user.update({
        where: { id: revieweeId },
        data: { rating: avgRating }
      })
    }

    return NextResponse.json({ review })
  } catch (error: any) {
    console.error('Reviews POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
