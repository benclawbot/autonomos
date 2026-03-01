import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyWebhookSignature } from '@/lib/stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    let event;
    try {
      event = verifyWebhookSignature(body, signature);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Get order ID from metadata
        const orderId = session.metadata?.orderId;
        const gigId = session.metadata?.gigId;
        
        if (orderId) {
          // Update order to escrow status
          await supabase
            .from('orders')
            .update({
              status: 'in_escrow',
              payment_status: 'paid',
              payment_id: session.payment_intent,
              escrow_started_at: new Date().toISOString(),
            })
            .eq('id', orderId);

          console.log(`Order ${orderId} paid and moved to escrow`);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        
        // Find order by payment intent
        const { data: orders } = await supabase
          .from('orders')
          .select('id')
          .eq('payment_id', paymentIntent.id)
          .limit(1);

        if (orders && orders.length > 0) {
          await supabase
            .from('orders')
            .update({
              status: 'in_escrow',
              payment_status: 'paid',
              escrow_started_at: new Date().toISOString(),
            })
            .eq('id', orders[0].id);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        
        // Find and update failed payment
        const { data: orders } = await supabase
          .from('orders')
          .select('id')
          .eq('payment_id', paymentIntent.id)
          .limit(1);

        if (orders && orders.length > 0) {
          await supabase
            .from('orders')
            .update({
              status: 'payment_failed',
              payment_status: 'failed',
            })
            .eq('id', orders[0].id);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        
        // Find order and mark as refunded
        const { data: orders } = await supabase
          .from('orders')
          .select('id')
          .eq('payment_id', charge.payment_intent)
          .limit(1);

        if (orders && orders.length > 0) {
          await supabase
            .from('orders')
            .update({
              status: 'refunded',
              payment_status: 'refunded',
            })
            .eq('id', orders[0].id);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
