// User types
export interface User {
  id: string
  email: string
  name: string
  image?: string
  emailVerified?: Date
  passwordHash?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserInput {
  email: string
  name: string
  password: string
  image?: string
}

export interface UpdateUserInput {
  name?: string
  image?: string
}

// Brand types
export interface Brand {
  id: string
  name: string
  description?: string
  ownerId: string
  members: BrandMember[]
  settings: BrandSettings
  socialConnections: SocialConnection[]
  createdAt: Date
  updatedAt: Date
}

export interface BrandMember {
  userId: string
  userName?: string
  userEmail?: string
  role: 'owner' | 'admin' | 'member'
  addedAt: Date
}

export interface BrandSettings {
  tone: string
  guidelines: string
  [key: string]: unknown
}

export interface SocialConnection {
  platform: string
  accountId: string
  accountName: string
  enabled: boolean
  connectedAt: Date
}

export interface CreateBrandInput {
  name: string
  description?: string
  settings?: Partial<BrandSettings>
}

export interface UpdateBrandInput {
  name?: string
  description?: string
  settings?: Partial<BrandSettings>
}

// Queue Item types (for future use)
export interface QueueItem {
  id: string
  brandId: string
  type: 'response' | 'post'
  status: 'pending' | 'approved' | 'rejected' | 'published'
  content: {
    original: string
    generated: string
    edited?: string
  }
  metadata: {
    platform: string
    sourceUrl?: string
    [key: string]: unknown
  }
  reviewedBy?: string
  reviewedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Session types (extends NextAuth)
export interface SessionUser {
  id: string
  email: string
  name: string
  image?: string
}
