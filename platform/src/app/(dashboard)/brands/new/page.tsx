'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function NewBrandPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tone, setTone] = useState('')
  const [guidelines, setGuidelines] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!name.trim()) {
      setErrorMessage('Brand name is required')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          settings: {
            tone: tone.trim() || '',
            guidelines: guidelines.trim() || '',
          },
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setErrorMessage(data.error || 'Failed to create brand')
        setIsLoading(false)
        return
      }

      router.push(`/dashboard/brands/${data.data.id}`)
      router.refresh()
    } catch {
      setErrorMessage('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Create Brand</h1>

      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Brand Name *</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
            placeholder="My Brand"
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
            placeholder="A brief description of your brand..."
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
            placeholder="Professional, friendly, casual..."
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
            placeholder="Guidelines for AI-generated content..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Brand'}
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/dashboard/brands">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
