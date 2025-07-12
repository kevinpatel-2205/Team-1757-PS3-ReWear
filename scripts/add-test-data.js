const { MongoClient, ObjectId } = require('mongodb')

async function addTestData() {
  const client = new MongoClient('mongodb://localhost:27017/rewear')
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db('rewear')
    
    // Create test user if doesn't exist
    let testUser = await db.collection('users').findOne({ email: 'test2@example.com' })
    
    if (!testUser) {
      const newUser = {
        email: 'test2@example.com',
        password: '$2a$12$MXE8jBhD7Q3xg9nSmphmNO/B8LTndX7f/1Zgm.13HDrSu7TDiklBS', // password: test123
        name: 'Test User 2',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const result = await db.collection('users').insertOne(newUser)
      testUser = { ...newUser, _id: result.insertedId }
      console.log('✅ Created test user: test2@example.com')
    } else {
      console.log('✅ Test user already exists: test2@example.com')
    }
    
    // Add test items with different statuses
    const testItems = [
      {
        title: 'Test Item 1 - Pending Review',
        description: 'This is a test item that needs admin approval.',
        category: 'tops',
        condition: 'good',
        size: 'M',
        brand: 'Test Brand',
        sellingPrice: 25.00,
        images: ['/placeholder-image.svg'],
        userId: testUser._id,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        title: 'Test Item 2 - Also Pending',
        description: 'Another test item waiting for approval.',
        category: 'bottoms',
        condition: 'like-new',
        size: 'L',
        brand: 'Another Brand',
        sellingPrice: 35.00,
        images: ['/placeholder-image.svg'],
        userId: testUser._id,
        status: 'pending',
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 30),
        isActive: true
      },
      {
        title: 'Test Item 3 - Approved',
        description: 'This item has been approved by admin.',
        category: 'dresses',
        condition: 'good',
        size: 'S',
        brand: 'Approved Brand',
        sellingPrice: 45.00,
        images: ['/placeholder-image.svg'],
        userId: testUser._id,
        status: 'approved',
        createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 60),
        isActive: true
      }
    ]
    
    // Insert test items
    const result = await db.collection('items').insertMany(testItems)
    console.log(`✅ Added ${result.insertedCount} test items`)
    
    // Show current statistics
    const stats = await db.collection('items').aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray()
    
    console.log('\n📊 Current item statistics:')
    stats.forEach(s => console.log(`- ${s._id}: ${s.count}`))
    
    // Show items for test user
    const userItems = await db.collection('items').find({ userId: testUser._id }).toArray()
    console.log(`\n👤 Items for test2@example.com: ${userItems.length}`)
    userItems.forEach(item => {
      console.log(`  - ${item.title} (${item.status})`)
    })
    
    console.log('\n🎉 Test data added successfully!')
    console.log('\nNow you can:')
    console.log('1. Login as test2@example.com / test123')
    console.log('2. Check profile to see your items')
    console.log('3. Login as admin to approve/reject items')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.close()
  }
}

addTestData()
