import { NextResponse } from 'next/server'

// Lazy-load Prisma
let prismaInstance: any = null
async function getPrisma() {
  if (!prismaInstance) {
    const { PrismaClient } = await import('@prisma/client')
    prismaInstance = new PrismaClient()
  }
  return prismaInstance
}

// Bot authentication via API key
// POST /api/auth/bot
// Body: { apiKey: string, botId: string }

export async function POST(request: Request) {
  try {
    const prisma = await getPrisma()
    const body = await request.json()
    const { apiKey, botId, botName, capabilities } = body

    if (!apiKey || !botId) {
      return NextResponse.json(
        { error: 'Missing required fields: apiKey, botId' },
        { status: 400 }
      )
    }

    // Check if bot already exists
    const existingBot = await prisma.user.findUnique({
      where: { id: botId }
    })

    if (existingBot && existingBot.userType === 'BOT') {
      // Update bot
      const updatedBot = await prisma.user.update({
        where: { id: botId },
        data: {
          apiKey,
          isActive: true
        }
      })

      // Generate session token
      const token = Buffer.from(`${botId}:${apiKey}`).toString('base64')

      return NextResponse.json({
        success: true,
        bot: {
          id: updatedBot.id,
          username: updatedBot.username,
          botName: updatedBot.fullName,
        },
        token,
        message: 'Bot logged in successfully',
      })
    }

    // Create new bot user
    const newBot = await prisma.user.create({
      data: {
        id: botId,
        username: botName ? botName.toLowerCase().replace(/\s+/g, '_') : `bot_${botId.slice(0, 8)}`,
        fullName: botName || 'Unnamed Bot',
        email: `${botId}@bot.autonomos.ai`,
        userType: 'BOT',
        apiKey,
        isActive: true,
        emailVerified: true,
        skills: capabilities || [],
      }
    })

    // Generate session token
    const token = Buffer.from(`${botId}:${apiKey}`).toString('base64')

    return NextResponse.json({
      success: true,
      bot: {
        id: newBot.id,
        username: newBot.username,
        botName: newBot.fullName,
      },
      token,
      message: 'Bot registered and logged in successfully',
    })
  } catch (error: any) {
    console.error('Bot auth error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/auth/bot - Verify bot token
export async function GET(request: Request) {
  try {
    const prisma = await getPrisma()
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token required' },
        { status: 400 }
      )
    }

    // Decode token
    const decoded = Buffer.from(token, 'base64').toString()
    const [botId, apiKey] = decoded.split(':')

    // Verify bot
    const bot = await prisma.user.findUnique({
      where: { id: botId },
      select: { id: true, username: true, fullName: true, userType: true, isActive: true }
    })

    if (!bot || bot.userType !== 'BOT' || !bot.isActive) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      valid: true,
      bot: {
        id: bot.id,
        username: bot.username,
        botName: bot.fullName,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
