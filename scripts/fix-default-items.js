const { MongoClient, ObjectId } = require('mongodb')

const MONGODB_URI = 'mongodb://localhost:27017/rewear'

async function fixDefaultItems() {
  console.log('🔧 Fixing default items ownership...')
  
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db('rewear')
    const usersCollection = db.collection('users')
    const itemsCollection = db.collection('items')
    
    // Find admin user
    const adminUser = await usersCollection.findOne({ role: 'admin' })
    if (!adminUser) {
      console.log('❌ Admin user not found')
      return
    }
    
    // Find or create a regular user
    let regularUser = await usersCollection.findOne({ role: 'user' })
    
    if (!regularUser) {
      console.log('📝 Creating regular user...')
      const newUser = {
        email: 'seller@example.com',
        password: '$2a$12$MXE8jBhD7Q3xg9nSmphmNO/B8LTndX7f/1Zgm.13HDrSu7TDiklBS', // password: user123
        name: 'Fashion Seller',
        role: 'user',
        phone: '+1234567890',
        address: {
          street: '456 Fashion St',
          city: 'Style City',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const result = await usersCollection.insertOne(newUser)
      regularUser = { ...newUser, _id: result.insertedId }
      console.log('✅ Created regular user:', regularUser.email)
    }
    
    // Find items owned by admin
    const adminItems = await itemsCollection.find({ userId: adminUser._id }).toArray()
    console.log(`📦 Found ${adminItems.length} items owned by admin`)
    
    if (adminItems.length > 0) {
      // Update items to be owned by regular user
      const updateResult = await itemsCollection.updateMany(
        { userId: adminUser._id },
        { 
          $set: { 
            userId: regularUser._id,
            updatedAt: new Date()
          }
        }
      )
      
      console.log(`✅ Updated ${updateResult.modifiedCount} items to be owned by regular user`)
    }
    
    // Show current item statistics
    const itemStats = await itemsCollection.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user.role',
          count: { $sum: 1 }
        }
      }
    ]).toArray()
    
    console.log('\n📊 Current item ownership:')
    itemStats.forEach(stat => {
      console.log(`- ${stat._id}: ${stat.count} items`)
    })
    
    // Show items by status
    const statusStats = await itemsCollection.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray()
    
    console.log('\n📈 Items by status:')
    statusStats.forEach(stat => {
      console.log(`- ${stat._id}: ${stat.count} items`)
    })
    
    console.log('\n🎉 Default items ownership fixed!')
    console.log('Now all items are owned by regular users, not admin.')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.close()
  }
}

fixDefaultItems()
