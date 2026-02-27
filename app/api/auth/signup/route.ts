import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { email, password, username, fullName, userType } = await request.json()
    
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    })
    if (existing) {
      return NextResponse.json({ error: 'Email or username already exists' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, username, fullName, userType: userType || 'SELLER', passwordHash }
    })

    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')
    return NextResponse.json({ user: { id: user.id, email: user.email, username: user.username }, token })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
