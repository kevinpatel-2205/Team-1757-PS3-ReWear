import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { verifyPassword, generateToken } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'
import { User } from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = loginSchema.parse(body)
    
    const db = await getDatabase()
    const usersCollection = db.collection<User>('users')
    
    // Find user (handle missing isActive field)
    const user = await usersCollection.findOne({
      email: validatedData.email,
      $or: [
        { isActive: true },
        { isActive: { $exists: false } }
      ]
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(validatedData.password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Generate token
    const token = generateToken(user)
    
    // Set cookie
    const response = NextResponse.json(
      { 
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
      { status: 200 }
    )
    
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
