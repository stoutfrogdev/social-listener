import { createOAuthState, parseOAuthState } from '../oauth-state'

const TEST_KEY = 'b'.repeat(64)

beforeAll(() => {
  process.env.SOCIAL_TOKEN_ENCRYPTION_KEY = TEST_KEY
})

afterAll(() => {
  delete process.env.SOCIAL_TOKEN_ENCRYPTION_KEY
})

describe('oauth-state', () => {
  describe('createOAuthState', () => {
    it('should create a base64url-encoded state string', () => {
      const state = createOAuthState('brand-123', 'user-456', 'twitter')
      expect(typeof state).toBe('string')
      expect(state.length).toBeGreaterThan(0)
      // base64url should not contain + / =
      expect(state).not.toMatch(/[+/=]/)
    })

    it('should produce different state strings each time (nonce)', () => {
      const state1 = createOAuthState('brand-123', 'user-456', 'twitter')
      const state2 = createOAuthState('brand-123', 'user-456', 'twitter')
      expect(state1).not.toBe(state2)
    })
  })

  describe('parseOAuthState', () => {
    it('should round-trip successfully', () => {
      const state = createOAuthState('brand-abc', 'user-def', 'linkedin')
      const parsed = parseOAuthState(state)

      expect(parsed.brandId).toBe('brand-abc')
      expect(parsed.userId).toBe('user-def')
      expect(parsed.platform).toBe('linkedin')
      expect(parsed.nonce).toBeTruthy()
      expect(parsed.timestamp).toBeGreaterThan(0)
    })

    it('should work for all platforms', () => {
      const platforms = ['twitter', 'linkedin', 'reddit'] as const
      for (const platform of platforms) {
        const state = createOAuthState('brand-1', 'user-1', platform)
        const parsed = parseOAuthState(state)
        expect(parsed.platform).toBe(platform)
      }
    })

    it('should throw on malformed encoding', () => {
      expect(() => parseOAuthState('not-valid-base64url!!!')).toThrow('malformed')
    })

    it('should throw on tampered state', () => {
      const state = createOAuthState('brand-1', 'user-1', 'twitter')
      const tampered = 'X' + state.slice(1)
      expect(() => parseOAuthState(tampered)).toThrow()
    })

    it('should throw on expired state (>10 min)', () => {
      // Mock Date.now to create state 11 minutes ago
      const realNow = Date.now
      const pastTime = Date.now() - 11 * 60 * 1000
      Date.now = () => pastTime

      const state = createOAuthState('brand-1', 'user-1', 'twitter')

      Date.now = realNow

      expect(() => parseOAuthState(state)).toThrow('expired')
    })
  })
})
