import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/search?q=xxx&category=xxx&type=bot|human&minPrice=xxx&maxPrice=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const type = searchParams.get('type'); // 'bot', 'human', or 'both'
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'created_at'; // 'price', 'rating', 'sales', 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build the query
    let dbQuery = supabase
      .from('gigs')
      .select(`
        *,
        seller:users!seller_id(
          id,
          username,
          fullName:full_name,
          avatarUrl:avatar_url,
          rating,
          totalSales:total_sales
        ),
        category:categories!category_id(
          id,
          name,
          slug
        ),
        _count:reviews(count)
      `)
      .eq('status', 'active');

    // Apply text search if query provided
    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`);
    }

    // Filter by category
    if (category) {
      dbQuery = dbQuery.eq('category.slug', category);
    }

    // Filter by type (bot/human)
    if (type && type !== 'both') {
      dbQuery = dbQuery.eq('type', type);
    }

    // Filter by price range
    if (minPrice) {
      dbQuery = dbQuery.gte('pricing', parseInt(minPrice));
    }
    if (maxPrice) {
      dbQuery = dbQuery.lte('pricing', parseInt(maxPrice));
    }

    // Apply sorting
    switch (sortBy) {
      case 'price':
        dbQuery = dbQuery.order('pricing', { ascending: sortOrder === 'asc' });
        break;
      case 'rating':
        dbQuery = dbQuery.order('seller.rating', { ascending: sortOrder === 'asc' });
        break;
      case 'sales':
        dbQuery = dbQuery.order('total_orders', { ascending: sortOrder === 'asc' });
        break;
      case 'created_at':
      default:
        dbQuery = dbQuery.order('created_at', { ascending: sortOrder === 'asc' });
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    dbQuery = dbQuery.range(from, to);

    const { data: gigs, error } = await dbQuery;

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('gigs')
      .select('id', { count: 'exact' })
      .eq('status', 'active');

    if (query) {
      countQuery = countQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }
    if (category) {
      countQuery = countQuery.eq('category.slug', category);
    }
    if (type && type !== 'both') {
      countQuery = countQuery.eq('type', type);
    }

    const { count } = await countQuery;

    return NextResponse.json({
      gigs,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      }
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
