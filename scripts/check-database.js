const { MongoClient } = require('mongodb')

async function checkDatabase() {
  const client = new MongoClient('mongodb://localhost:27017/rewear')
  
  try {
    await client.connect()
    console.log('🔍 Checking database contents...\n')
    
    const db = client.db('rewear')
    
    // Check users
    console.log('👥 USERS:')
    const users = await db.collection('users').find({}, { password: 0 }).toArray()
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Active: ${user.isActive}`)
    })
    
    // Check items
    console.log('\n📦 ITEMS:')
    const items = await db.collection('items').find({}).toArray()
    console.log(`Total items in database: ${items.length}`)
    
    if (items.length > 0) {
      console.log('\nItem details:')
      items.forEach((item, index) => {
        const user = users.find(u => u._id.toString() === item.userId.toString())
        console.log(`${index + 1}. "${item.title}"`)
        console.log(`   - Status: ${item.status}`)
        console.log(`   - Owner: ${user ? user.email : 'Unknown'}`)
        console.log(`   - Created: ${item.createdAt}`)
        console.log(`   - Active: ${item.isActive}`)
        console.log('')
      })
      
      // Group by status
      console.log('📊 Items by status:')
      const statusCounts = {}
      items.forEach(item => {
        statusCounts[item.status] = (statusCounts[item.status] || 0) + 1
      })
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`- ${status}: ${count}`)
      })
      
      // Group by user
      console.log('\n👤 Items by user:')
      const userCounts = {}
      items.forEach(item => {
        const user = users.find(u => u._id.toString() === item.userId.toString())
        const userEmail = user ? user.email : 'Unknown'
        userCounts[userEmail] = (userCounts[userEmail] || 0) + 1
      })
      Object.entries(userCounts).forEach(([email, count]) => {
        console.log(`- ${email}: ${count}`)
      })
      
    } else {
      console.log('No items found in database!')
    }
    
    // Check for any issues
    console.log('\n🔍 POTENTIAL ISSUES:')
    
    // Check for items without users
    const orphanItems = items.filter(item => {
      return !users.find(u => u._id.toString() === item.userId.toString())
    })
    if (orphanItems.length > 0) {
      console.log(`❌ Found ${orphanItems.length} items without valid users`)
    }
    
    // Check for inactive items
    const inactiveItems = items.filter(item => !item.isActive)
    if (inactiveItems.length > 0) {
      console.log(`⚠️  Found ${inactiveItems.length} inactive items`)
    }
    
    // Check for items without status
    const noStatusItems = items.filter(item => !item.status)
    if (noStatusItems.length > 0) {
      console.log(`❌ Found ${noStatusItems.length} items without status`)
    }
    
    if (orphanItems.length === 0 && inactiveItems.length === 0 && noStatusItems.length === 0) {
      console.log('✅ No issues found!')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.close()
  }
}

checkDatabase()
