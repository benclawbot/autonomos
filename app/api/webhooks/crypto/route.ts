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

// Plisio callback webhook for crypto payments
export async function POST(request: Request) {
  try {
    const prisma = await getPrisma()
    const body = await request.json()

    // Plisio sends callback after payment confirmation
    const {
      invoice_id,
      status,
      order_number,
      amount_received,
      confirmations
    } = body

    console.log('Plisio webhook received:', body)

    // Find order by invoice ID or order number
    let orderId = order_number

    if (!orderId) {
      // Try to find by invoice_id
      const order = await prisma.order.findFirst({
        where: { stripePaymentIntentId: invoice_id }
      })

      if (order) {
        orderId = order.id
      }
    }

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Handle different payment statuses
    switch (status) {
      case 'completed': {
        // Payment confirmed - move to escrow
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'IN_ESCROW',
            paymentStatus: 'PAID',
            cryptoPaymentId: invoice_id,
            amountPaid: parseFloat(amount_received) || 0,
            escrowStartedAt: new Date(),
            paidAt: new Date()
          }
        })

        console.log(`Order ${orderId} crypto payment completed - in escrow`)
        break
      }

      case 'pending': {
        // Payment initiated but not confirmed
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'PENDING',
            cryptoPaymentId: invoice_id
          }
        })
        break
      }

      case 'expired': {
        // Payment expired
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'CANCELLED',
            paymentStatus: 'FAILED'
          }
        })
        break
      }

      case 'canceled': {
        // Payment canceled by user
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'CANCELLED',
            paymentStatus: 'CANCELLED'
          }
        })
        break
      }

      default:
        console.log(`Unhandled Plisio status: ${status}`)
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Crypto webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
