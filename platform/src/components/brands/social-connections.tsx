'use client'

import { useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ConnectionCard } from './connection-card'
import { ConnectButton } from './connect-button'
import { platformDisplayName } from './platform-icon'
import type { Brand, SocialPlatform } from '@/types'

const ALL_PLATFORMS: SocialPlatform[] = ['twitter', 'linkedin', 'reddit']

interface SocialConnectionsProps {
  brand: Brand
  canEdit: boolean
}

export function SocialConnections({ brand, canEdit }: SocialConnectionsProps) {
  const searchParams = useSearchParams()
  const connectedPlatform = searchParams.get('connected')
  const errorMessage = searchParams.get('error')

  const connectedPlatforms = new Set(brand.socialConnections.map((c) => c.platform))
  const unconnectedPlatforms = ALL_PLATFORMS.filter((p) => !connectedPlatforms.has(p))

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Social Connections</h3>

      {connectedPlatform && (
        <Alert className="mb-4">
          <AlertDescription>
            Successfully connected {platformDisplayName(connectedPlatform as SocialPlatform)}!
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {brand.socialConnections.length > 0 && (
        <div className="space-y-2 mb-4">
          {brand.socialConnections.map((connection) => (
            <ConnectionCard
              key={`${connection.platform}_${connection.accountId}`}
              connection={connection}
              brandId={brand.id}
              canEdit={canEdit}
            />
          ))}
        </div>
      )}

      {canEdit && unconnectedPlatforms.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            Connect a social account to get started
          </p>
          <div className="flex flex-wrap gap-2">
            {unconnectedPlatforms.map((platform) => (
              <ConnectButton
                key={platform}
                platform={platform}
                brandId={brand.id}
              />
            ))}
          </div>
        </div>
      )}

      {!canEdit && brand.socialConnections.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No social accounts connected. An admin can connect accounts.
        </p>
      )}
    </div>
  )
}
