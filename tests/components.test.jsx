// Component Tests for ReWear Application
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, jest } from '@jest/globals'
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
  useParams: () => ({ id: 'test-id' }),
}))

// Mock auth context
const mockAuthContext = {
  user: { id: '1', email: 'test@example.com', role: 'user' },
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
}

jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }) => children,
}))

// Import components after mocks
import ItemCard from '@/components/items/item-card'
import LoginForm from '@/components/auth/login-form'
import UploadItemModal from '@/components/modals/upload-item-modal'

describe('Component Tests', () => {
  const mockItem = {
    _id: '1',
    title: 'Test Item',
    description: 'Test description',
    category: 'tops',
    condition: 'good',
    size: 'M',
    brand: 'Test Brand',
    sellingPrice: 25.00,
    images: ['/placeholder-image.svg'],
    user: {
      name: 'Test User',
      email: 'test@example.com'
    },
    createdAt: new Date(),
    status: 'approved'
  }

  describe('ItemCard Component', () => {
    test('Should render item information correctly', () => {
      render(<ItemCard item={mockItem} />)
      
      expect(screen.getByText('Test Item')).toBeInTheDocument()
      expect(screen.getByText('Test description')).toBeInTheDocument()
      expect(screen.getByText('$25.00')).toBeInTheDocument()
      expect(screen.getByText('by Test User')).toBeInTheDocument()
    })

    test('Should display item image', () => {
      render(<ItemCard item={mockItem} />)
      
      const image = screen.getByAltText('Test Item')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', expect.stringContaining('placeholder-image.svg'))
    })

    test('Should show condition badge', () => {
      render(<ItemCard item={mockItem} />)
      
      expect(screen.getByText('Good')).toBeInTheDocument()
    })
  })

  describe('LoginForm Component', () => {
    test('Should render login form fields', () => {
      render(<LoginForm />)
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    test('Should validate required fields', async () => {
      render(<LoginForm />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })
    })

    test('Should validate email format', async () => {
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
      })
    })
  })

  describe('UploadItemModal Component', () => {
    const mockProps = {
      isOpen: true,
      onClose: jest.fn(),
      onSuccess: jest.fn(),
    }

    test('Should render upload form when open', () => {
      render(<UploadItemModal {...mockProps} />)
      
      expect(screen.getByText(/upload item/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    })

    test('Should validate required fields', async () => {
      render(<UploadItemModal {...mockProps} />)
      
      const submitButton = screen.getByRole('button', { name: /upload item/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument()
        expect(screen.getByText(/description is required/i)).toBeInTheDocument()
      })
    })

    test('Should close modal when cancel is clicked', () => {
      render(<UploadItemModal {...mockProps} />)
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)
      
      expect(mockProps.onClose).toHaveBeenCalled()
    })
  })

  describe('Accessibility Tests', () => {
    test('ItemCard should be keyboard accessible', () => {
      render(<ItemCard item={mockItem} />)
      
      const card = screen.getByRole('link')
      expect(card).toBeInTheDocument()
      expect(card).toHaveAttribute('href', `/item-details/${mockItem._id}`)
    })

    test('Form inputs should have proper labels', () => {
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('Error Handling Tests', () => {
    test('Should handle missing item data gracefully', () => {
      const incompleteItem = { ...mockItem, user: null }
      
      expect(() => render(<ItemCard item={incompleteItem} />)).not.toThrow()
    })

    test('Should handle network errors in forms', async () => {
      // Mock fetch to reject
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))
      
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
    })
  })
})
