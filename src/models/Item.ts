import { ObjectId } from 'mongodb'

export type ItemStatus = 'pending' | 'approved' | 'rejected' | 'sold'
export type ItemCondition = 'new' | 'like-new' | 'good' | 'fair' | 'poor'
export type ItemCategory = 'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'shoes' | 'accessories' | 'other'

export interface Item {
  _id?: ObjectId
  title: string
  description: string
  category: ItemCategory
  condition: ItemCondition
  size: string
  brand?: string
  originalPrice?: number
  sellingPrice: number
  images: string[]
  userId: ObjectId
  status: ItemStatus
  rejectionReason?: string
  createdAt: Date
  updatedAt: Date
  soldAt?: Date
  buyerId?: ObjectId
  tags?: string[]
  isActive: boolean
}

export interface CreateItemInput {
  title: string
  description: string
  category: ItemCategory
  condition: ItemCondition
  size: string
  brand?: string
  originalPrice?: number
  sellingPrice: number
  images: string[]
  tags?: string[]
}

export interface UpdateItemInput {
  title?: string
  description?: string
  category?: ItemCategory
  condition?: ItemCondition
  size?: string
  brand?: string
  originalPrice?: number
  sellingPrice?: number
  images?: string[]
  tags?: string[]
}

export interface ItemWithUser extends Item {
  user: {
    _id: ObjectId
    name: string
    email: string
    profileImage?: string
  }
}
