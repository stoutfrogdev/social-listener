import { connectSocialSchema, disconnectSocialSchema, toggleConnectionSchema } from '@/lib/validations'

describe('social validations', () => {
  describe('connectSocialSchema', () => {
    it('should accept valid input', () => {
      const result = connectSocialSchema.safeParse({
        brandId: 'brand-123',
        platform: 'twitter',
      })
      expect(result.success).toBe(true)
    })

    it('should accept all valid platforms', () => {
      for (const platform of ['twitter', 'linkedin', 'reddit']) {
        const result = connectSocialSchema.safeParse({
          brandId: 'brand-123',
          platform,
        })
        expect(result.success).toBe(true)
      }
    })

    it('should reject empty brandId', () => {
      const result = connectSocialSchema.safeParse({
        brandId: '',
        platform: 'twitter',
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid platform', () => {
      const result = connectSocialSchema.safeParse({
        brandId: 'brand-123',
        platform: 'tiktok',
      })
      expect(result.success).toBe(false)
    })

    it('should reject missing fields', () => {
      expect(connectSocialSchema.safeParse({}).success).toBe(false)
      expect(connectSocialSchema.safeParse({ brandId: 'x' }).success).toBe(false)
      expect(connectSocialSchema.safeParse({ platform: 'twitter' }).success).toBe(false)
    })
  })

  describe('disconnectSocialSchema', () => {
    it('should accept valid connectionId', () => {
      const result = disconnectSocialSchema.safeParse({
        connectionId: 'brand_twitter_12345',
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty connectionId', () => {
      const result = disconnectSocialSchema.safeParse({ connectionId: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('toggleConnectionSchema', () => {
    it('should accept true', () => {
      const result = toggleConnectionSchema.safeParse({ enabled: true })
      expect(result.success).toBe(true)
    })

    it('should accept false', () => {
      const result = toggleConnectionSchema.safeParse({ enabled: false })
      expect(result.success).toBe(true)
    })

    it('should reject non-boolean', () => {
      const result = toggleConnectionSchema.safeParse({ enabled: 'yes' })
      expect(result.success).toBe(false)
    })

    it('should reject missing enabled', () => {
      const result = toggleConnectionSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })
})
