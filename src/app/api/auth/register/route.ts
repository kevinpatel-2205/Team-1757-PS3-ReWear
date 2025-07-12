import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { hashPassword, generateToken } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'
import { User } from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    
    const db = await getDatabase()
    const usersCollection = db.collection<User>('users')
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: validatedData.email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)
    
    // Create user
    const newUser: User = {
      email: validatedData.email,
      password: hashedPassword,
      name: validatedData.name,
      role: 'user',
      phone: validatedData.phone,
      address: validatedData.address,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    }
    
    const result = await usersCollection.insertOne(newUser)
    
    // Generate token
    const userWithId = { ...newUser, _id: result.insertedId }
    const token = generateToken(userWithId)
    
    // Set cookie
    const response = NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: result.insertedId,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        }
      },
      { status: 201 }
    )
    
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    
    return response
  } catch (error) {
    console.error('Registration error:', error)
    
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
