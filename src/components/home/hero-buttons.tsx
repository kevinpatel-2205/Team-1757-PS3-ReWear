'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import UploadItemModal from '@/components/modals/upload-item-modal'
import { ShoppingBag, Upload } from 'lucide-react'

export default function HeroButtons() {
  const { user, loading } = useAuth()
  const [showUploadModal, setShowUploadModal] = useState(false)

  const scrollToItems = () => {
    const itemsSection = document.getElementById('items-section')
    if (itemsSection) {
      itemsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleSellClick = () => {
    if (user) {
      setShowUploadModal(true)
    } else {
      // Redirect to login if not authenticated
      window.location.href = '/login'
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <div className="h-12 w-40 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="h-12 w-40 bg-gray-200 rounded-md animate-pulse"></div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          size="lg"
          className="px-8 flex items-center gap-2"
          onClick={scrollToItems}
        >
          <ShoppingBag className="w-5 h-5" />
          Start Shopping
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="px-8 flex items-center gap-2 w-full sm:w-auto"
          onClick={handleSellClick}
        >
          <Upload className="w-5 h-5" />
          Sell Your Items
        </Button>

        {!user && (
          <p className="text-sm text-gray-500 text-center mt-2">
            Sign in to start selling your items
          </p>
        )}
      </div>

      {/* Upload Modal */}
      <UploadItemModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => {
          // Optionally refresh the items list or show a success message
          window.location.reload()
        }}
      />
    </>
  )
}
