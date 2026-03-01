import { NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/stripe'

// Lazy-load Prisma
let prismaInstance: any = null
async function getPrisma() {
  if (!prismaInstance) {
    const { PrismaClient } = await import('@prisma/client')
    prismaInstance = new PrismaClient()
  }
  return prismaInstance
}

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      )
    }

    let event
    try {
      event = verifyWebhookSignature(body, signature)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const prisma = await getPrisma()

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object

        // Get order ID from metadata
        const orderId = session.metadata?.orderId

        if (orderId) {
          // Update order to escrow status
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'IN_ESCROW',
              paymentStatus: 'PAID',
              stripePaymentIntentId: session.payment_intent,
              escrowStartedAt: new Date(),
              paidAt: new Date()
            }
          })

          console.log(`Order ${orderId} paid and moved to escrow`)
        }
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object

        // Find order by payment intent
        const order = await prisma.order.findFirst({
          where: { stripePaymentIntentId: paymentIntent.id }
        })

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'IN_ESCROW',
              paymentStatus: 'PAID',
              escrowStartedAt: new Date(),
              paidAt: new Date()
            }
          })
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object

        // Find and update failed payment
        const order = await prisma.order.findFirst({
          where: { stripePaymentIntentId: paymentIntent.id }
        })

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'CANCELLED',
              paymentStatus: 'FAILED'
            }
          })
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object

        // Find order and mark as refunded
        const order = await prisma.order.findFirst({
          where: { stripePaymentIntentId: charge.payment_intent }
        })

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'REFUNDED',
              paymentStatus: 'REFUNDED'
            }
          })
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
