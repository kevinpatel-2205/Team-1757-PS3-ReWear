import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { getUserFromToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    const user = token ? getUserFromToken(token) : null
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const db = await getDatabase()
    const wishlistCollection = db.collection('wishlist')
    
    // Get user's wishlist items with item details
    const wishlistItems = await wishlistCollection.aggregate([
      { $match: { userId: new ObjectId(user.id) } },
      {
        $lookup: {
          from: 'items',
          localField: 'itemId',
          foreignField: '_id',
          as: 'item'
        }
      },
      { $unwind: '$item' },
      {
        $lookup: {
          from: 'users',
          localField: 'item.userId',
          foreignField: '_id',
          as: 'item.user',
          pipeline: [
            { $project: { password: 0 } }
          ]
        }
      },
      { $unwind: '$item.user' },
      { $sort: { createdAt: -1 } }
    ]).toArray()
    
    return NextResponse.json({ items: wishlistItems })
    
  } catch (error) {
    console.error('Get wishlist error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    const user = token ? getUserFromToken(token) : null
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { itemId } = await request.json()
    
    if (!ObjectId.isValid(itemId)) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      )
    }
    
    const db = await getDatabase()
    const wishlistCollection = db.collection('wishlist')
    const itemsCollection = db.collection('items')
    
    // Check if item exists
    const item = await itemsCollection.findOne({ 
      _id: new ObjectId(itemId),
      isActive: true 
    })
    
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }
    
    // Check if already in wishlist
    const existingWishlistItem = await wishlistCollection.findOne({
      userId: new ObjectId(user.id),
      itemId: new ObjectId(itemId)
    })
    
    if (existingWishlistItem) {
      return NextResponse.json(
        { error: 'Item already in wishlist' },
        { status: 400 }
      )
    }
    
    // Add to wishlist
    await wishlistCollection.insertOne({
      userId: new ObjectId(user.id),
      itemId: new ObjectId(itemId),
      createdAt: new Date()
    })
    
    return NextResponse.json({ message: 'Item added to wishlist' })
    
  } catch (error) {
    console.error('Add to wishlist error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    const user = token ? getUserFromToken(token) : null
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')
    
    if (!itemId || !ObjectId.isValid(itemId)) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      )
    }
    
    const db = await getDatabase()
    const wishlistCollection = db.collection('wishlist')
    
    // Remove from wishlist
    const result = await wishlistCollection.deleteOne({
      userId: new ObjectId(user.id),
      itemId: new ObjectId(itemId)
    })
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Item not found in wishlist' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Item removed from wishlist' })
    
  } catch (error) {
    console.error('Remove from wishlist error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
