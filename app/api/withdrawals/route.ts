import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Lazy-load Prisma
let prismaInstance: any = null
async function getPrisma() {
  if (!prismaInstance) {
    const { PrismaClient } = await import('@prisma/client')
    prismaInstance = new PrismaClient()
  }
  return prismaInstance
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// GET /api/withdrawals?userId=xxx - Get user's withdrawal history
export async function GET(request: Request) {
  try {
    const prisma = await getPrisma()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    // Get user's available balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true, pendingBalance: true }
    })

    return NextResponse.json({
      withdrawals,
      availableBalance: user?.balance || 0,
      pendingBalance: user?.pendingBalance || 0
    })
  } catch (error: any) {
    console.error('Withdrawals GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch withdrawals' },
      { status: 500 }
    )
  }
}

// POST /api/withdrawals - Request a withdrawal
export async function POST(request: Request) {
  try {
    const prisma = await getPrisma()
    const body = await request.json()
    const { userId, amount, method = 'stripe' } = body

    if (!userId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, amount' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      )
    }

    // Get user's info and balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, balance: true, stripeAccountId: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    // Check Stripe account for Stripe withdrawals
    if (method === 'stripe') {
      if (!user.stripeAccountId) {
        return NextResponse.json(
          { error: 'No Stripe account connected. Please connect your Stripe account first.' },
          { status: 400 }
        )
      }

      try {
        // Create transfer to connected account
        const transfer = await stripe.transfers.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          destination: user.stripeAccountId,
        })

        // Create withdrawal record
        const withdrawal = await prisma.withdrawal.create({
          data: {
            userId,
            amount,
            currency: 'USD',
            method: 'stripe',
            status: 'COMPLETED',
            transactionId: transfer.id,
            processedAt: new Date()
          }
        })

        // Deduct from user's balance
        await prisma.user.update({
          where: { id: userId },
          data: { balance: user.balance - amount }
        })

        return NextResponse.json({ withdrawal })
      } catch (stripeError: any) {
        console.error('Stripe transfer error:', stripeError)
        return NextResponse.json(
          { error: stripeError.message || 'Failed to process withdrawal' },
          { status: 500 }
        )
      }
    }

    if (method === 'crypto') {
      // For crypto withdrawals, just create pending record
      const withdrawal = await prisma.withdrawal.create({
        data: {
          userId,
          amount,
          currency: 'USD',
          method: 'crypto',
          status: 'PENDING'
        }
      })

      // Deduct from user's balance
      await prisma.user.update({
        where: { id: userId },
        data: { balance: user.balance - amount }
      })

      return NextResponse.json({
        withdrawal,
        message: 'Crypto withdrawal request created. Processing may take 24-48 hours.'
      })
    }

    return NextResponse.json(
      { error: 'Invalid withdrawal method' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Withdrawals POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
