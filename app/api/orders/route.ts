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

export async function POST(request: Request) {
  try {
    const prisma = await getPrisma()
    const body = await request.json()
    const { gigId, packageType, amount, currency = 'usd', buyerId } = body

    // Validate required fields
    if (!gigId || !packageType || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: gigId, packageType, amount' },
        { status: 400 }
      )
    }

    // Get gig details to find seller
    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
      include: { seller: { select: { id: true, username: true } } }
    })

    if (!gig) {
      return NextResponse.json(
        { error: 'Gig not found' },
        { status: 404 }
      )
    }

    // Calculate fees (15% platform fee)
    const platformFee = Math.round(amount * 0.15)
    const sellerPayout = amount - platformFee

    // Use provided buyerId or create a demo buyer for testing
    let orderBuyerId = buyerId
    if (!orderBuyerId) {
      // Find or create a demo buyer for testing
      let demoBuyer = await prisma.user.findFirst({
        where: { email: 'demo@buyer.test' }
      })
      if (!demoBuyer) {
        demoBuyer = await prisma.user.create({
          data: {
            email: 'demo@buyer.test',
            username: 'demo_buyer',
            fullName: 'Demo Buyer',
            userType: 'HUMAN'
          }
        })
      }
      orderBuyerId = demoBuyer.id
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`

    // Create order with ESCROW status
    const order = await prisma.order.create({
      data: {
        gigId,
        buyerId: orderBuyerId,
        sellerId: gig.sellerId,
        tierName: packageType,
        originalPrice: amount,
        platformFee,
        sellerPayout,
        currency: currency.toUpperCase(),
        status: 'PENDING',
        paymentStatus: 'PENDING',
        orderNumber,
      }
    })

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        orderNumber,
        gig: { id: gig.id, title: gig.title },
        seller: { id: gig.sellerId, username: gig.seller.username }
      }
    })
  } catch (error: any) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const prisma = await getPrisma()
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const buyerId = searchParams.get('buyerId')
    const sellerId = searchParams.get('sellerId')

    const where: any = {}
    if (orderId) where.id = orderId
    if (buyerId) where.buyerId = buyerId
    if (sellerId) where.sellerId = sellerId

    const orders = await prisma.order.findMany({
      where,
      include: {
        gig: { select: { id: true, title: true, thumbnailUrl: true } },
        buyer: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
        seller: { select: { id: true, username: true, fullName: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ orders })
  } catch (error: any) {
    console.error('Orders GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// Update order status
export async function PATCH(request: Request) {
  try {
    const prisma = await getPrisma()
    const body = await request.json()
    const { orderId, status, paymentStatus, paymentId } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus
    if (paymentId) updateData.paymentId = paymentId

    // If payment completed, move to escrow
    if (paymentStatus === 'paid') {
      updateData.status = 'in_escrow'
      updateData.escrowStartedAt = new Date()
    }

    // If delivery confirmed, release escrow to seller
    if (status === 'completed' && paymentStatus === 'released') {
      updateData.escrowReleasedAt = new Date()
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        gig: { select: { id: true, title: true } },
        seller: { select: { id: true, username: true } }
      }
    })

    return NextResponse.json({ success: true, order })
  } catch (error: any) {
    console.error('Order PATCH error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update order' },
      { status: 500 }
    )
  }
}
