import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { getUserFromToken } from '@/lib/auth'
import { updateItemSchema } from '@/lib/validations'
import { Item, ItemWithUser } from '@/models/Item'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase()
    const itemsCollection = db.collection<Item>('items')
    
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      )
    }
    
    const item = await itemsCollection.aggregate<ItemWithUser>([
      { $match: { _id: new ObjectId(params.id), isActive: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
          pipeline: [
            { $project: { password: 0 } }
          ]
        }
      },
      { $unwind: '$user' }
    ]).toArray()
    
    if (item.length === 0) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ item: item[0] })
  } catch (error) {
    console.error('Get item error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value
    const user = token ? getUserFromToken(token) : null
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const validatedData = updateItemSchema.parse(body)
    
    const db = await getDatabase()
    const itemsCollection = db.collection<Item>('items')
    
    // Check if item exists and user owns it
    const existingItem = await itemsCollection.findOne({
      _id: new ObjectId(params.id),
      isActive: true
    })
    
    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }
    
    // Only allow owner or admin to update
    if (existingItem.userId.toString() !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized to update this item' },
        { status: 403 }
      )
    }
    
    const updateData = {
      ...validatedData,
      updatedAt: new Date(),
      // Reset status to pending if user updates item
      ...(user.role !== 'admin' && { status: 'pending' as const })
    }
    
    await itemsCollection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    )
    
    return NextResponse.json({ message: 'Item updated successfully' })
  } catch (error) {
    console.error('Update item error:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value
    const user = token ? getUserFromToken(token) : null
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
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
    
    // Check if item exists and user owns it
    const existingItem = await itemsCollection.findOne({
      _id: new ObjectId(params.id),
      isActive: true
    })
    
    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }
    
    // Only allow owner or admin to delete
    if (existingItem.userId.toString() !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized to delete this item' },
        { status: 403 }
      )
    }
    
    // Soft delete
    await itemsCollection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { isActive: false, updatedAt: new Date() } }
    )
    
    return NextResponse.json({ message: 'Item deleted successfully' })
  } catch (error) {
    console.error('Delete item error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
