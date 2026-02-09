'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Brand } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface BrandDetailProps {
  brand: Brand
  canEdit: boolean
  isOwner: boolean
}

export function BrandDetail({ brand, canEdit, isOwner }: BrandDetailProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [name, setName] = useState(brand.name)
  const [description, setDescription] = useState(brand.description || '')
  const [tone, setTone] = useState(brand.settings.tone)
  const [guidelines, setGuidelines] = useState(brand.settings.guidelines)

  const handleSave = async () => {
    setErrorMessage('')
    setIsLoading(true)

    try {
      const response = await fetch(`/api/brands/${brand.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          settings: {
            tone: tone.trim(),
            guidelines: guidelines.trim(),
          },
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setErrorMessage(data.error || 'Failed to update brand')
        setIsLoading(false)
        return
      }

      setIsEditing(false)
      router.refresh()
    } catch {
      setErrorMessage('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this brand? This action cannot be undone.')) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/brands/${brand.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!data.success) {
        setErrorMessage(data.error || 'Failed to delete brand')
        setIsLoading(false)
        return
      }

      router.push('/dashboard/brands')
      router.refresh()
    } catch {
      setErrorMessage('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setName(brand.name)
    setDescription(brand.description || '')
    setTone(brand.settings.tone)
    setGuidelines(brand.settings.guidelines)
    setIsEditing(false)
    setErrorMessage('')
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <Link href="/dashboard/brands" className="text-sm text-muted-foreground hover:text-foreground">
            &larr; Back to Brands
          </Link>
          <h1 className="text-3xl font-bold mt-1">{brand.name}</h1>
        </div>
        {canEdit && !isEditing && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            {isOwner && (
              <Button variant="destructive" onClick={() => setIsDeleting(true)}>
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {isDeleting && (
        <Card className="mb-4 border-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <p className="font-semibold mb-2">
              Are you sure you want to delete this brand?
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              This will permanently delete all brand settings and cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
                {isLoading ? 'Deleting...' : 'Yes, Delete Brand'}
              </Button>
              <Button variant="secondary" onClick={() => setIsDeleting(false)} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        {isEditing ? (
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Brand Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Brand Tone/Voice</Label>
              <Textarea
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                disabled={isLoading}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guidelines">Content Guidelines</Label>
              <Textarea
                id="guidelines"
                value={guidelines}
                onChange={(e) => setGuidelines(e.target.value)}
                disabled={isLoading}
                rows={4}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="secondary" onClick={handleCancel} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </CardContent>
        ) : (
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Brand Details</h3>

            {brand.description && (
              <div className="mb-6">
                <p className="text-sm font-medium mb-1">Description</p>
                <p className="text-sm text-muted-foreground">{brand.description}</p>
              </div>
            )}

            <div className="mb-6">
              <p className="text-sm font-medium mb-1">Tone/Voice</p>
              <p className="text-sm text-muted-foreground">
                {brand.settings.tone || 'Not set'}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium mb-1">Content Guidelines</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {brand.settings.guidelines || 'Not set'}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Members</p>
              <ul className="space-y-1">
                {brand.members.map((member) => (
                  <li key={member.userId} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>{member.userName || member.userEmail || member.userId}</span>
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{member.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
