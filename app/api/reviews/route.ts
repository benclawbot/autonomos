import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/reviews?userId=xxx - Get reviews for a user
// GET /api/reviews?orderId=xxx - Get review for an order
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const orderId = searchParams.get('orderId');

    if (userId) {
      // Get reviews for a user (reviews they received)
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
          *,
          order:order_id(
            id,
            gig_id,
            gig:gigs(id, title)
          ),
          reviewer:reviewer_id(
            id,
            username,
            fullName:full_name,
            avatarUrl:avatar_url
          )
        `)
        .eq('reviewee_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch reviews' },
          { status: 500 }
        );
      }

      // Calculate average rating
      const avgRating = reviews?.reduce((sum, r) => sum + r.rating, 0) / (reviews?.length || 1);
      
      return NextResponse.json({ 
        reviews,
        averageRating: avgRating.toFixed(2),
        totalReviews: reviews?.length || 0
      });
    }

    if (orderId) {
      // Get review for a specific order
      const { data: review, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:reviewer_id(
            id,
            username,
            fullName:full_name,
            avatarUrl:avatar_url
          )
        `)
        .eq('order_id', orderId)
        .single();

      if (error) {
        return NextResponse.json({ review: null });
      }

      return NextResponse.json({ review });
    }

    return NextResponse.json(
      { error: 'userId or orderId required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Reviews GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Leave a review
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, reviewerId, rating, comment } = body;

    if (!orderId || !reviewerId || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, reviewerId, rating' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Get order details to find the reviewee
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

    // Verify order is completed
    if (order.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Can only review completed orders' },
        { status: 400 }
      );
    }

    // Determine who is being reviewed (the other party)
    const revieweeId = order.buyer_id === reviewerId ? order.seller_id : order.buyer_id;

    // Check if review already exists
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('order_id', orderId)
      .eq('reviewer_id', reviewerId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'You have already reviewed this order' },
        { status: 400 }
      );
    }

    // Create review
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        order_id: orderId,
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        rating,
        comment: comment || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Update seller's average rating
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', revieweeId);

    if (allReviews) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await supabase
        .from('users')
        .update({ rating: avgRating })
        .eq('id', revieweeId);
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Reviews POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
