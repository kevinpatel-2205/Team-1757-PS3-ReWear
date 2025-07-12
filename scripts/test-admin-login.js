const { MongoClient } = require('mongodb')
const bcrypt = require('bcryptjs')

// Use the same URI as in the .env.local file
const MONGODB_URI = 'mongodb://localhost:27017/rewear'

async function testAdminLogin() {
  console.log('🔍 Testing admin login...')
  console.log('MongoDB URI:', MONGODB_URI)
  
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db('rewear')
    const usersCollection = db.collection('users')
    
    // Find admin user
    const adminUser = await usersCollection.findOne({ 
      email: 'admin@rewear.com'
    })
    
    if (!adminUser) {
      console.log('❌ Admin user not found!')
      return
    }
    
    console.log('📋 Admin user found:')
    console.log('- Email:', adminUser.email)
    console.log('- Role:', adminUser.role)
    console.log('- isActive:', adminUser.isActive)
    console.log('- Has password:', !!adminUser.password)
    
    // Test password
    const testPassword = 'admin123'
    console.log('\n🔐 Testing password "admin123"...')
    
    try {
      const isValid = await bcrypt.compare(testPassword, adminUser.password)
      console.log('Password verification:', isValid ? '✅ VALID' : '❌ INVALID')
      
      if (!isValid) {
        console.log('\n🔧 Fixing password...')
        const newHashedPassword = await bcrypt.hash('admin123', 12)
        
        await usersCollection.updateOne(
          { email: 'admin@rewear.com' },
          { 
            $set: { 
              password: newHashedPassword,
              isActive: true,
              updatedAt: new Date()
            }
          }
        )
        
        console.log('✅ Password updated!')
      }
      
    } catch (error) {
      console.log('❌ Password verification error:', error.message)
    }
    
    // Final verification
    console.log('\n🧪 Final verification...')
    const updatedUser = await usersCollection.findOne({ 
      email: 'admin@rewear.com',
      isActive: true 
    })
    
    if (updatedUser) {
      const finalTest = await bcrypt.compare('admin123', updatedUser.password)
      console.log('Final password test:', finalTest ? '✅ SUCCESS' : '❌ FAILED')
      
      if (finalTest) {
        console.log('\n🎉 Admin login should work now!')
        console.log('📧 Email: admin@rewear.com')
        console.log('🔑 Password: admin123')
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.close()
    console.log('🔌 Disconnected from MongoDB')
  }
}

testAdminLogin().catch(console.error)
