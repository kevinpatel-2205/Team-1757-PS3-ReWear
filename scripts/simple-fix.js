console.log('Starting admin fix...')

const { MongoClient } = require('mongodb')

async function fixAdmin() {
  const client = new MongoClient('mongodb://localhost:27017/rewear')
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db('rewear')
    
    // Update admin user to ensure isActive is true
    const result = await db.collection('users').updateOne(
      { email: 'admin@rewear.com' },
      { 
        $set: { 
          isActive: true,
          updatedAt: new Date()
        }
      }
    )
    
    console.log('Update result:', result.modifiedCount, 'documents modified')
    
    // Verify the update
    const admin = await db.collection('users').findOne({ 
      email: 'admin@rewear.com' 
    })
    
    console.log('Admin user after update:')
    console.log('- Email:', admin?.email)
    console.log('- Role:', admin?.role)
    console.log('- isActive:', admin?.isActive)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.close()
  }
}

fixAdmin()
