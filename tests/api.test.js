// API Tests for ReWear Application
const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals')

const BASE_URL = 'http://localhost:3000'

describe('ReWear API Tests', () => {
  let authToken = null
  let testItemId = null
  let adminToken = null

  // Test user credentials
  const testUser = {
    email: 'test@example.com',
    password: 'test123',
    name: 'Test User'
  }

  const adminUser = {
    email: 'admin@rewear.com',
    password: 'admin123'
  }

  beforeAll(async () => {
    console.log('🧪 Starting API Tests...')
  })

  afterAll(async () => {
    console.log('✅ API Tests Completed')
  })

  describe('Authentication Tests', () => {
    test('Should register a new user', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.message).toBe('User created successfully')
    })

    test('Should login user and return token', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.token).toBeDefined()
      authToken = data.token
    })

    test('Should login admin user', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminUser)
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.user.role).toBe('admin')
      adminToken = data.token
    })

    test('Should get user profile', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: { 'Cookie': `token=${authToken}` }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.user.email).toBe(testUser.email)
    })
  })

  describe('Items API Tests', () => {
    test('Should create a new item', async () => {
      const itemData = {
        title: 'Test Item',
        description: 'Test item description',
        category: 'tops',
        condition: 'good',
        size: 'M',
        brand: 'Test Brand',
        sellingPrice: 25.00,
        images: ['/placeholder-image.svg']
      }

      const response = await fetch(`${BASE_URL}/api/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${authToken}`
        },
        body: JSON.stringify(itemData)
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.message).toBe('Item created successfully')
      expect(data.itemId).toBeDefined()
      testItemId = data.itemId
    })

    test('Should get all items', async () => {
      const response = await fetch(`${BASE_URL}/api/items`)
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.items).toBeDefined()
      expect(Array.isArray(data.items)).toBe(true)
    })

    test('Should get specific item', async () => {
      if (!testItemId) return

      const response = await fetch(`${BASE_URL}/api/items/${testItemId}`)
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.item.title).toBe('Test Item')
    })

    test('Should get pending items for admin', async () => {
      const response = await fetch(`${BASE_URL}/api/items?status=pending`, {
        headers: { 'Cookie': `token=${adminToken}` }
      })
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.items).toBeDefined()
    })
  })

  describe('Admin API Tests', () => {
    test('Should approve item as admin', async () => {
      if (!testItemId) return

      const response = await fetch(`${BASE_URL}/api/admin/items/${testItemId}/approve`, {
        method: 'POST',
        headers: { 'Cookie': `token=${adminToken}` }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.message).toBe('Item approved successfully')
    })

    test('Should reject item as admin', async () => {
      if (!testItemId) return

      const response = await fetch(`${BASE_URL}/api/admin/items/${testItemId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${adminToken}`
        },
        body: JSON.stringify({ reason: 'Test rejection' })
      })

      expect(response.status).toBe(200)
    })
  })

  describe('Wishlist API Tests', () => {
    test('Should add item to wishlist', async () => {
      if (!testItemId) return

      const response = await fetch(`${BASE_URL}/api/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${authToken}`
        },
        body: JSON.stringify({ itemId: testItemId })
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.message).toBe('Item added to wishlist')
    })

    test('Should get user wishlist', async () => {
      const response = await fetch(`${BASE_URL}/api/wishlist`, {
        headers: { 'Cookie': `token=${authToken}` }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.items).toBeDefined()
    })
  })

  describe('Error Handling Tests', () => {
    test('Should return 401 for unauthorized requests', async () => {
      const response = await fetch(`${BASE_URL}/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test' })
      })

      expect(response.status).toBe(401)
    })

    test('Should return 400 for invalid data', async () => {
      const response = await fetch(`${BASE_URL}/api/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${authToken}`
        },
        body: JSON.stringify({ invalidField: 'test' })
      })

      expect(response.status).toBe(400)
    })
  })
})
