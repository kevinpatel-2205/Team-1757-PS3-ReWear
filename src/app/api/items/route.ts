import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { getUserFromToken } from '@/lib/auth'
import { createItemSchema } from '@/lib/validations'
import { Item, ItemWithUser } from '@/models/Item'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    // Only filter by status if explicitly requested
    // No default status filtering
    const category = searchParams.get('category')
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    // Debug logging
    console.log('Items API - Query params:', {
      status,
      category,
      userId,
      page,
      limit
    })
    
    const db = await getDatabase()
    const itemsCollection = db.collection<Item>('items')
    
    // Build query
    const query: any = { isActive: true }

    if (status) {
      query.status = status
    }
    
    if (category) {
      query.category = category
    }
    
    if (userId) {
      query.userId = new ObjectId(userId)
      console.log('Items API - Filtering by userId:', userId)
    }
    
    // Get items with user information
    const items = await itemsCollection.aggregate<ItemWithUser>([
      { $match: query },
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
      { $unwind: '$user' },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]).toArray()
    
    // Get total count for pagination
    const total = await itemsCollection.countDocuments(query)

    console.log('📊 Items API - Results:', {
      itemsFound: items.length,
      total,
      query,
      itemStatuses: items.map(item => ({ title: item.title, status: item.status }))
    })

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get items error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📦 POST /api/items - Creating new item...')

    const token = request.cookies.get('token')?.value
    const user = token ? getUserFromToken(token) : null

    console.log('🔐 User from token:', user ? { id: user.id, email: user.email } : 'null')

    if (!user) {
      console.log('❌ No user found, authentication required')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('📝 Request body received:', { ...body, images: `${body.images?.length || 0} images` })

    const validatedData = createItemSchema.parse(body)
    console.log('✅ Data validation successful')
    
    const db = await getDatabase()
    const itemsCollection = db.collection<Item>('items')
    
    const newItem: Item = {
      ...validatedData,
      userId: new ObjectId(user.id),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    }

    console.log('💾 Inserting item into database:', {
      title: newItem.title,
      userId: newItem.userId,
      status: newItem.status
    })

    const result = await itemsCollection.insertOne(newItem)

    console.log('✅ Item created successfully with ID:', result.insertedId)

    return NextResponse.json(
      {
        message: 'Item created successfully',
        itemId: result.insertedId,
        item: { ...newItem, _id: result.insertedId }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create item error:', error)
    
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
