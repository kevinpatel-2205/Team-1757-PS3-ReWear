'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ItemCard from '@/components/items/item-card'
import { User } from '@/models/User'
import { ItemWithUser } from '@/models/Item'
import { formatDate, getStatusColor, capitalizeFirst } from '@/lib/utils'
import { User as UserIcon, Mail, Phone, MapPin, Package, Plus } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [userItems, setUserItems] = useState<ItemWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)

      // Fetch user profile
      console.log('Profile page: Fetching user profile...')
      const userResponse = await fetch('/api/auth/me', {
        credentials: 'include'
      })

      console.log('Profile page: User response status:', userResponse.status)

      if (userResponse.ok) {
        const userData = await userResponse.json()
        console.log('Profile page: User data:', userData.user)
        setUser(userData.user)

        // Fetch user's items - include all statuses
        const itemsUrl = `/api/items?userId=${userData.user._id}&limit=100`
        console.log('Profile page: Fetching items from:', itemsUrl)

        const itemsResponse = await fetch(itemsUrl, {
          credentials: 'include'
        })

        console.log('Profile page: Items response status:', itemsResponse.status)

        if (itemsResponse.ok) {
          const itemsData = await itemsResponse.json()
          console.log('Profile page: Items data:', itemsData)
          console.log('Profile page: Items count:', itemsData.items?.length || 0)
          setUserItems(itemsData.items || [])
        } else {
          console.error('Profile page: Failed to fetch items:', itemsResponse.status)
          const errorText = await itemsResponse.text()
          console.error('Profile page: Error details:', errorText)
          setUserItems([])
        }
      } else {
        console.error('Profile page: Failed to fetch user:', userResponse.status)
      }
    } catch (error) {
      console.error('Profile page: Error fetching user data:', error)
      setUserItems([])
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = userItems.filter(item => {
    if (activeTab === 'all') return true
    return item.status === activeTab
  })

  const getItemCounts = () => {
    return {
      all: userItems.length,
      pending: userItems.filter(item => item.status === 'pending').length,
      approved: userItems.filter(item => item.status === 'approved').length,
      rejected: userItems.filter(item => item.status === 'rejected').length,
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile not found</h1>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  const itemCounts = getItemCounts()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserIcon className="w-5 h-5" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-semibold mx-auto mb-4">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <Badge className="mt-2">
                    {capitalizeFirst(user.role)}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  
                  {user.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{user.phone}</span>
                    </div>
                  )}
                  
                  {user.address && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="text-sm">
                        <p>{user.address.street}</p>
                        <p>{user.address.city}, {user.address.state} {user.address.zipCode}</p>
                        <p>{user.address.country}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Member since {formatDate(user.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Items Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="w-5 h-5" />
                    <span>My Items</span>
                  </CardTitle>
                  <Link href="/upload-item">
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {/* Tabs */}
                <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                  {[
                    { key: 'all', label: 'All', count: itemCounts.all },
                    { key: 'pending', label: 'Pending', count: itemCounts.pending },
                    { key: 'approved', label: 'Approved', count: itemCounts.approved },
                    { key: 'rejected', label: 'Rejected', count: itemCounts.rejected },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.key
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>

                {/* Items Grid */}
                {filteredItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredItems.map((item) => (
                      <div key={item._id?.toString()} className="relative">
                        <ItemCard item={item} />
                        <div className="absolute top-2 left-2">
                          <Badge className={getStatusColor(item.status)}>
                            {capitalizeFirst(item.status)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {activeTab === 'all' 
                        ? "You haven't uploaded any items yet." 
                        : `No ${activeTab} items found.`
                      }
                    </p>
                    <Link href="/upload-item">
                      <Button className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Upload Your First Item
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
