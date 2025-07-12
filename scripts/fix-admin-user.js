const { MongoClient } = require('mongodb')
const bcrypt = require('bcryptjs')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rewear'

async function fixAdminUser() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db('rewear')
    const usersCollection = db.collection('users')
    
    // First, let's check the current admin user
    console.log('🔍 Checking current admin user...')
    const currentAdmin = await usersCollection.findOne({ email: 'admin@rewear.com' })
    
    if (currentAdmin) {
      console.log('📋 Current admin user details:')
      console.log('- ID:', currentAdmin._id)
      console.log('- Email:', currentAdmin.email)
      console.log('- Name:', currentAdmin.name)
      console.log('- Role:', currentAdmin.role)
      console.log('- isActive:', currentAdmin.isActive)
      console.log('- Password hash starts with:', currentAdmin.password?.substring(0, 10) + '...')
      console.log('')
    } else {
      console.log('❌ No admin user found!')
      return
    }
    
    // Test the password hash
    console.log('🔐 Testing password verification...')
    const testPassword = 'admin123'
    
    try {
      const isValidPassword = await bcrypt.compare(testPassword, currentAdmin.password)
      console.log('Password test result:', isValidPassword ? '✅ VALID' : '❌ INVALID')
    } catch (error) {
      console.log('❌ Password verification error:', error.message)
    }
    
    // Fix the admin user
    console.log('\n🔧 Fixing admin user...')
    
    const newPassword = 'admin123'
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    const result = await usersCollection.updateOne(
      { email: 'admin@rewear.com' },
      { 
        $set: { 
          password: hashedPassword,
          role: 'admin',
          isActive: true,
          updatedAt: new Date()
        }
      }
    )
    
    if (result.modifiedCount > 0) {
      console.log('✅ Admin user fixed successfully!')
    } else {
      console.log('ℹ️  Admin user was already correct')
    }
    
    // Verify the fix
    console.log('\n🧪 Verifying the fix...')
    const updatedAdmin = await usersCollection.findOne({ 
      email: 'admin@rewear.com',
      isActive: true 
    })
    
    if (updatedAdmin) {
      const finalPasswordTest = await bcrypt.compare('admin123', updatedAdmin.password)
      console.log('Final verification:', finalPasswordTest ? '✅ SUCCESS' : '❌ FAILED')
      
      console.log('\n🎉 Admin login credentials:')
      console.log('📧 Email: admin@rewear.com')
      console.log('🔑 Password: admin123')
      console.log('👤 Role:', updatedAdmin.role)
      console.log('🟢 Active:', updatedAdmin.isActive)
    } else {
      console.log('❌ Could not find updated admin user')
    }
    
  } catch (error) {
    console.error('Error fixing admin user:', error)
  } finally {
    await client.close()
  }
}

// Run the fix
fixAdminUser()
