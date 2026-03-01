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

// GET /api/withdrawals?userId=xxx - Get user's withdrawal history
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

    const { data: withdrawals, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch withdrawals' },
        { status: 500 }
      );
    }

    // Get user's available balance
    const { data: user } = await supabase
      .from('users')
      .select('total_earnings')
      .eq('id', userId)
      .single();

    return NextResponse.json({ 
      withdrawals,
      availableBalance: user?.total_earnings || 0
    });
  } catch (error) {
    console.error('Withdrawals GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/withdrawals - Request a withdrawal
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, amount, method = 'stripe' } = body;

    if (!userId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, amount' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    // Get user's info and balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, total_earnings, stripe_account_id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.total_earnings < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Check Stripe account for Stripe withdrawals
    if (method === 'stripe') {
      if (!user.stripe_account_id) {
        return NextResponse.json(
          { error: 'No Stripe account connected. Please connect your Stripe account first.' },
          { status: 400 }
        );
      }

      try {
        // Create transfer to connected account
        const transfer = await stripe.transfers.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          destination: user.stripe_account_id,
        });

        // Create withdrawal record
        const { data: withdrawal, error } = await supabase
          .from('withdrawals')
          .insert({
            user_id: userId,
            amount,
            currency: 'USD',
            method: 'stripe',
            status: 'completed',
            transaction_id: transfer.id,
            processed_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          // Transfer created but DB record failed - log for manual review
          console.error('Failed to record withdrawal:', error);
          return NextResponse.json(
            { error: error.message },
            { status: 500 }
          );
        }

        // Deduct from user's balance
        await supabase
          .from('users')
          .update({ 
            total_earnings: user.total_earnings - amount 
          })
          .eq('id', userId);

        return NextResponse.json({ withdrawal });
      } catch (stripeError: any) {
        console.error('Stripe transfer error:', stripeError);
        return NextResponse.json(
          { error: stripeError.message || 'Failed to process withdrawal' },
          { status: 500 }
        );
      }
    }

    if (method === 'crypto') {
      // For crypto withdrawals, just create pending record
      // In real implementation, integrate with crypto payment provider
      const { data: withdrawal, error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: userId,
          amount,
          currency: 'USD',
          method: 'crypto',
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      // Deduct from user's balance
      await supabase
        .from('users')
        .update({ 
          total_earnings: user.total_earnings - amount 
        })
        .eq('id', userId);

      return NextResponse.json({ 
        withdrawal,
        message: 'Crypto withdrawal request created. Processing may take 24-48 hours.'
      });
    }

    return NextResponse.json(
      { error: 'Invalid withdrawal method' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Withdrawals POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
