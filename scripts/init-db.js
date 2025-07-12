const { MongoClient } = require('mongodb')
const bcrypt = require('bcryptjs')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rewear'

async function initializeDatabase() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db('rewear')
    
    // Create collections
    const collections = ['users', 'items']
    
    for (const collectionName of collections) {
      const exists = await db.listCollections({ name: collectionName }).hasNext()
      if (!exists) {
        await db.createCollection(collectionName)
        console.log(`Created collection: ${collectionName}`)
      }
    }
    
    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true })
    await db.collection('items').createIndex({ userId: 1 })
    await db.collection('items').createIndex({ status: 1 })
    await db.collection('items').createIndex({ category: 1 })
    await db.collection('items').createIndex({ createdAt: -1 })
    
    console.log('Created database indexes')
    
    // Create admin user if it doesn't exist
    const adminEmail = 'admin@rewear.com'
    const existingAdmin = await db.collection('users').findOne({ email: adminEmail })
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      await db.collection('users').insertOne({
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      })
      
      console.log('Created admin user:')
      console.log('Email: admin@rewear.com')
      console.log('Password: admin123')
      console.log('Please change the password after first login!')
    }
    
    // Create sample user if it doesn't exist
    const userEmail = 'user@example.com'
    const existingUser = await db.collection('users').findOne({ email: userEmail })
    
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('user123', 12)
      
      const userResult = await db.collection('users').insertOne({
        email: userEmail,
        password: hashedPassword,
        name: 'Sample User',
        role: 'user',
        phone: '+1234567890',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          country: 'USA',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      })
      
      // Create sample items
      const sampleItems = [
        {
          title: 'Vintage Denim Jacket',
          description: 'Classic blue denim jacket in excellent condition. Perfect for layering.',
          category: 'outerwear',
          condition: 'good',
          size: 'M',
          brand: 'Levi\'s',
          originalPrice: 89.99,
          sellingPrice: 45.00,
          images: ['/placeholder-image.svg'],
          userId: userResult.insertedId,
          status: 'approved',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          tags: ['vintage', 'denim', 'casual'],
        },
        {
          title: 'Floral Summer Dress',
          description: 'Beautiful floral print dress, perfect for summer occasions.',
          category: 'dresses',
          condition: 'like-new',
          size: 'S',
          brand: 'Zara',
          originalPrice: 59.99,
          sellingPrice: 30.00,
          images: ['/placeholder-image.svg'],
          userId: userResult.insertedId,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          tags: ['floral', 'summer', 'casual'],
        },
        {
          title: 'Black Leather Boots',
          description: 'Stylish black leather ankle boots with minimal wear.',
          category: 'shoes',
          condition: 'good',
          size: '8',
          brand: 'Dr. Martens',
          originalPrice: 150.00,
          sellingPrice: 75.00,
          images: ['/placeholder-image.svg'],
          userId: userResult.insertedId,
          status: 'approved',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          tags: ['leather', 'boots', 'black'],
        },
      ]
      
      await db.collection('items').insertMany(sampleItems)
      
      console.log('Created sample user and items:')
      console.log('Email: user@example.com')
      console.log('Password: user123')
    }
    
    console.log('Database initialization completed successfully!')
    
  } catch (error) {
    console.error('Error initializing database:', error)
  } finally {
    await client.close()
  }
}

// Run the initialization
initializeDatabase()
