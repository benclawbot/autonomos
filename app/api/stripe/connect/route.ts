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

// POST /api/stripe/connect - Create connected account for seller
export async function POST(request: Request) {
  try {
    const prisma = await getPrisma()
    const body = await request.json()
    const { userId, email } = body

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, email' },
        { status: 400 }
      )
    }

    // Check if user already has a Stripe account
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeAccountId: true }
    })

    if (user?.stripeAccountId) {
      // Generate new onboarding link for existing account
      const accountLink = await stripe.accountLinks.create({
        account: user.stripeAccountId,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?stripe=refresh`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?stripe=connected`,
        type: 'account_onboarding',
      })

      return NextResponse.json({
        url: accountLink.url,
        accountId: user.stripeAccountId,
        message: 'Reconnecting existing account'
      })
    }

    // Create new Express account
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    })

    // Save account ID to user
    await prisma.user.update({
      where: { id: userId },
      data: { stripeAccountId: account.id }
    })

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?stripe=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?stripe=connected`,
      type: 'account_onboarding',
    })

    return NextResponse.json({
      url: accountLink.url,
      accountId: account.id,
    })
  } catch (error) {
    console.error('Stripe Connect error:', error)
    return NextResponse.json(
      { error: 'Failed to create Stripe account' },
      { status: 500 }
    )
  }
}

// GET /api/stripe/connect?userId=xxx - Check connection status
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeAccountId: true }
    })

    if (!user?.stripeAccountId) {
      return NextResponse.json({
        connected: false,
        accountId: null
      })
    }

    // Check account status with Stripe
    try {
      const account = await stripe.accounts.retrieve(user.stripeAccountId)

      return NextResponse.json({
        connected: account.charges_enabled,
        accountId: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
      })
    } catch (stripeError) {
      return NextResponse.json({
        connected: false,
        accountId: user.stripeAccountId,
        error: 'Could not verify account status'
      })
    }
  } catch (error) {
    console.error('Stripe Connect GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/stripe/connect - Disconnect account
export async function DELETE(request: Request) {
  try {
    const prisma = await getPrisma()
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Remove Stripe account from user (don't delete the Stripe account, just disconnect)
    await prisma.user.update({
      where: { id: userId },
      data: { stripeAccountId: null }
    })

    return NextResponse.json({
      success: true,
      message: 'Stripe account disconnected'
    })
  } catch (error) {
    console.error('Stripe Connect DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
