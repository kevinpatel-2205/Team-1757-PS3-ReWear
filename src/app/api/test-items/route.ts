import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 TEST API: Checking database items...')
    
    const db = await getDatabase()
    const itemsCollection = db.collection('items')
    
    // Get all items without any filters
    const allItems = await itemsCollection.find({}).toArray()
    console.log('🧪 TEST API: Found', allItems.length, 'total items')
    
    // Get active items
    const activeItems = await itemsCollection.find({ isActive: true }).toArray()
    console.log('🧪 TEST API: Found', activeItems.length, 'active items')
    
    // Get pending items
    const pendingItems = await itemsCollection.find({ status: 'pending' }).toArray()
    console.log('🧪 TEST API: Found', pendingItems.length, 'pending items')
    
    // Get approved items
    const approvedItems = await itemsCollection.find({ status: 'approved' }).toArray()
    console.log('🧪 TEST API: Found', approvedItems.length, 'approved items')
    
    const summary = {
      total: allItems.length,
      active: activeItems.length,
      pending: pendingItems.length,
      approved: approvedItems.length,
      items: allItems.map(item => ({
        id: item._id,
        title: item.title,
        status: item.status,
        isActive: item.isActive,
        userId: item.userId
      }))
    }
    
    console.log('🧪 TEST API: Summary:', summary)
    
    return NextResponse.json(summary)
    
  } catch (error) {
    console.error('🧪 TEST API: Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch test data', details: error.message },
      { status: 500 }
    )
  }
}
