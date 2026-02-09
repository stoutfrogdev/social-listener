'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlatformIcon, platformDisplayName } from './platform-icon'
import { formatDate } from '@/lib/utils'
import type { SocialConnection } from '@/types'

interface ConnectionCardProps {
  connection: SocialConnection
  brandId: string
  canEdit: boolean
}

export function ConnectionCard({ connection, brandId, canEdit }: ConnectionCardProps) {
  const router = useRouter()
  const [isToggling, setIsToggling] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const connectionId = `${brandId}_${connection.platform}_${connection.accountId}`

  const handleToggle = async () => {
    setIsToggling(true)
    try {
      const response = await fetch(`/api/social/connections/${connectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !connection.enabled }),
      })
      const data = await response.json()
      if (data.success) {
        router.refresh()
      }
    } catch {
      // Silent fail — user will see state hasn't changed
    } finally {
      setIsToggling(false)
    }
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      const response = await fetch(`/api/social/connections/${connectionId}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (data.success) {
        router.refresh()
      }
    } catch {
      // Silent fail
    } finally {
      setIsDisconnecting(false)
      setShowConfirm(false)
    }
  }

  const statusBadge = connection.tokenStatus === 'expired'
    ? 'bg-yellow-100 text-yellow-800'
    : connection.tokenStatus === 'revoked'
    ? 'bg-red-100 text-red-800'
    : connection.enabled
    ? 'bg-green-100 text-green-800'
    : 'bg-gray-100 text-gray-600'

  const statusText = connection.tokenStatus === 'expired'
    ? 'Token Expired'
    : connection.tokenStatus === 'revoked'
    ? 'Revoked'
    : connection.enabled
    ? 'Active'
    : 'Disabled'

  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PlatformIcon platform={connection.platform} className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {connection.displayName || connection.accountName}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge}`}>
                  {statusText}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {platformDisplayName(connection.platform)}
                {connection.accountName !== connection.displayName && connection.displayName && (
                  <> &middot; {connection.accountName}</>
                )}
                {' '}&middot; Connected {formatDate(connection.connectedAt)}
              </div>
            </div>
          </div>

          {canEdit && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggle}
                disabled={isToggling}
              >
                {isToggling ? '...' : connection.enabled ? 'Disable' : 'Enable'}
              </Button>

              {showConfirm ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDisconnect}
                    disabled={isDisconnecting}
                  >
                    {isDisconnecting ? '...' : 'Confirm'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirm(false)}
                    disabled={isDisconnecting}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setShowConfirm(true)}
                >
                  Disconnect
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
