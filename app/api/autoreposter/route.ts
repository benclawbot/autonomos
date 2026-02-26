import { NextResponse } from 'next/server'

// Twitter API v2 integration
const TWITTER_API = 'https://api.twitter.com/2'

// Lazy Twitter client
const getTwitterClient = () => {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN
  return {
    async postTweet(text: string) {
      const response = await fetch(`${TWITTER_API}/tweets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })
      return response.json()
    }
  }
}

export async function POST(request: Request) {
  try {
    const { content, platforms, scheduledAt } = await request.json()

    const results: any = {}

    // Post to Twitter
    if (platforms.twitter) {
      const twitter = getTwitterClient()
      
      if (scheduledAt) {
        // Store for later (in production, use a job queue)
        results.twitter = { status: 'scheduled', scheduledAt }
      } else {
        const tweet = await twitter.postTweet(content.slice(0, 280))
        results.twitter = { status: 'posted', id: tweet.data?.id }
      }
    }

    // Post to LinkedIn (would need OAuth)
    if (platforms.linkedin) {
      results.linkedin = { status: 'coming_soon' }
    }

    // Post to Instagram (would need Facebook Graph API)
    if (platforms.instagram) {
      results.instagram = { status: 'coming_soon' }
    }

    return NextResponse.json({ results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  // Get scheduled posts
  return NextResponse.json({
    posts: [
      // In production, fetch from database
    ]
  })
}
