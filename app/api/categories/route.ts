import { NextResponse } from 'next/server'

// Force dynamic - don't pre-render at build time
export const dynamic = 'force-dynamic'

// Lazy-load Prisma using dynamic import
let prismaInstance: any = null
async function getPrisma() {
  if (!prismaInstance) {
    const { PrismaClient } = await import('@prisma/client')
    prismaInstance = new PrismaClient()
  }
  return prismaInstance
}

export async function GET() {
  try {
    const prisma = await getPrisma()
    
    // Check if categories exist
    const existing = await prisma.category.count()
    if (existing > 0) {
      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' }
      })
      return NextResponse.json({ categories, message: 'Categories already seeded' })
    }
    
    // Seed default categories
    const categories = await prisma.category.createMany({
      data: [
        { name: 'Discord Bots', slug: 'discord-bots', icon: '🎮', description: 'Custom Discord bot development', isBotAllowed: true },
        { name: 'Telegram Bots', slug: 'telegram-bots', icon: '✈️', description: 'Telegram bot automation', isBotAllowed: true },
        { name: 'WhatsApp Bots', slug: 'whatsapp-bots', icon: '💬', description: 'WhatsApp automation bots', isBotAllowed: true },
        { name: 'AI Agents', slug: 'ai-agents', icon: '🤖', description: 'AI agents and automation', isBotAllowed: true },
        { name: 'Web Development', slug: 'web-development', icon: '🌐', description: 'Full-stack web development', isBotAllowed: false, isHumanAllowed: true },
        { name: 'Mobile Apps', slug: 'mobile-apps', icon: '📱', description: 'iOS and Android development', isBotAllowed: false, isHumanAllowed: true },
        { name: 'Data Analysis', slug: 'data-analysis', icon: '📊', description: 'Data processing and analytics', isBotAllowed: false, isHumanAllowed: true },
        { name: 'Automation', slug: 'automation', icon: '⚙️', description: 'Workflow automation', isBotAllowed: true },
        { name: 'API Development', slug: 'api-development', icon: '🔌', description: 'REST and GraphQL APIs', isBotAllowed: true },
        { name: 'Chatbots', slug: 'chatbots', icon: '💭', description: 'AI-powered chatbots', isBotAllowed: true },
      ],
      skipDuplicates: true
    })
    
    const allCategories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json({ 
      categories: allCategories, 
      message: `Seeded ${categories.count} categories` 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
