const { MongoClient, ObjectId } = require('mongodb')

async function addClothingData() {
  const client = new MongoClient('mongodb://localhost:27017/rewear')
  
  try {
    await client.connect()
    console.log('🔗 Connected to MongoDB')
    
    const db = client.db('rewear')
    
    // Create sample users first
    const users = [
      {
        email: 'fashionista@example.com',
        password: '$2a$12$MXE8jBhD7Q3xg9nSmphmNO/B8LTndX7f/1Zgm.13HDrSu7TDiklBS',
        name: 'Emma Fashion',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'styleguru@example.com',
        password: '$2a$12$MXE8jBhD7Q3xg9nSmphmNO/B8LTndX7f/1Zgm.13HDrSu7TDiklBS',
        name: 'Alex Style',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'vintagelover@example.com',
        password: '$2a$12$MXE8jBhD7Q3xg9nSmphmNO/B8LTndX7f/1Zgm.13HDrSu7TDiklBS',
        name: 'Sarah Vintage',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    // Insert users
    const userResults = await db.collection('users').insertMany(users)
    const userIds = Object.values(userResults.insertedIds)
    console.log(`✅ Added ${userIds.length} users`)

    // Comprehensive clothing data
    const clothingItems = [
      // TOPS
      {
        title: 'Vintage Band T-Shirt - The Beatles',
        description: 'Authentic vintage Beatles t-shirt from the 80s. Soft cotton material with classic logo print. Perfect for music lovers and vintage collectors.',
        category: 'tops',
        condition: 'good',
        size: 'M',
        brand: 'Vintage',
        originalPrice: 45.00,
        sellingPrice: 28.00,
        images: ['/placeholder-image.svg'],
        userId: userIds[0],
        status: 'approved',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        isActive: true,
        tags: ['vintage', 'band', 'music', 'retro']
      },
      {
        title: 'Elegant Silk Blouse - Office Ready',
        description: 'Beautiful silk blouse in cream color. Perfect for professional settings or elegant occasions. Barely worn, excellent condition.',
        category: 'tops',
        condition: 'like-new',
        size: 'S',
        brand: 'Zara',
        originalPrice: 89.99,
        sellingPrice: 45.00,
        images: ['/placeholder-image.svg'],
        userId: userIds[1],
        status: 'pending',
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
        updatedAt: new Date(Date.now() - 1000 * 60 * 30),
        isActive: true,
        tags: ['silk', 'professional', 'elegant', 'office']
      },
      {
        title: 'Cozy Knit Sweater - Winter Essential',
        description: 'Warm and cozy knit sweater in forest green. Perfect for cold weather. Made from soft wool blend material.',
        category: 'tops',
        condition: 'good',
        size: 'L',
        brand: 'H&M',
        originalPrice: 59.99,
        sellingPrice: 25.00,
        images: ['/placeholder-image.svg'],
        userId: userIds[2],
        status: 'approved',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        isActive: true,
        tags: ['knit', 'winter', 'cozy', 'wool']
      },

      // BOTTOMS
      {
        title: 'Classic Blue Jeans - Levi\'s 501',
        description: 'Iconic Levi\'s 501 jeans in classic blue wash. Timeless style that never goes out of fashion. Comfortable fit with slight wear.',
        category: 'bottoms',
        condition: 'good',
        size: '32',
        brand: 'Levi\'s',
        originalPrice: 120.00,
        sellingPrice: 65.00,
        images: ['/placeholder-image.svg'],
        userId: userIds[0],
        status: 'approved',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        isActive: true,
        tags: ['jeans', 'classic', 'denim', 'casual']
      },
      {
        title: 'High-Waisted Black Trousers',
        description: 'Elegant high-waisted trousers in black. Perfect for business or formal occasions. Tailored fit with excellent drape.',
        category: 'bottoms',
        condition: 'like-new',
        size: '28',
        brand: 'Mango',
        originalPrice: 79.99,
        sellingPrice: 40.00,
        images: ['/placeholder-image.svg'],
        userId: userIds[1],
        status: 'pending',
        createdAt: new Date(Date.now() - 1000 * 60 * 45),
        updatedAt: new Date(Date.now() - 1000 * 60 * 45),
        isActive: true,
        tags: ['trousers', 'formal', 'business', 'elegant']
      },

      // DRESSES
      {
        title: 'Floral Summer Dress - Bohemian Style',
        description: 'Beautiful bohemian-style dress with floral print. Perfect for summer events, festivals, or casual outings. Flowing fabric and comfortable fit.',
        category: 'dresses',
        condition: 'good',
        size: 'M',
        brand: 'Free People',
        originalPrice: 150.00,
        sellingPrice: 75.00,
        images: ['/placeholder-image.svg'],
        userId: userIds[2],
        status: 'approved',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        isActive: true,
        tags: ['floral', 'bohemian', 'summer', 'festival']
      },
      {
        title: 'Little Black Dress - Cocktail Ready',
        description: 'Classic little black dress perfect for cocktail parties or dinner dates. Timeless design that flatters all body types.',
        category: 'dresses',
        condition: 'like-new',
        size: 'S',
        brand: 'ASOS',
        originalPrice: 95.00,
        sellingPrice: 50.00,
        images: ['/placeholder-image.svg'],
        userId: userIds[0],
        status: 'approved',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
        isActive: true,
        tags: ['black dress', 'cocktail', 'elegant', 'classic']
      },

      // SHOES
      {
        title: 'White Leather Sneakers - Minimalist',
        description: 'Clean white leather sneakers in minimalist design. Comfortable for daily wear and pairs well with any outfit.',
        category: 'shoes',
        condition: 'good',
        size: '8',
        brand: 'Adidas',
        originalPrice: 100.00,
        sellingPrice: 55.00,
        images: ['/placeholder-image.svg'],
        userId: userIds[1],
        status: 'approved',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
        isActive: true,
        tags: ['sneakers', 'white', 'minimalist', 'casual']
      },
      {
        title: 'Black Ankle Boots - Professional',
        description: 'Sleek black ankle boots with low heel. Perfect for professional settings or casual chic looks. Comfortable and versatile.',
        category: 'shoes',
        condition: 'good',
        size: '7',
        brand: 'Clarks',
        originalPrice: 130.00,
        sellingPrice: 70.00,
        images: ['/placeholder-image.svg'],
        userId: userIds[2],
        status: 'pending',
        createdAt: new Date(Date.now() - 1000 * 60 * 20),
        updatedAt: new Date(Date.now() - 1000 * 60 * 20),
        isActive: true,
        tags: ['boots', 'professional', 'black', 'versatile']
      },

      // ACCESSORIES
      {
        title: 'Vintage Leather Handbag - Brown',
        description: 'Authentic vintage leather handbag in rich brown color. Shows character with age but still very functional. Perfect for vintage lovers.',
        category: 'accessories',
        condition: 'fair',
        size: 'One Size',
        brand: 'Vintage',
        originalPrice: 200.00,
        sellingPrice: 85.00,
        images: ['/placeholder-image.svg'],
        userId: userIds[0],
        status: 'approved',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
        isActive: true,
        tags: ['handbag', 'vintage', 'leather', 'brown']
      },
      {
        title: 'Designer Silk Scarf - Luxury',
        description: 'Beautiful designer silk scarf with intricate pattern. Adds elegance to any outfit. Barely used, excellent condition.',
        category: 'accessories',
        condition: 'like-new',
        size: 'One Size',
        brand: 'Hermès',
        originalPrice: 350.00,
        sellingPrice: 180.00,
        images: ['/placeholder-image.svg'],
        userId: userIds[1],
        status: 'pending',
        createdAt: new Date(Date.now() - 1000 * 60 * 10),
        updatedAt: new Date(Date.now() - 1000 * 60 * 10),
        isActive: true,
        tags: ['scarf', 'silk', 'designer', 'luxury']
      },

      // OUTERWEAR
      {
        title: 'Denim Jacket - Classic Blue',
        description: 'Timeless denim jacket in classic blue wash. Perfect layering piece for any season. Comfortable fit with vintage appeal.',
        category: 'outerwear',
        condition: 'good',
        size: 'M',
        brand: 'Gap',
        originalPrice: 89.99,
        sellingPrice: 45.00,
        images: ['/placeholder-image.svg'],
        userId: userIds[2],
        status: 'approved',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
        isActive: true,
        tags: ['denim', 'jacket', 'classic', 'layering']
      },
      {
        title: 'Wool Coat - Winter Essential',
        description: 'Elegant wool coat in charcoal gray. Perfect for cold weather while maintaining style. Professional and sophisticated.',
        category: 'outerwear',
        condition: 'like-new',
        size: 'L',
        brand: 'Uniqlo',
        originalPrice: 199.99,
        sellingPrice: 120.00,
        images: ['/placeholder-image.svg'],
        userId: userIds[0],
        status: 'pending',
        createdAt: new Date(Date.now() - 1000 * 60 * 5),
        updatedAt: new Date(Date.now() - 1000 * 60 * 5),
        isActive: true,
        tags: ['wool', 'coat', 'winter', 'professional']
      }
    ]

    // Insert clothing items
    const itemResults = await db.collection('items').insertMany(clothingItems)
    console.log(`✅ Added ${Object.keys(itemResults.insertedIds).length} clothing items`)

    // Show summary
    const stats = await db.collection('items').aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray()

    const categoryStats = await db.collection('items').aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]).toArray()

    console.log('\n📊 Item Statistics:')
    stats.forEach(s => console.log(`- ${s._id}: ${s.count} items`))

    console.log('\n👕 Category Breakdown:')
    categoryStats.forEach(s => console.log(`- ${s._id}: ${s.count} items`))

    console.log('\n🎉 Clothing data added successfully!')
    console.log('\nYou now have:')
    console.log('- Realistic clothing items with detailed descriptions')
    console.log('- Multiple categories (tops, bottoms, dresses, shoes, accessories, outerwear)')
    console.log('- Different conditions (new, like-new, good, fair)')
    console.log('- Various brands and price ranges')
    console.log('- Both approved and pending items for testing')
    
  } catch (error) {
    console.error('❌ Error adding clothing data:', error)
  } finally {
    await client.close()
  }
}

addClothingData()
