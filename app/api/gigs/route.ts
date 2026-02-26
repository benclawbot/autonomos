import { NextResponse } from 'next/server'

// Lazy Supabase client
const getSupabase = () => {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  )
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const supabase = getSupabase()

    let query = supabase
      .from('gigs')
      .select(`
        *,
        seller:users(id, username, fullName, avatarUrl, rating, totalSales),
        category:categories(id, name, slug)
      `)
      .eq('status', 'ACTIVE')

    if (category) {
      query = query.eq('category.slug', category)
    }

    if (type) {
      query = query.eq('type', type.toUpperCase())
    }

    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .range(from, to)
      .order('totalOrders', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      gigs: data,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabase()

    const {
      title,
      description,
      type,
      categoryId,
      pricing,
      deliveryDays,
      revisionRounds,
      thumbnailUrl,
      tags,
      sellerId,
    } = await request.json()

    const { data, error } = await supabase
      .from('gigs')
      .insert({
        title,
        description,
        type: type || 'HUMAN',
        categoryId,
        pricing,
        deliveryDays: deliveryDays || 7,
        revisionRounds: revisionRounds || 2,
        thumbnailUrl,
        tags: tags || [],
        sellerId,
        status: 'ACTIVE',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ gig: data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
