import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { getUserFromToken } from '@/lib/auth'
import { Item } from '@/models/Item'
import { ObjectId } from 'mongodb'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value
    const user = token ? getUserFromToken(token) : null
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      )
    }
    
    const db = await getDatabase()
    const itemsCollection = db.collection<Item>('items')
    
    const result = await itemsCollection.updateOne(
      { _id: new ObjectId(params.id), isActive: true },
      { 
        $set: { 
          status: 'approved',
          updatedAt: new Date(),
          $unset: { rejectionReason: "" }
        }
      }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Item approved successfully' })
  } catch (error) {
    console.error('Approve item error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
