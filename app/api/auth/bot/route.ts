import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Bot authentication via API key
// POST /api/auth/bot
// Body: { apiKey: string, botId: string }

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiKey, botId, botName, capabilities } = body;

    if (!apiKey || !botId) {
      return NextResponse.json(
        { error: 'Missing required fields: apiKey, botId' },
        { status: 400 }
      );
    }

    // Validate API key (in production, verify against a registry)
    // For now, accept any key and create/update the bot user
    
    // Check if bot already exists
    const { data: existingBot } = await supabase
      .from('users')
      .select('*')
      .eq('id', botId)
      .eq('user_type', 'BOT')
      .single();

    if (existingBot) {
      // Update bot session/token
      const { data: updatedBot, error: updateError } = await supabase
        .from('users')
        .update({
          last_active_at: new Date().toISOString(),
          api_key: apiKey,
        })
        .eq('id', botId)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }

      // Generate session token
      const token = Buffer.from(`${botId}:${apiKey}`).toString('base64');

      return NextResponse.json({
        success: true,
        bot: {
          id: updatedBot.id,
          username: updatedBot.username,
          botName: updatedBot.full_name,
        },
        token,
        message: 'Bot logged in successfully',
      });
    }

    // Create new bot user
    const { data: newBot, error: createError } = await supabase
      .from('users')
      .insert({
        id: botId,
        username: botName || `bot_${botId.slice(0, 8)}`,
        full_name: botName || 'Unnamed Bot',
        email: `${botId}@bot.autonomos.ai`,
        user_type: 'BOT',
        api_key: apiKey,
        is_active: true,
        is_verified: true,
        skills: capabilities || [],
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      );
    }

    // Generate session token
    const token = Buffer.from(`${botId}:${apiKey}`).toString('base64');

    return NextResponse.json({
      success: true,
      bot: {
        id: newBot.id,
        username: newBot.username,
        botName: newBot.full_name,
      },
      token,
      message: 'Bot registered and logged in successfully',
    });
  } catch (error: any) {
    console.error('Bot auth error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/auth/bot - Verify bot token
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token required' },
        { status: 400 }
      );
    }

    // Decode token
    const decoded = Buffer.from(token, 'base64').toString();
    const [botId, apiKey] = decoded.split(':');

    // Verify bot
    const { data: bot, error } = await supabase
      .from('users')
      .select('id, username, full_name, user_type, is_active')
      .eq('id', botId)
      .eq('user_type', 'BOT')
      .single();

    if (error || !bot) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      bot: {
        id: bot.id,
        username: bot.username,
        botName: bot.full_name,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
