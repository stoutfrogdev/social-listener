import { Twitter, Linkedin, MessageCircle } from 'lucide-react'
import type { SocialPlatform } from '@/types'

interface PlatformIconProps {
  platform: SocialPlatform
  className?: string
}

export function PlatformIcon({ platform, className }: PlatformIconProps) {
  switch (platform) {
    case 'twitter':
      return <Twitter className={className} />
    case 'linkedin':
      return <Linkedin className={className} />
    case 'reddit':
      return <MessageCircle className={className} />
    default:
      return null
  }
}

export function platformDisplayName(platform: SocialPlatform): string {
  switch (platform) {
    case 'twitter':
      return 'Twitter / X'
    case 'linkedin':
      return 'LinkedIn'
    case 'reddit':
      return 'Reddit'
    default:
      return platform
  }
}
