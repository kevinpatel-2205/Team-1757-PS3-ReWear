'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import UploadItemModal from '@/components/modals/upload-item-modal'
import ProfileModal from '@/components/modals/profile-modal'
import {
  User,
  LogOut,
  Plus,
  Home,
  Settings,
  Menu,
  X
} from 'lucide-react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const router = useRouter()
  const { user, loading, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      setIsMenuOpen(false)
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleUploadClick = () => {
    setShowUploadModal(true)
    setIsMenuOpen(false)
  }

  const handleProfileClick = () => {
    setShowProfileModal(true)
    setIsMenuOpen(false)
  }

  return (
    <>
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary">ReWear</h1>
              </Link>
            </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>

            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            ) : user ? (
              <>
                <Button variant="ghost" size="sm" onClick={handleUploadClick}>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Item
                </Button>

                <Button variant="ghost" size="sm" onClick={handleProfileClick}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>

                {user.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}

                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/" className="block">
                <Button variant="ghost" className="w-full justify-start">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>

              {user ? (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={handleUploadClick}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Item
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={handleProfileClick}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>

                  {user.role === 'admin' && (
                    <Link href="/admin" className="block">
                      <Button variant="ghost" className="w-full justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
                  )}

                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block">
                    <Button variant="ghost" className="w-full justify-start">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" className="block">
                    <Button className="w-full justify-start">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>

    {/* Modals */}
    {user && (
      <>
        <UploadItemModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false)
            // Optionally refresh the page or show success message
            window.location.reload()
          }}
        />

        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      </>
    )}
  </>
  )
}
