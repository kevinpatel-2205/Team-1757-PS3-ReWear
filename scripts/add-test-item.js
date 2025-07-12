const { MongoClient, ObjectId } = require('mongodb')

async function addTestItem() {
  const client = new MongoClient('mongodb://localhost:27017/rewear')
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db('rewear')
    
    // Find a user to assign the item to
    let user = await db.collection('users').findOne({ role: 'user' })
    
    if (!user) {
      // Create a test user
      const newUser = {
        email: 'testuser@example.com',
        password: '$2a$12$MXE8jBhD7Q3xg9nSmphmNO/B8LTndX7f/1Zgm.13HDrSu7TDiklBS',
        name: 'Test User',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const result = await db.collection('users').insertOne(newUser)
      user = { ...newUser, _id: result.insertedId }
      console.log('✅ Created test user')
    }
    
    // Add a test item
    const testItem = {
      title: 'TEST ITEM - Please Approve',
      description: 'This is a test item created directly in the database to test the admin panel.',
      category: 'tops',
      condition: 'good',
      size: 'M',
      brand: 'Test Brand',
      originalPrice: 50.00,
      sellingPrice: 25.00,
      images: ['/placeholder-image.svg'],
      userId: user._id,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      tags: ['test', 'admin', 'pending']
    }
    
    const result = await db.collection('items').insertOne(testItem)
    console.log('✅ Added test item with ID:', result.insertedId)
    
    // Verify the item was added
    const addedItem = await db.collection('items').findOne({ _id: result.insertedId })
    console.log('📦 Added item details:')
    console.log('- Title:', addedItem.title)
    console.log('- Status:', addedItem.status)
    console.log('- User ID:', addedItem.userId)
    console.log('- Active:', addedItem.isActive)
    
    // Check total counts
    const totalItems = await db.collection('items').countDocuments({})
    const pendingItems = await db.collection('items').countDocuments({ status: 'pending' })
    const approvedItems = await db.collection('items').countDocuments({ status: 'approved' })
    
    console.log('\n📊 Database totals:')
    console.log('- Total items:', totalItems)
    console.log('- Pending items:', pendingItems)
    console.log('- Approved items:', approvedItems)
    
    console.log('\n🎉 Test item added successfully!')
    console.log('Now check the admin panel to see if it appears.')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.close()
  }
}

addTestItem()
