import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// POST /api/stripe/connect - Create connected account for seller
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, email } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, email' },
        { status: 400 }
      );
    }

    // Check if user already has a Stripe account
    const { data: existingUser } = await supabase
      .from('users')
      .select('stripe_account_id')
      .eq('id', userId)
      .single();

    if (existingUser?.stripe_account_id) {
      // Generate new onboarding link for existing account
      const accountLink = await stripe.accountLinks.create({
        account: existingUser.stripe_account_id,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/stripe/connect/refresh`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/stripe/connect/dashboard`,
        type: 'account_onboarding',
      });

      return NextResponse.json({
        url: accountLink.url,
        accountId: existingUser.stripe_account_id,
        message: 'Reconnecting existing account'
      });
    }

    // Create new Express account
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Save account ID to user
    await supabase
      .from('users')
      .update({ stripe_account_id: account.id })
      .eq('id', userId);

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/stripe/connect/refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/stripe/connect/dashboard`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      url: accountLink.url,
      accountId: account.id,
    });
  } catch (error) {
    console.error('Stripe Connect error:', error);
    return NextResponse.json(
      { error: 'Failed to create Stripe account' },
      { status: 500 }
    );
  }
}

// GET /api/stripe/connect?userId=xxx - Check connection status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('stripe_account_id')
      .eq('id', userId)
      .single();

    if (error || !user?.stripe_account_id) {
      return NextResponse.json({ 
        connected: false,
        accountId: null 
      });
    }

    // Check account status with Stripe
    try {
      const account = await stripe.accounts.retrieve(user.stripe_account_id);
      
      return NextResponse.json({
        connected: account.charges_enabled,
        accountId: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
      });
    } catch (stripeError) {
      return NextResponse.json({ 
        connected: false,
        accountId: user.stripe_account_id,
        error: 'Could not verify account status'
      });
    }
  } catch (error) {
    console.error('Stripe Connect GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/stripe/connect - Disconnect account
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Remove Stripe account from user (don't delete the Stripe account, just disconnect)
    await supabase
      .from('users')
      .update({ stripe_account_id: null })
      .eq('id', userId);

    return NextResponse.json({ 
      success: true,
      message: 'Stripe account disconnected' 
    });
  } catch (error) {
    console.error('Stripe Connect DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
