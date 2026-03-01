import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/messages?orderId=xxx - Get messages for an order
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

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id(
          id,
          username,
          fullName:full_name,
          avatarUrl:avatar_url
        )
      `)
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Messages GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/messages - Send a message
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, senderId, content, attachments } = body;

    if (!orderId || !senderId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, senderId, content' },
        { status: 400 }
      );
    }

    // Verify user is part of this order (buyer or seller)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('buyer_id, seller_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.buyer_id !== senderId && order.seller_id !== senderId) {
      return NextResponse.json(
        { error: 'Not authorized to message this order' },
        { status: 403 }
      );
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        order_id: orderId,
        sender_id: senderId,
        content,
        attachments: attachments || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Get sender info for response
    const { data: sender } = await supabase
      .from('users')
      .select('id, username, full_name, avatar_url')
      .eq('id', senderId)
      .single();

    return NextResponse.json({ 
      message: {
        ...message,
        sender
      }
    });
  } catch (error) {
    console.error('Messages POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/messages - Mark messages as read
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, userId } = body;

    if (!orderId || !userId) {
      return NextResponse.json(
        { error: 'Order ID and User ID required' },
        { status: 400 }
      );
    }

    // Mark all messages in this order as read (except those sent by this user)
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('order_id', orderId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Messages PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
