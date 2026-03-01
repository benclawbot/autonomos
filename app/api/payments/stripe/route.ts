import { createCheckoutSession, createPaymentIntent } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, amount, currency = 'usd', productName, metadata = {} } = body;

    let session;

    switch (type) {
      case 'checkout':
        session = await createCheckoutSession({
          priceAmount: amount,
          currency,
          productName: productName || 'Autonomos Service',
          metadata,
        });
        break;

      case 'payment_intent':
        const paymentIntent = await createPaymentIntent({
          amount,
          currency,
          metadata,
        });
        return NextResponse.json({
          success: true,
          clientSecret: paymentIntent.client_secret,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid payment type' },
          { status: 400 }
        );
    }

    if (session) {
      return NextResponse.json({
        success: true,
        sessionId: session.id,
        url: session.url,
      });
    }

    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
