const { MongoClient } = require('mongodb')
const bcrypt = require('bcryptjs')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rewear'

async function resetAdminPassword() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db('rewear')
    const usersCollection = db.collection('users')
    
    // Hash the new password
    const newPassword = 'admin123'
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    // Update admin user password
    const result = await usersCollection.updateOne(
      { email: 'admin@rewear.com', role: 'admin' },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      }
    )
    
    if (result.matchedCount > 0) {
      console.log('✅ Admin password updated successfully!')
      console.log('📧 Email: admin@rewear.com')
      console.log('🔑 Password: admin123')
      console.log('')
      console.log('You can now login with these credentials.')
    } else {
      console.log('❌ Admin user not found!')
      console.log('💡 Run "npm run init-db" to create the admin user first.')
    }
    
  } catch (error) {
    console.error('Error resetting admin password:', error)
  } finally {
    await client.close()
  }
}

// Run the password reset
resetAdminPassword()
