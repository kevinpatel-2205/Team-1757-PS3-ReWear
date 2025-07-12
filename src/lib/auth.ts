import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User, UserSession } from '@/models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-jwt-secret-key-change-this-in-production'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: User): string {
  const payload: UserSession = {
    id: user._id!.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  }
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession
  } catch (error) {
    return null
  }
}

export function getUserFromToken(token: string): UserSession | null {
  if (!token) return null
  
  try {
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token
    return verifyToken(cleanToken)
  } catch (error) {
    return null
  }
}
