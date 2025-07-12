const { MongoClient } = require('mongodb')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rewear'

async function testSetup() {
  console.log('🧪 Testing ReWear Application Setup...\n')
  
  // Test MongoDB connection
  console.log('1. Testing MongoDB connection...')
  try {
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log('   ✅ MongoDB connection successful')
    
    const db = client.db('rewear')
    
    // Check collections
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map(c => c.name)
    
    if (collectionNames.includes('users') && collectionNames.includes('items')) {
      console.log('   ✅ Required collections exist')
    } else {
      console.log('   ❌ Missing required collections. Run: npm run init-db')
    }
    
    // Check for admin user
    const adminUser = await db.collection('users').findOne({ role: 'admin' })
    if (adminUser) {
      console.log('   ✅ Admin user exists')
    } else {
      console.log('   ❌ Admin user not found. Run: npm run init-db')
    }
    
    // Check for sample data
    const itemCount = await db.collection('items').countDocuments()
    if (itemCount > 0) {
      console.log(`   ✅ Sample data exists (${itemCount} items)`)
    } else {
      console.log('   ⚠️  No sample data found. Run: npm run init-db')
    }
    
    await client.close()
  } catch (error) {
    console.log('   ❌ MongoDB connection failed:', error.message)
    console.log('   💡 Make sure MongoDB is running and the connection string is correct')
  }
  
  // Test environment variables
  console.log('\n2. Testing environment variables...')
  const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET']
  let envVarsOk = true
  
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`   ✅ ${envVar} is set`)
    } else {
      console.log(`   ❌ ${envVar} is missing`)
      envVarsOk = false
    }
  }
  
  if (!envVarsOk) {
    console.log('   💡 Create a .env.local file with the required environment variables')
  }
  
  // Test file structure
  console.log('\n3. Testing file structure...')
  const fs = require('fs')
  const path = require('path')
  
  const requiredFiles = [
    'package.json',
    'next.config.js',
    'tailwind.config.ts',
    'src/app/layout.tsx',
    'src/app/page.tsx',
    'src/lib/mongodb.ts',
    'src/models/User.ts',
    'src/models/Item.ts',
  ]
  
  let filesOk = true
  for (const file of requiredFiles) {
    if (fs.existsSync(path.join(process.cwd(), file))) {
      console.log(`   ✅ ${file} exists`)
    } else {
      console.log(`   ❌ ${file} is missing`)
      filesOk = false
    }
  }
  
  console.log('\n📋 Setup Summary:')
  console.log('================')
  
  if (envVarsOk && filesOk) {
    console.log('✅ Application setup looks good!')
    console.log('\n🚀 Next steps:')
    console.log('1. Run: npm install')
    console.log('2. Run: npm run init-db (if not done already)')
    console.log('3. Run: npm run dev')
    console.log('4. Open: http://localhost:3000')
    console.log('\n👤 Default accounts:')
    console.log('Admin: admin@rewear.com / admin123')
    console.log('User:  user@example.com / user123')
  } else {
    console.log('❌ Setup incomplete. Please fix the issues above.')
  }
}

// Run the test
testSetup().catch(console.error)
