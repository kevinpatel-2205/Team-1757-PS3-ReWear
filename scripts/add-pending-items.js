const { MongoClient, ObjectId } = require('mongodb')

async function addPendingItems() {
  const client = new MongoClient('mongodb://localhost:27017/rewear')
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db('rewear')
    
    // Find or create a test user
    let user = await db.collection('users').findOne({ role: 'user' })
    
    if (!user) {
      const newUser = {
        email: 'fashionseller@example.com',
        password: '$2a$12$MXE8jBhD7Q3xg9nSmphmNO/B8LTndX7f/1Zgm.13HDrSu7TDiklBS',
        name: 'Fashion Seller',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const result = await db.collection('users').insertOne(newUser)
      user = { ...newUser, _id: result.insertedId }
      console.log('✅ Created test user')
    }
    
    // Add multiple pending items
    const pendingItems = [
      {
        title: 'Vintage Denim Jacket - NEEDS APPROVAL',
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
        title: 'Summer Floral Dress - AWAITING REVIEW',
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
        title: 'Designer Handbag - PENDING APPROVAL',
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
        title: 'Casual T-Shirt - NEEDS REVIEW',
        description: 'Comfortable cotton t-shirt, barely worn. Great for everyday use.',
        category: 'tops',
        condition: 'good',
        size: 'L',
        brand: 'H&M',
        originalPrice: 19.99,
        sellingPrice: 10.00,
        images: ['/placeholder-image.svg'],
        userId: user._id,
        status: 'pending',
        createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 15),
        isActive: true,
        tags: ['casual', 'cotton', 'everyday']
      },
      {
        title: 'Running Shoes - ALREADY APPROVED',
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
    
    // Insert items
    const result = await db.collection('items').insertMany(pendingItems)
    console.log(`✅ Added ${result.insertedCount} items`)
    
    // Show summary
    const pendingCount = await db.collection('items').countDocuments({ status: 'pending' })
    const approvedCount = await db.collection('items').countDocuments({ status: 'approved' })
    const totalCount = await db.collection('items').countDocuments({})
    
    console.log('\n📊 Current item statistics:')
    console.log(`- Pending items: ${pendingCount}`)
    console.log(`- Approved items: ${approvedCount}`)
    console.log(`- Total items: ${totalCount}`)
    
    console.log('\n🎉 Pending items added successfully!')
    console.log('Now login as admin and check the admin dashboard.')
    console.log('You should see pending items that need approval!')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.close()
  }
}

addPendingItems()
