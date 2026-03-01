import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/users/me - Get current user profile
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
      .select(`
        id,
        email,
        username,
        fullName:full_name,
        avatarUrl:avatar_url,
        userType:user_type,
        bio,
        skills,
        hourlyRate:hourly_rate,
        stripeAccountId:stripe_account_id,
        isVerified:is_verified,
        isActive:is_active,
        rating,
        totalSales:total_sales,
        totalEarnings:total_earnings,
        createdAt:created_at
      `)
      .eq('id', userId)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('User GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/users/me - Update current user profile
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, ...updates } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Map camelCase to snake_case for database
    const dbUpdates: any = {};
    if (updates.fullName) dbUpdates.full_name = updates.fullName;
    if (updates.avatarUrl) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.bio) dbUpdates.bio = updates.bio;
    if (updates.skills) dbUpdates.skills = updates.skills;
    if (updates.hourlyRate) dbUpdates.hourly_rate = updates.hourlyRate;
    if (updates.stripeAccountId) dbUpdates.stripe_account_id = updates.stripeAccountId;

    const { data: user, error } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('User PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
