import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Plisio callback webhook for crypto payments
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Plisio sends callback after payment confirmation
    const { 
      invoice_id, 
      status, 
      order_number, 
      amount_received, 
      confirmations 
    } = body;

    console.log('Plisio webhook received:', body);

    // Find order by invoice ID or order number
    let orderId = order_number;
    
    if (!orderId) {
      // Try to find by invoice_id in metadata
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('payment_id', invoice_id)
        .limit(1);
      
      if (orders && orders.length > 0) {
        orderId = orders[0].id;
      }
    }

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Handle different payment statuses
    switch (status) {
      case 'completed': {
        // Payment confirmed - move to escrow
        await supabase
          .from('orders')
          .update({
            status: 'in_escrow',
            payment_status: 'paid',
            payment_id: invoice_id,
            amount_paid: amount_received,
            escrow_started_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        console.log(`Order ${orderId} crypto payment completed - in escrow`);
        break;
      }

      case 'pending': {
        // Payment initiated but not confirmed
        await supabase
          .from('orders')
          .update({
            payment_status: 'pending',
            payment_id: invoice_id,
          })
          .eq('id', orderId);
        break;
      }

      case 'expired': {
        // Payment expired
        await supabase
          .from('orders')
          .update({
            status: 'payment_failed',
            payment_status: 'expired',
          })
          .eq('id', orderId);
        break;
      }

      case 'canceled': {
        // Payment canceled by user
        await supabase
          .from('orders')
          .update({
            status: 'payment_failed',
            payment_status: 'canceled',
          })
          .eq('id', orderId);
        break;
      }

      default:
        console.log(`Unhandled Plisio status: ${status}`);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Crypto webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
