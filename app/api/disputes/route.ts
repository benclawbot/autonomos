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

// GET /api/disputes?orderId=xxx - Get dispute for an order
export async function GET(request: Request) {
  try {
    const prisma = await getPrisma()
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID required' },
        { status: 400 }
      )
    }

    const dispute = await prisma.dispute.findUnique({
      where: { orderId },
      include: {
        order: {
          include: {
            gig: { select: { id: true, title: true } }
          }
        },
        raiser: { select: { id: true, username: true, fullName: true, avatarUrl: true } }
      }
    })

    return NextResponse.json({ dispute: dispute || null })
  } catch (error: any) {
    console.error('Disputes GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dispute' },
      { status: 500 }
    )
  }
}

// POST /api/disputes - Open a dispute
export async function POST(request: Request) {
  try {
    const prisma = await getPrisma()
    const body = await request.json()
    const { orderId, raiserId, reason } = body

    if (!orderId || !raiserId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, raiserId, reason' },
        { status: 400 }
      )
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { buyerId: true, sellerId: true, status: true }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Verify user is part of this order
    if (order.buyerId !== raiserId && order.sellerId !== raiserId) {
      return NextResponse.json(
        { error: 'Not authorized to dispute this order' },
        { status: 403 }
      )
    }

    // Check if dispute already exists
    const existing = await prisma.dispute.findUnique({
      where: { orderId }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Dispute already exists for this order' },
        { status: 400 }
      )
    }

    // Create dispute
    const dispute = await prisma.dispute.create({
      data: {
        orderId,
        raiserId,
        reason,
        status: 'OPEN'
      }
    })

    // Update order status to disputed
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'DISPUTED' }
    })

    return NextResponse.json({ dispute })
  } catch (error: any) {
    console.error('Disputes POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create dispute' },
      { status: 500 }
    )
  }
}

// PATCH /api/disputes - Resolve/update dispute (admin only)
export async function PATCH(request: Request) {
  try {
    const prisma = await getPrisma()
    const body = await request.json()
    const { disputeId, status, resolution, adminId } = body

    if (!disputeId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: disputeId, status' },
        { status: 400 }
      )
    }

    // Verify admin (in real app, check admin role)
    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin ID required' },
        { status: 403 }
      )
    }

    const updateData: any = {
      status: status.toUpperCase()
    }

    if (resolution) {
      updateData.resolution = resolution
    }

    if (status === 'resolved') {
      updateData.resolvedAt = new Date()
    }

    const dispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: updateData
    })

    // If resolved, update order status based on resolution
    if (status === 'resolved') {
      const resolutionLower = resolution?.toLowerCase() || ''
      const orderStatus = resolutionLower.includes('refund') ? 'REFUNDED' : 'COMPLETED'

      await prisma.order.update({
        where: { id: dispute.orderId },
        data: { status: orderStatus }
      })
    }

    return NextResponse.json({ dispute })
  } catch (error: any) {
    console.error('Disputes PATCH error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update dispute' },
      { status: 500 }
    )
  }
}
