'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ItemWithUser } from '@/models/Item'
import { useAuth } from '@/contexts/auth-context'
import { formatPrice, formatDate, capitalizeFirst, getStatusColor, getConditionColor } from '@/lib/utils'
import {
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Package,
  AlertTriangle,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react'

export default function AdminPage() {
  const [items, setItems] = useState<ItemWithUser[]>([])
  const [allItems, setAllItems] = useState<ItemWithUser[]>([]) // Store all items for counts
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'approved' | 'rejected'>('pending')
  const [selectedItem, setSelectedItem] = useState<ItemWithUser | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Check if user is admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      console.log('Not admin, redirecting. User:', user)
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Don't render anything if not authenticated or not admin
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          <Button onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchAllItems() // Fetch all items first
  }, [])

  useEffect(() => {
    filterItemsForTab() // Filter items when tab changes
  }, [activeTab, allItems])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllItems()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [])

  const fetchAllItems = async () => {
    try {
      setLoading(true)
      console.log('🔍 Admin: Fetching ALL items...')

      // Fetch ALL items without status filter
      const url = '/api/items?limit=200'

      console.log('🌐 Admin: Fetching from URL:', url)

      const response = await fetch(url, {
        credentials: 'include'
      })

      console.log('📡 Admin: Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('📦 Admin: Fetched ALL items:', data.items?.length || 0)
        console.log('📋 Admin: All items:', data.items?.map(item => ({ title: item.title, status: item.status })) || [])
        setAllItems(data.items || [])

        // If no items found, log for debugging
        if (!data.items || data.items.length === 0) {
          console.log('⚠️ Admin: No items found with current query')
        }
      } else {
        console.error('❌ Admin: Failed to fetch items:', response.status)
        const errorText = await response.text()
        console.error('❌ Admin: Error details:', errorText)
        setAllItems([])
      }
    } catch (error) {
      console.error('❌ Admin: Error fetching items:', error)
      setAllItems([])
    } finally {
      setLoading(false)
    }
  }

  const fetchItemsAlternative = async () => {
    try {
      console.log('🔄 Admin: Trying alternative fetch with status=pending...')
      const response = await fetch('/api/items?status=pending&limit=200', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        console.log('📦 Admin: Alternative fetch found:', data.items?.length || 0, 'pending items')
        if (data.items && data.items.length > 0) {
          setAllItems(data.items)
        }
      }
    } catch (error) {
      console.error('❌ Admin: Alternative fetch failed:', error)
    }
  }

  const filterItemsForTab = () => {
    console.log('🔍 Admin: Filtering items for tab:', activeTab)
    console.log('📦 Admin: Total items available:', allItems.length)

    if (activeTab === 'all') {
      setItems(allItems)
      console.log('📋 Admin: Showing all items:', allItems.length)
    } else {
      const filtered = allItems.filter(item => item.status === activeTab)
      setItems(filtered)
      console.log(`📋 Admin: Showing ${activeTab} items:`, filtered.length)
    }
  }

  const handleApprove = async (itemId: string) => {
    try {
      setActionLoading(true)
      const response = await fetch(`/api/admin/items/${itemId}/approve`, {
        method: 'POST',
      })

      if (response.ok) {
        await fetchAllItems()
        setSelectedItem(null)
      } else {
        console.error('Failed to approve item')
      }
    } catch (error) {
      console.error('Error approving item:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (itemId: string) => {
    try {
      setActionLoading(true)
      const response = await fetch(`/api/admin/items/${itemId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectionReason }),
      })

      if (response.ok) {
        await fetchAllItems()
        setSelectedItem(null)
        setRejectionReason('')
      } else {
        console.error('Failed to reject item')
      }
    } catch (error) {
      console.error('Error rejecting item:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return
    }

    try {
      setActionLoading(true)
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchAllItems()
        setSelectedItem(null)
      } else {
        console.error('Failed to delete item')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const getItemCounts = () => {
    // Calculate counts from ALL items, not just filtered ones
    return {
      pending: allItems.filter(item => item.status === 'pending').length,
      approved: allItems.filter(item => item.status === 'approved').length,
      rejected: allItems.filter(item => item.status === 'rejected').length,
      total: allItems.length,
    }
  }

  const counts = getItemCounts()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage items and monitor platform activity</p>

          {/* Notification for pending items */}
          {getItemCounts().pending > 0 && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    {getItemCounts().pending} item{getItemCounts().pending > 1 ? 's' : ''} pending review
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    New items are waiting for your approval. Click on "Pending" tab to review them.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900">{counts.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{counts.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <XCircle className="w-8 h-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">{counts.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Items Management</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchAllItems}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  {[
                    { key: 'pending', label: 'Pending', count: counts.pending },
                    { key: 'all', label: 'All', count: counts.total },
                    { key: 'approved', label: 'Approved', count: counts.approved },
                    { key: 'rejected', label: 'Rejected', count: counts.rejected },
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
              </CardHeader>
              <CardContent>
                {/* Debug info */}
                <div className="mb-4 p-3 bg-blue-50 rounded text-sm">
                  <p><strong>🔍 Debug Info:</strong></p>
                  <p>Active Tab: {activeTab}</p>
                  <p>All Items in DB: {allItems.length}</p>
                  <p>Filtered Items Shown: {items.length}</p>
                  <p>Loading: {loading ? 'Yes' : 'No'}</p>
                  <p>Counts - Pending: {getItemCounts().pending}, Approved: {getItemCounts().approved}, Rejected: {getItemCounts().rejected}</p>
                  {items.length > 0 && (
                    <p>Showing: {items.map(item => `${item.title} (${item.status})`).join(', ')}</p>
                  )}
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse flex space-x-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : items.length > 0 ? (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item._id?.toString()}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedItem?._id === item._id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className="flex space-x-4">
                          <div className="w-16 h-16 relative rounded-lg overflow-hidden">
                            <Image
                              src={item.images[0] || '/placeholder-image.svg'}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                                <p className="text-sm text-gray-500">by {item.user.name}</p>
                                <p className="text-sm font-medium text-primary">{formatPrice(item.sellingPrice)}</p>
                              </div>
                              <div className="flex flex-col items-end space-y-1">
                                <Badge className={getStatusColor(item.status)}>
                                  {capitalizeFirst(item.status)}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {formatDate(item.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No items found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Item Details */}
          <div className="lg:col-span-1">
            {selectedItem ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Item Details</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedItem(null)}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-square relative rounded-lg overflow-hidden">
                    <Image
                      src={selectedItem.images[0] || '/placeholder-image.svg'}
                      alt={selectedItem.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg">{selectedItem.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{selectedItem.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Price:</span>
                      <p>{formatPrice(selectedItem.sellingPrice)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Category:</span>
                      <p>{capitalizeFirst(selectedItem.category)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Condition:</span>
                      <p>{capitalizeFirst(selectedItem.condition)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Size:</span>
                      <p>{selectedItem.size}</p>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-sm">Seller:</span>
                    <p className="text-sm">{selectedItem.user.name}</p>
                    <p className="text-sm text-gray-500">{selectedItem.user.email}</p>
                  </div>

                  {selectedItem.status === 'rejected' && selectedItem.rejectionReason && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                      <p className="text-sm text-red-600">{selectedItem.rejectionReason}</p>
                    </div>
                  )}

                  {selectedItem.status === 'pending' && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Rejection Reason (optional)</label>
                        <Textarea
                          placeholder="Enter reason for rejection..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleApprove(selectedItem._id!.toString())}
                          disabled={actionLoading}
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleReject(selectedItem._id!.toString())}
                          disabled={actionLoading}
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(selectedItem._id!.toString())}
                      disabled={actionLoading}
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Item
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select an item to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
