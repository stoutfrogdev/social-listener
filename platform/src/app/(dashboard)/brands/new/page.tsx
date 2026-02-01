'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ marginBottom: '2rem' }}>Create Brand</h1>

      {errorMessage && (
        <div className="error" style={{
          padding: '1rem',
          marginBottom: '1rem',
          backgroundColor: '#fff5f5',
          border: '1px solid #dc3545',
          borderRadius: '4px',
        }}>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Brand Name *</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
            placeholder="My Brand"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            rows={3}
            placeholder="A brief description of your brand..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="tone">Brand Tone/Voice</label>
          <textarea
            id="tone"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            disabled={isLoading}
            rows={2}
            placeholder="Professional, friendly, casual..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="guidelines">Content Guidelines</label>
          <textarea
            id="guidelines"
            value={guidelines}
            onChange={(e) => setGuidelines(e.target.value)}
            disabled={isLoading}
            rows={4}
            placeholder="Guidelines for AI-generated content..."
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Brand'}
          </button>
          <Link href="/dashboard/brands" className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
