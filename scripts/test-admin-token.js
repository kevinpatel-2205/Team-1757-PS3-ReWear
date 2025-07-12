const { MongoClient } = require('mongodb')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const MONGODB_URI = 'mongodb://localhost:27017/rewear'
const JWT_SECRET = 'your-super-secure-jwt-secret-key-change-this-in-production'

async function testAdminToken() {
  console.log('🧪 Testing admin token generation and verification...')
  
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
    
    // Test password
    const passwordTest = await bcrypt.compare('admin123', adminUser.password)
    console.log('🔐 Password test:', passwordTest ? '✅ VALID' : '❌ INVALID')
    
    if (!passwordTest) {
      console.log('❌ Password is incorrect, cannot proceed')
      return
    }
    
    // Generate token
    const payload = {
      id: adminUser._id.toString(),
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
    }
    
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
    console.log('🎫 Generated token:', token.substring(0, 50) + '...')
    
    // Verify token
    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      console.log('✅ Token verification successful')
      console.log('📋 Decoded payload:')
      console.log('- ID:', decoded.id)
      console.log('- Email:', decoded.email)
      console.log('- Role:', decoded.role)
      
      if (decoded.role === 'admin') {
        console.log('🎉 Admin role confirmed in token!')
      } else {
        console.log('❌ Admin role NOT found in token')
      }
      
    } catch (error) {
      console.log('❌ Token verification failed:', error.message)
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.close()
  }
}

testAdminToken()
