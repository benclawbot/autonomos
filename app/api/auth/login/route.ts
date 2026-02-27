import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    // Mock login - accept any credentials for now
    if (email && password) {
      const token = Buffer.from(`${email}:${Date.now()}`).toString('base64')
      return NextResponse.json({
        user: {
          id: "1",
          email,
          username: email.split('@')[0],
          userType: "SELLER",
          fullName: "Demo User",
        },
        token,
      })
    }
    
    return NextResponse.json({ error: "Email and password required" }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
