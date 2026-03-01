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

// GET /api/messages?orderId=xxx - Get messages for an order
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

    const messages = await prisma.message.findMany({
      where: { orderId },
      include: {
        sender: { select: { id: true, username: true, fullName: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ messages })
  } catch (error: any) {
    console.error('Messages GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST /api/messages - Send a message
export async function POST(request: Request) {
  try {
    const prisma = await getPrisma()
    const body = await request.json()
    const { orderId, senderId, content, attachments } = body

    if (!orderId || !senderId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, senderId, content' },
        { status: 400 }
      )
    }

    // Verify user is part of this order (buyer or seller)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { buyerId: true, sellerId: true }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.buyerId !== senderId && order.sellerId !== senderId) {
      return NextResponse.json(
        { error: 'Not authorized to message this order' },
        { status: 403 }
      )
    }

    const message = await prisma.message.create({
      data: {
        orderId,
        senderId,
        content,
        attachments: attachments || undefined
      },
      include: {
        sender: { select: { id: true, username: true, fullName: true, avatarUrl: true } }
      }
    })

    return NextResponse.json({ message })
  } catch (error: any) {
    console.error('Messages POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    )
  }
}

// PATCH /api/messages - Mark messages as read
export async function PATCH(request: Request) {
  try {
    const prisma = await getPrisma()
    const body = await request.json()
    const { orderId, userId } = body

    if (!orderId || !userId) {
      return NextResponse.json(
        { error: 'Order ID and User ID required' },
        { status: 400 }
      )
    }

    // Mark all messages in this order as read (except those sent by this user)
    await prisma.message.updateMany({
      where: {
        orderId,
        senderId: { not: userId },
        isRead: false
      },
      data: { isRead: true }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Messages PATCH error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to mark messages as read' },
      { status: 500 }
    )
  }
}
