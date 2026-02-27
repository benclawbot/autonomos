import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password, username, fullName, userType } = await request.json()
    
    // Mock signup
    if (email && password && username) {
      const token = Buffer.from(`${email}:${Date.now()}`).toString('base64')
      return NextResponse.json({
        user: {
          id: Date.now().toString(),
          email,
          username,
          userType: userType || "SELLER",
          fullName: fullName || username,
        },
        token,
      })
    }
    
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
