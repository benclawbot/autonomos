import { NextResponse } from 'next/server'

// Force dynamic
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'API is working!',
    timestamp: new Date().toISOString()
  })
}
