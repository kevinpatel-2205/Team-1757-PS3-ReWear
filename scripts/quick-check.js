const { MongoClient } = require('mongodb')

async function quickCheck() {
  const client = new MongoClient('mongodb://localhost:27017/rewear')
  
  try {
    await client.connect()
    
    const db = client.db('rewear')
    
    // Check items
    const items = await db.collection('items').find({}).toArray()
    console.log(`Total items: ${items.length}`)
    
    if (items.length > 0) {
      items.forEach((item, i) => {
        console.log(`${i+1}. ${item.title} - ${item.status} - Active: ${item.isActive}`)
      })
    } else {
      console.log('No items found! Adding test item...')
      
      // Find a user
      const user = await db.collection('users').findOne({ role: 'user' }) || 
                   await db.collection('users').findOne({})
      
      if (user) {
        const testItem = {
          title: 'URGENT TEST ITEM',
          description: 'Test item to fix admin panel',
          category: 'tops',
          condition: 'good',
          size: 'M',
          brand: 'Test',
          sellingPrice: 25.00,
          images: ['/placeholder-image.svg'],
          userId: user._id,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        }
        
        await db.collection('items').insertOne(testItem)
        console.log('✅ Added test item')
      }
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.close()
  }
}

quickCheck()
