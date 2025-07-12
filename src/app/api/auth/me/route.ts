import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { getDatabase } from '@/lib/mongodb'
import { User } from '@/models/User'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }
    
    const userSession = getUserFromToken(token)
    
    if (!userSession) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    
    const db = await getDatabase()
    const usersCollection = db.collection<User>('users')
    
    const user = await usersCollection.findOne(
      {
        _id: new ObjectId(userSession.id),
        $or: [
          { isActive: true },
          { isActive: { $exists: false } }
        ]
      },
      { projection: { password: 0 } }
    )
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
