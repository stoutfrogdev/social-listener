import type { SocialPlatform, SocialProvider } from './types'
import { twitterProvider } from './providers/twitter'
import { linkedinProvider } from './providers/linkedin'
import { redditProvider } from './providers/reddit'

const providers = new Map<SocialPlatform, SocialProvider>()

providers.set('twitter', twitterProvider)
providers.set('linkedin', linkedinProvider)
providers.set('reddit', redditProvider)

export function getProvider(platform: SocialPlatform): SocialProvider {
  const provider = providers.get(platform)
  if (!provider) {
    throw new Error(`Unknown social platform: ${platform}`)
  }
  return provider
}

export function getAllProviders(): SocialProvider[] {
  const result: SocialProvider[] = []
  providers.forEach((provider) => {
    result.push(provider)
  })
  return result
}

export function isConfigured(platform: SocialPlatform): boolean {
  switch (platform) {
    case 'twitter':
      return !!process.env.TWITTER_CLIENT_ID
    case 'linkedin':
      return !!process.env.LINKEDIN_CLIENT_ID && !!process.env.LINKEDIN_CLIENT_SECRET
    case 'reddit':
      return !!process.env.REDDIT_CLIENT_ID && !!process.env.REDDIT_CLIENT_SECRET
    default:
      return false
  }
}
