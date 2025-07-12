'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User } from '@/models/User'
import { ItemWithUser } from '@/models/Item'
import { formatDate, getStatusColor, capitalizeFirst } from '@/lib/utils'
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Package, 
  Calendar,
  ExternalLink
} from 'lucide-react'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userItems, setUserItems] = useState<ItemWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'items'>('profile')

  useEffect(() => {
    if (isOpen) {
      fetchUserData()
    }
  }, [isOpen])

  const fetchUserData = async () => {
    try {
      setLoading(true)

      // Fetch user profile
      console.log('Fetching user profile...')
      const userResponse = await fetch('/api/auth/me', {
        credentials: 'include'
      })

      console.log('User response status:', userResponse.status)

      if (userResponse.ok) {
        const userData = await userResponse.json()
        console.log('User data:', userData.user)
        setUser(userData.user)

        // Fetch user's items with better URL construction
        const itemsUrl = `/api/items?userId=${userData.user._id}&limit=50`
        console.log('Fetching items from:', itemsUrl)

        const itemsResponse = await fetch(itemsUrl, {
          credentials: 'include'
        })

        console.log('Items response status:', itemsResponse.status)

        if (itemsResponse.ok) {
          const itemsData = await itemsResponse.json()
          console.log('User items data:', itemsData)
          console.log('User items count:', itemsData.items?.length || 0)
          setUserItems(itemsData.items || [])
        } else {
          console.error('Failed to fetch user items:', itemsResponse.status)
          setUserItems([])
        }
      } else {
        console.error('Failed to fetch user profile:', userResponse.status)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      setUserItems([])
    } finally {
      setLoading(false)
    }
  }

  const getItemCounts = () => {
    return {
      total: userItems.length,
      pending: userItems.filter(item => item.status === 'pending').length,
      approved: userItems.filter(item => item.status === 'approved').length,
      rejected: userItems.filter(item => item.status === 'rejected').length,
    }
  }

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Profile" size="lg">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Modal>
    )
  }

  if (!user) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Profile" size="lg">
        <div className="text-center py-8">
          <p className="text-gray-500">Unable to load profile data.</p>
        </div>
      </Modal>
    )
  }

  const itemCounts = getItemCounts()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="My Profile" size="lg">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'profile'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Profile Info
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'items'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Items ({itemCounts.total})
          </button>
        </div>

        {activeTab === 'profile' ? (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-semibold mx-auto mb-4">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <Badge className="mt-2">
                {capitalizeFirst(user.role)}
              </Badge>
            </div>

            {/* Profile Details */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              
              {user.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
              )}
              
              {user.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <div className="font-medium">
                      <p>{user.address.street}</p>
                      <p>{user.address.city}, {user.address.state} {user.address.zipCode}</p>
                      <p>{user.address.country}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Member since</p>
                  <p className="font-medium">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{itemCounts.total}</p>
                <p className="text-sm text-gray-500">Total Items</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{itemCounts.approved}</p>
                <p className="text-sm text-gray-500">Approved</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.open('/profile', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Full Profile
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Items Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold">{itemCounts.total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-lg font-bold text-yellow-600">{itemCounts.pending}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-lg font-bold text-green-600">{itemCounts.approved}</p>
                <p className="text-xs text-gray-500">Approved</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-lg font-bold text-red-600">{itemCounts.rejected}</p>
                <p className="text-xs text-gray-500">Rejected</p>
              </div>
            </div>

            {/* Recent Items */}
            <div>
              <h3 className="font-medium mb-3">Recent Items</h3>
              {userItems.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {userItems.slice(0, 5).map((item) => (
                    <div key={item._id?.toString()} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        {item.images[0] ? (
                          <img 
                            src={item.images[0]} 
                            alt={item.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.title}</p>
                        <p className="text-sm text-gray-500">${item.sellingPrice}</p>
                      </div>
                      <Badge className={getStatusColor(item.status)}>
                        {capitalizeFirst(item.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No items uploaded yet</p>
                </div>
              )}
            </div>

            {userItems.length > 0 && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open('/profile', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View All Items
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
