const { MongoClient, ObjectId } = require('mongodb')

const MONGODB_URI = 'mongodb://localhost:27017/rewear'

async function addTestItems() {
  console.log('Adding test items for admin review...')
  
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db('rewear')
    const usersCollection = db.collection('users')
    const itemsCollection = db.collection('items')
    
    // Find a regular user to assign items to
    let user = await usersCollection.findOne({ role: 'user' })
    
    if (!user) {
      // Create a test user if none exists
      const testUser = {
        email: 'testuser@example.com',
        password: '$2a$12$MXE8jBhD7Q3xg9nSmphmNO/B8LTndX7f/1Zgm.13HDrSu7TDiklBS', // password: test123
        name: 'Test User',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const userResult = await usersCollection.insertOne(testUser)
      user = { ...testUser, _id: userResult.insertedId }
      console.log('Created test user')
    }
    
    // Create test items with different statuses
    const testItems = [
      {
        title: 'Vintage Denim Jacket - PENDING REVIEW',
        description: 'Beautiful vintage denim jacket in excellent condition. Perfect for casual wear.',
        category: 'outerwear',
        condition: 'good',
        size: 'M',
        brand: 'Levi\'s',
        originalPrice: 89.99,
        sellingPrice: 45.00,
        images: ['/placeholder-image.svg'],
        userId: user._id,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        tags: ['vintage', 'denim', 'casual']
      },
      {
        title: 'Summer Floral Dress - NEEDS APPROVAL',
        description: 'Light and airy summer dress with beautiful floral pattern. Worn only twice.',
        category: 'dresses',
        condition: 'like-new',
        size: 'S',
        brand: 'Zara',
        originalPrice: 59.99,
        sellingPrice: 30.00,
        images: ['/placeholder-image.svg'],
        userId: user._id,
        status: 'pending',
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 30),
        isActive: true,
        tags: ['floral', 'summer', 'dress']
      },
      {
        title: 'Designer Handbag - AWAITING REVIEW',
        description: 'Authentic designer handbag in mint condition. Comes with original dust bag.',
        category: 'accessories',
        condition: 'new',
        size: 'One Size',
        brand: 'Coach',
        originalPrice: 299.99,
        sellingPrice: 150.00,
        images: ['/placeholder-image.svg'],
        userId: user._id,
        status: 'pending',
        createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 60),
        isActive: true,
        tags: ['designer', 'handbag', 'luxury']
      },
      {
        title: 'Running Shoes - Already Approved',
        description: 'Comfortable running shoes, barely used. Great for daily workouts.',
        category: 'shoes',
        condition: 'good',
        size: '9',
        brand: 'Nike',
        originalPrice: 120.00,
        sellingPrice: 60.00,
        images: ['/placeholder-image.svg'],
        userId: user._id,
        status: 'approved',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        isActive: true,
        tags: ['running', 'shoes', 'nike']
      }
    ]
    
    // Insert test items
    const result = await itemsCollection.insertMany(testItems)
    console.log(`✅ Added ${result.insertedCount} test items`)
    
    // Show summary
    const pendingCount = await itemsCollection.countDocuments({ status: 'pending' })
    const approvedCount = await itemsCollection.countDocuments({ status: 'approved' })
    const totalCount = await itemsCollection.countDocuments({})
    
    console.log('\n📊 Current item statistics:')
    console.log(`- Pending items: ${pendingCount}`)
    console.log(`- Approved items: ${approvedCount}`)
    console.log(`- Total items: ${totalCount}`)
    
    console.log('\n🎉 Test items added successfully!')
    console.log('Now login as admin and check the admin dashboard.')
    
  } catch (error) {
    console.error('Error adding test items:', error)
  } finally {
    await client.close()
  }
}

addTestItems()
