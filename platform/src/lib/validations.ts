import { z } from 'zod'

export const createBrandSchema = z.object({
  name: z
    .string()
    .min(1, 'Brand name is required')
    .max(100, 'Brand name must be 100 characters or less')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),
  settings: z.object({
    tone: z.string().max(2000, 'Tone must be 2000 characters or less').optional(),
    guidelines: z.string().max(5000, 'Guidelines must be 5000 characters or less').optional(),
  }).optional(),
})

export const updateBrandSchema = z.object({
  name: z
    .string()
    .min(1, 'Brand name is required')
    .max(100, 'Brand name must be 100 characters or less')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),
  settings: z.object({
    tone: z.string().max(2000, 'Tone must be 2000 characters or less').optional(),
    guidelines: z.string().max(5000, 'Guidelines must be 5000 characters or less').optional(),
  }).optional(),
})

export const registerSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must be 255 characters or less'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be 128 characters or less'),
})

export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
})
