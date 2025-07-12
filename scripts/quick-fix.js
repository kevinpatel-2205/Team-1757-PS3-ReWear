const { MongoClient, ObjectId } = require('mongodb')

async function quickFix() {
  const client = new MongoClient('mongodb://localhost:27017/rewear')
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db('rewear')
    
    // 1. Fix admin user - ensure isActive is true
    await db.collection('users').updateOne(
      { email: 'admin@rewear.com' },
      { $set: { isActive: true } }
    )
    console.log('✅ Fixed admin user')
    
    // 2. Create a regular user if doesn't exist
    const regularUser = await db.collection('users').findOne({ role: 'user' })
    if (!regularUser) {
      const newUser = {
        email: 'seller@example.com',
        password: '$2a$12$MXE8jBhD7Q3xg9nSmphmNO/B8LTndX7f/1Zgm.13HDrSu7TDiklBS',
        name: 'Fashion Seller',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      await db.collection('users').insertOne(newUser)
      console.log('✅ Created regular user')
    }
    
    // 3. Move admin-owned items to regular user
    const admin = await db.collection('users').findOne({ role: 'admin' })
    const user = await db.collection('users').findOne({ role: 'user' })
    
    if (admin && user) {
      const result = await db.collection('items').updateMany(
        { userId: admin._id },
        { $set: { userId: user._id } }
      )
      console.log(`✅ Moved ${result.modifiedCount} items from admin to user`)
    }
    
    // 4. Add some pending items for admin to review
    const pendingItems = [
      {
        title: 'Vintage Leather Jacket - NEEDS APPROVAL',
        description: 'Authentic vintage leather jacket in excellent condition.',
        category: 'outerwear',
        condition: 'good',
        size: 'L',
        brand: 'Vintage',
        sellingPrice: 85.00,
        images: ['/placeholder-image.svg'],
        userId: user._id,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        title: 'Designer Handbag - AWAITING REVIEW',
        description: 'Beautiful designer handbag, barely used.',
        category: 'accessories',
        condition: 'like-new',
        size: 'One Size',
        brand: 'Designer',
        sellingPrice: 120.00,
        images: ['/placeholder-image.svg'],
        userId: user._id,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      }
    ]
    
    await db.collection('items').insertMany(pendingItems)
    console.log('✅ Added pending items for review')
    
    // Show stats
    const stats = await db.collection('items').aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray()
    
    console.log('\n📊 Item statistics:')
    stats.forEach(s => console.log(`- ${s._id}: ${s.count}`))
    
    console.log('\n🎉 Quick fix completed!')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.close()
  }
}

quickFix()
