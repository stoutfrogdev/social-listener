import { getProvider, getAllProviders, isConfigured } from '../registry'

describe('registry', () => {
  describe('getProvider', () => {
    it('should return twitter provider', () => {
      const provider = getProvider('twitter')
      expect(provider.platform).toBe('twitter')
      expect(provider.displayName).toBe('Twitter / X')
    })

    it('should return linkedin provider', () => {
      const provider = getProvider('linkedin')
      expect(provider.platform).toBe('linkedin')
      expect(provider.displayName).toBe('LinkedIn')
    })

    it('should return reddit provider', () => {
      const provider = getProvider('reddit')
      expect(provider.platform).toBe('reddit')
      expect(provider.displayName).toBe('Reddit')
    })

    it('should throw for unknown platform', () => {
      // @ts-expect-error testing invalid platform
      expect(() => getProvider('tiktok')).toThrow('Unknown social platform')
    })
  })

  describe('getAllProviders', () => {
    it('should return all 3 providers', () => {
      const providers = getAllProviders()
      expect(providers).toHaveLength(3)
      const platforms = providers.map((p) => p.platform)
      expect(platforms).toContain('twitter')
      expect(platforms).toContain('linkedin')
      expect(platforms).toContain('reddit')
    })
  })

  describe('isConfigured', () => {
    it('should return false when env vars are not set', () => {
      delete process.env.TWITTER_CLIENT_ID
      delete process.env.LINKEDIN_CLIENT_ID
      delete process.env.LINKEDIN_CLIENT_SECRET
      delete process.env.REDDIT_CLIENT_ID
      delete process.env.REDDIT_CLIENT_SECRET

      expect(isConfigured('twitter')).toBe(false)
      expect(isConfigured('linkedin')).toBe(false)
      expect(isConfigured('reddit')).toBe(false)
    })

    it('should return true when twitter client ID is set', () => {
      process.env.TWITTER_CLIENT_ID = 'test-id'
      expect(isConfigured('twitter')).toBe(true)
      delete process.env.TWITTER_CLIENT_ID
    })

    it('should require both client ID and secret for linkedin', () => {
      process.env.LINKEDIN_CLIENT_ID = 'test-id'
      expect(isConfigured('linkedin')).toBe(false)
      process.env.LINKEDIN_CLIENT_SECRET = 'test-secret'
      expect(isConfigured('linkedin')).toBe(true)
      delete process.env.LINKEDIN_CLIENT_ID
      delete process.env.LINKEDIN_CLIENT_SECRET
    })

    it('should require both client ID and secret for reddit', () => {
      process.env.REDDIT_CLIENT_ID = 'test-id'
      expect(isConfigured('reddit')).toBe(false)
      process.env.REDDIT_CLIENT_SECRET = 'test-secret'
      expect(isConfigured('reddit')).toBe(true)
      delete process.env.REDDIT_CLIENT_ID
      delete process.env.REDDIT_CLIENT_SECRET
    })
  })
})
