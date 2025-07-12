'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ItemWithUser } from '@/models/Item'
import { useAuth } from '@/contexts/auth-context'
import { formatPrice, formatDate, capitalizeFirst, getConditionColor } from '@/lib/utils'
import { ArrowLeft, User, Calendar, Tag, Package, Heart } from 'lucide-react'

export default function ItemDetailsPage() {
  const [item, setItem] = useState<ItemWithUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)
  const { user } = useAuth()
  const params = useParams()

  useEffect(() => {
    if (params.id) {
      fetchItem(params.id as string)
    }
  }, [params.id])

  const fetchItem = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/items/${id}`)
      if (response.ok) {
        const data = await response.json()
        setItem(data.item)
      } else {
        console.error('Item not found')
      }
    } catch (error) {
      console.error('Error fetching item:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToWishlist = async () => {
    if (!user) {
      alert('Please login to add items to wishlist')
      return
    }

    if (!item) return

    try {
      setIsAddingToWishlist(true)
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ itemId: item._id }),
      })

      if (response.ok) {
        alert('Item added to wishlist!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add to wishlist')
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      alert('Failed to add to wishlist')
    } finally {
      setIsAddingToWishlist(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Item not found</h1>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Items
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square relative rounded-lg overflow-hidden bg-white">
              <Image
                src={item.images[currentImageIndex] || '/placeholder-image.svg'}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            
            {item.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square relative rounded-md overflow-hidden border-2 ${
                      currentImageIndex === index ? 'border-primary' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${item.title} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 12.5vw"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
              <div className="flex items-center space-x-2 mb-4">
                <Badge className={getConditionColor(item.condition)}>
                  {capitalizeFirst(item.condition)}
                </Badge>
                <Badge variant="outline">
                  {capitalizeFirst(item.category)}
                </Badge>
              </div>
              <p className="text-3xl font-bold text-primary mb-4">
                {formatPrice(item.sellingPrice)}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Size</h4>
                  <p className="text-gray-600">{item.size}</p>
                </div>
                {item.brand && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Brand</h4>
                    <p className="text-gray-600">{item.brand}</p>
                  </div>
                )}
                {item.originalPrice && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Original Price</h4>
                    <p className="text-gray-600">{formatPrice(item.originalPrice)}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Posted</h4>
                  <p className="text-gray-600">{formatDate(item.createdAt)}</p>
                </div>
              </div>

              {item.tags && item.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Seller Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                    {item.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{item.user.name}</p>
                    <p className="text-sm text-gray-500">{item.user.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button size="lg" className="w-full">
                Contact Seller
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleAddToWishlist}
                disabled={isAddingToWishlist || !user}
              >
                <Heart className="w-4 h-4 mr-2" />
                {isAddingToWishlist ? 'Adding...' : 'Add to Wishlist'}
              </Button>
              {!user && (
                <p className="text-sm text-gray-500 text-center">
                  Login to add items to wishlist
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
