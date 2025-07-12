import { z } from 'zod'

// User validation schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password must be less than 100 characters'),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'Zip code is required'),
    country: z.string().min(1, 'Country is required'),
  }).optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Item validation schemas
export const createItemSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  category: z.enum(['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'other']),
  condition: z.enum(['new', 'like-new', 'good', 'fair', 'poor']),
  size: z.string().min(1, 'Size is required'),
  brand: z.string().optional(),
  originalPrice: z.number().positive().optional(),
  sellingPrice: z.number().positive('Selling price must be positive'),
  images: z.array(z.string()).min(1, 'At least one image is required').max(5, 'Maximum 5 images allowed'),
  tags: z.array(z.string()).optional(),
})

export const updateItemSchema = createItemSchema.partial()

export const adminActionSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CreateItemInput = z.infer<typeof createItemSchema>
export type UpdateItemInput = z.infer<typeof updateItemSchema>
export type AdminActionInput = z.infer<typeof adminActionSchema>
