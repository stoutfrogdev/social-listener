'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Brand } from '@/types'

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <Link href="/dashboard/brands" style={{ color: '#666', fontSize: '0.875rem' }}>
            ← Back to Brands
          </Link>
          <h1 style={{ marginTop: '0.5rem' }}>{brand.name}</h1>
        </div>
        {canEdit && !isEditing && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-secondary"
            >
              Edit
            </button>
            {isOwner && (
              <button
                onClick={() => setIsDeleting(true)}
                className="btn btn-danger"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

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

      {isDeleting && (
        <div className="card" style={{ marginBottom: '1rem', backgroundColor: '#fff5f5', borderColor: '#dc3545' }}>
          <p style={{ marginBottom: '1rem' }}>
            <strong>Are you sure you want to delete this brand?</strong>
          </p>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            This will permanently delete all brand settings and cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleDelete}
              className="btn btn-danger"
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Yes, Delete Brand'}
            </button>
            <button
              onClick={() => setIsDeleting(false)}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="card">
        {isEditing ? (
          <>
            <div className="form-group">
              <label htmlFor="name">Brand Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
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
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                onClick={handleSave}
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 style={{ marginBottom: '1rem' }}>Brand Details</h3>

            {brand.description && (
              <div style={{ marginBottom: '1.5rem' }}>
                <strong>Description</strong>
                <p style={{ color: '#666', marginTop: '0.25rem' }}>{brand.description}</p>
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <strong>Tone/Voice</strong>
              <p style={{ color: '#666', marginTop: '0.25rem' }}>
                {brand.settings.tone || 'Not set'}
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <strong>Content Guidelines</strong>
              <p style={{ color: '#666', marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>
                {brand.settings.guidelines || 'Not set'}
              </p>
            </div>

            <div>
              <strong>Members</strong>
              <ul style={{ marginTop: '0.5rem', color: '#666' }}>
                {brand.members.map((member) => (
                  <li key={member.userId}>
                    {member.userId} ({member.role})
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Social Connections</h3>
        {brand.socialConnections.length === 0 ? (
          <p style={{ color: '#666' }}>
            No social accounts connected yet. This feature will be available in a future update.
          </p>
        ) : (
          <ul>
            {brand.socialConnections.map((connection) => (
              <li key={connection.accountId}>
                {connection.platform}: {connection.accountName}
                {connection.enabled ? ' (Active)' : ' (Disabled)'}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
