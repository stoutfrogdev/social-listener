import { createCodeVerifier, getTwitterAuthorizationUrl } from '../providers/twitter'
import { linkedinProvider } from '../providers/linkedin'
import { redditProvider } from '../providers/reddit'

describe('providers', () => {
  describe('twitter', () => {
    describe('createCodeVerifier', () => {
      it('should return codeVerifier and codeChallenge', () => {
        const { codeVerifier, codeChallenge } = createCodeVerifier()
        expect(codeVerifier).toBeTruthy()
        expect(codeChallenge).toBeTruthy()
        expect(typeof codeVerifier).toBe('string')
        expect(typeof codeChallenge).toBe('string')
      })

      it('should produce different verifiers each time', () => {
        const v1 = createCodeVerifier()
        const v2 = createCodeVerifier()
        expect(v1.codeVerifier).not.toBe(v2.codeVerifier)
      })
    })

    describe('getTwitterAuthorizationUrl', () => {
      beforeEach(() => {
        process.env.TWITTER_CLIENT_ID = 'test-twitter-id'
      })

      afterEach(() => {
        delete process.env.TWITTER_CLIENT_ID
      })

      it('should build a valid authorization URL', () => {
        const url = getTwitterAuthorizationUrl(
          'test-state',
          'http://localhost:3000/api/social/callback',
          'test-challenge'
        )
        expect(url).toContain('https://twitter.com/i/oauth2/authorize')
        expect(url).toContain('client_id=test-twitter-id')
        expect(url).toContain('state=test-state')
        expect(url).toContain('code_challenge=test-challenge')
        expect(url).toContain('code_challenge_method=S256')
        expect(url).toContain('response_type=code')
      })

      it('should throw if TWITTER_CLIENT_ID is not set', () => {
        delete process.env.TWITTER_CLIENT_ID
        expect(() =>
          getTwitterAuthorizationUrl('state', 'http://localhost:3000/callback', 'challenge')
        ).toThrow('TWITTER_CLIENT_ID not configured')
      })
    })
  })

  describe('linkedin', () => {
    describe('getAuthorizationUrl', () => {
      beforeEach(() => {
        process.env.LINKEDIN_CLIENT_ID = 'test-linkedin-id'
      })

      afterEach(() => {
        delete process.env.LINKEDIN_CLIENT_ID
      })

      it('should build a valid authorization URL', () => {
        const url = linkedinProvider.getAuthorizationUrl(
          'test-state',
          'http://localhost:3000/api/social/callback'
        )
        expect(url).toContain('https://www.linkedin.com/oauth/v2/authorization')
        expect(url).toContain('client_id=test-linkedin-id')
        expect(url).toContain('state=test-state')
        expect(url).toContain('response_type=code')
      })

      it('should throw if LINKEDIN_CLIENT_ID is not set', () => {
        delete process.env.LINKEDIN_CLIENT_ID
        expect(() =>
          linkedinProvider.getAuthorizationUrl('state', 'http://localhost:3000/callback')
        ).toThrow('LINKEDIN_CLIENT_ID not configured')
      })
    })
  })

  describe('reddit', () => {
    describe('getAuthorizationUrl', () => {
      beforeEach(() => {
        process.env.REDDIT_CLIENT_ID = 'test-reddit-id'
      })

      afterEach(() => {
        delete process.env.REDDIT_CLIENT_ID
      })

      it('should build a valid authorization URL', () => {
        const url = redditProvider.getAuthorizationUrl(
          'test-state',
          'http://localhost:3000/api/social/callback'
        )
        expect(url).toContain('https://www.reddit.com/api/v1/authorize')
        expect(url).toContain('client_id=test-reddit-id')
        expect(url).toContain('state=test-state')
        expect(url).toContain('duration=permanent')
        expect(url).toContain('response_type=code')
      })

      it('should throw if REDDIT_CLIENT_ID is not set', () => {
        delete process.env.REDDIT_CLIENT_ID
        expect(() =>
          redditProvider.getAuthorizationUrl('state', 'http://localhost:3000/callback')
        ).toThrow('REDDIT_CLIENT_ID not configured')
      })
    })
  })
})
