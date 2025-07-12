const { MongoClient } = require('mongodb')

async function addRealImages() {
  const client = new MongoClient('mongodb://localhost:27017/rewear')
  
  try {
    await client.connect()
    console.log('🔗 Connected to MongoDB')
    
    const db = client.db('rewear')
    
    // Real clothing images from Unsplash (free to use)
    const imageMapping = {
      // TOPS
      'Vintage Band T-Shirt - The Beatles': [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&h=500&fit=crop'
      ],
      'Elegant Silk Blouse - Office Ready': [
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=500&fit=crop'
      ],
      'Cozy Knit Sweater - Winter Essential': [
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&h=500&fit=crop'
      ],

      // BOTTOMS
      'Classic Blue Jeans - Levi\'s 501': [
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=500&h=500&fit=crop'
      ],
      'High-Waisted Black Trousers': [
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1506629905607-d405b7a30db9?w=500&h=500&fit=crop'
      ],

      // DRESSES
      'Floral Summer Dress - Bohemian Style': [
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&h=500&fit=crop'
      ],
      'Little Black Dress - Cocktail Ready': [
        'https://images.unsplash.com/photo-1566479179817-c0b8b8b5b8b8?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=500&h=500&fit=crop'
      ],

      // SHOES
      'White Leather Sneakers - Minimalist': [
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500&h=500&fit=crop'
      ],
      'Black Ankle Boots - Professional': [
        'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500&h=500&fit=crop'
      ],

      // ACCESSORIES
      'Vintage Leather Handbag - Brown': [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&h=500&fit=crop'
      ],
      'Designer Silk Scarf - Luxury': [
        'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=500&h=500&fit=crop'
      ],

      // OUTERWEAR
      'Denim Jacket - Classic Blue': [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop'
      ],
      'Wool Coat - Winter Essential': [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=500&h=500&fit=crop'
      ]
    }

    // Additional generic clothing images for other items
    const genericImages = {
      'tops': [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&h=500&fit=crop'
      ],
      'bottoms': [
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1506629905607-d405b7a30db9?w=500&h=500&fit=crop'
      ],
      'dresses': [
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=500&h=500&fit=crop'
      ],
      'shoes': [
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500&h=500&fit=crop'
      ],
      'accessories': [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500&h=500&fit=crop'
      ],
      'outerwear': [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=500&h=500&fit=crop'
      ]
    }

    // Get all items from database
    const items = await db.collection('items').find({}).toArray()
    console.log(`📦 Found ${items.length} items to update with images`)

    let updatedCount = 0

    for (const item of items) {
      let newImages = []

      // Try to find specific images for this item
      if (imageMapping[item.title]) {
        newImages = imageMapping[item.title]
        console.log(`🎯 Found specific images for: ${item.title}`)
      } else {
        // Use generic images based on category
        const categoryImages = genericImages[item.category] || genericImages['tops']
        // Pick 1-3 random images from the category
        const numImages = Math.floor(Math.random() * 3) + 1
        newImages = categoryImages.slice(0, numImages)
        console.log(`📂 Using ${numImages} generic ${item.category} images for: ${item.title}`)
      }

      // Update the item with new images
      await db.collection('items').updateOne(
        { _id: item._id },
        { 
          $set: { 
            images: newImages,
            updatedAt: new Date()
          }
        }
      )

      updatedCount++
    }

    console.log(`✅ Updated ${updatedCount} items with real images`)

    // Show some statistics
    const itemsWithImages = await db.collection('items').find({
      images: { $exists: true, $ne: [] }
    }).toArray()

    console.log('\n📊 Image Statistics:')
    console.log(`- Items with images: ${itemsWithImages.length}`)
    console.log(`- Total images added: ${itemsWithImages.reduce((sum, item) => sum + item.images.length, 0)}`)

    console.log('\n🎉 Real images added successfully!')
    console.log('\nYour ReWear app now has:')
    console.log('- Professional clothing photos from Unsplash')
    console.log('- High-quality images optimized for web')
    console.log('- Multiple images per item for better showcase')
    console.log('- Category-appropriate images')
    console.log('- Consistent image sizing (500x500)')
    
    console.log('\n📱 Image Sources:')
    console.log('- All images are from Unsplash (free to use)')
    console.log('- Images are properly sized and cropped')
    console.log('- CDN-hosted for fast loading')
    console.log('- Professional photography quality')

  } catch (error) {
    console.error('❌ Error adding real images:', error)
  } finally {
    await client.close()
  }
}

addRealImages()
