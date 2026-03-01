import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/disputes?orderId=xxx - Get dispute for an order
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID required' },
        { status: 400 }
      );
    }

    const { data: dispute, error } = await supabase
      .from('disputes')
      .select(`
        *,
        order:order_id(
          id,
          gig_id,
          gig:gigs(id, title)
        ),
        raiser:raiser_id(
          id,
          username,
          fullName:full_name,
          avatarUrl:avatar_url
        )
      `)
      .eq('order_id', orderId)
      .single();

    if (error) {
      return NextResponse.json({ dispute: null });
    }

    return NextResponse.json({ dispute });
  } catch (error) {
    console.error('Disputes GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/disputes - Open a dispute
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, raiserId, reason } = body;

    if (!orderId || !raiserId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, raiserId, reason' },
        { status: 400 }
      );
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, buyer_id, seller_id, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify user is part of this order
    if (order.buyer_id !== raiserId && order.seller_id !== raiserId) {
      return NextResponse.json(
        { error: 'Not authorized to dispute this order' },
        { status: 403 }
      );
    }

    // Check if dispute already exists
    const { data: existing } = await supabase
      .from('disputes')
      .select('id')
      .eq('order_id', orderId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Dispute already exists for this order' },
        { status: 400 }
      );
    }

    // Create dispute
    const { data: dispute, error } = await supabase
      .from('disputes')
      .insert({
        order_id: orderId,
        raiser_id: raiserId,
        reason,
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Update order status to disputed
    await supabase
      .from('orders')
      .update({ status: 'DISPUTED' })
      .eq('id', orderId);

    return NextResponse.json({ dispute });
  } catch (error) {
    console.error('Disputes POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/disputes - Resolve/update dispute (admin only)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { disputeId, status, resolution, adminId } = body;

    if (!disputeId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: disputeId, status' },
        { status: 400 }
      );
    }

    // Verify admin (in real app, check admin role)
    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin ID required' },
        { status: 403 }
      );
    }

    const updateData: any = {
      status,
      resolved_at: new Date().toISOString(),
    };

    if (resolution) {
      updateData.resolution = resolution;
    }

    const { data: dispute, error } = await supabase
      .from('disputes')
      .update(updateData)
      .eq('id', disputeId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // If resolved, update order status based on resolution
    if (status === 'resolved') {
      // Get order to decide what to do next
      const { data: resolvedDispute } = await supabase
        .from('disputes')
        .select('order_id, resolution')
        .eq('id', disputeId)
        .single();

      if (resolvedDispute) {
        // Parse resolution to determine order action
        // Could be: "refund", "release", "cancel"
        const orderStatus = resolution?.toLowerCase().includes('refund') 
          ? 'REFUNDED' 
          : 'COMPLETED';

        await supabase
          .from('orders')
          .update({ status: orderStatus })
          .eq('id', resolvedDispute.order_id);
      }
    }

    return NextResponse.json({ dispute });
  } catch (error) {
    console.error('Disputes PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
