import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  email: string
  password: string
  name: string
  role: 'user' | 'admin'
  profileImage?: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface CreateUserInput {
  email: string
  password: string
  name: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export interface LoginInput {
  email: string
  password: string
}

export interface UserSession {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
}
