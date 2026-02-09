'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlatformIcon, platformDisplayName } from './platform-icon'
import type { SocialPlatform } from '@/types'

interface ConnectButtonProps {
  platform: SocialPlatform
  brandId: string
  disabled?: boolean
}

export function ConnectButton({ platform, brandId, disabled }: ConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConnect = async () => {
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/social/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId, platform }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Failed to connect')
        setIsLoading(false)
        return
      }

      // Redirect to provider's authorization page
      window.location.href = data.data.authorizationUrl
    } catch {
      setError('Failed to initiate connection')
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Button
        variant="outline"
        onClick={handleConnect}
        disabled={disabled || isLoading}
        className="flex items-center gap-2"
      >
        <PlatformIcon platform={platform} className="h-4 w-4" />
        {isLoading ? 'Connecting...' : `Connect ${platformDisplayName(platform)}`}
      </Button>
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </div>
  )
}
