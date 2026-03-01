import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client (use service role for backend)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gigId, packageType, amount, currency = 'usd' } = body;

    // Validate required fields
    if (!gigId || !packageType || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: gigId, packageType, amount' },
        { status: 400 }
      );
    }

    // Get gig details to find seller
    const { data: gig, error: gigError } = await supabase
      .from('gigs')
      .select('id, title, seller_id, seller:users(id, username)')
      .eq('id', gigId)
      .single();

    if (gigError || !gig) {
      return NextResponse.json(
        { error: 'Gig not found' },
        { status: 404 }
      );
    }

    // Create order with ESCROW status (funds held until delivery)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        gig_id: gigId,
        buyer_id: null, // Will be set from session after auth
        seller_id: gig.seller_id,
        package_type: packageType,
        amount: amount,
        currency,
        status: 'pending_payment', // Will change to 'escrow' after payment
        payment_status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Order API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const buyerId = searchParams.get('buyerId');
    const sellerId = searchParams.get('sellerId');

    let query = supabase
      .from('orders')
      .select(`
        *,
        gig:gigs(id, title, thumbnailUrl),
        buyer:users!buyer_id(id, username, fullName, avatarUrl),
        seller:users!seller_id(id, username, fullName, avatarUrl)
      `)
      .order('created_at', { ascending: false });

    if (orderId) {
      query = query.eq('id', orderId);
    }
    if (buyerId) {
      query = query.eq('buyer_id', buyerId);
    }
    if (sellerId) {
      query = query.eq('seller_id', sellerId);
    }

    const { data: orders, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update order status (webhook calls this after payment)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status, paymentStatus, paymentId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.payment_status = paymentStatus;
    if (paymentId) updateData.payment_id = paymentId;

    // If payment completed, move to escrow
    if (paymentStatus === 'paid') {
      updateData.status = 'in_escrow';
      updateData.escrow_started_at = new Date().toISOString();
    }

    // If delivery confirmed, release escrow to seller
    if (status === 'completed' && paymentStatus === 'released') {
      updateData.escrow_released_at = new Date().toISOString();
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Order PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
