import { encrypt, decrypt } from '../encryption'

// Set a test encryption key (64 hex chars = 32 bytes)
const TEST_KEY = 'a'.repeat(64)

beforeAll(() => {
  process.env.SOCIAL_TOKEN_ENCRYPTION_KEY = TEST_KEY
})

afterAll(() => {
  delete process.env.SOCIAL_TOKEN_ENCRYPTION_KEY
})

describe('encryption', () => {
  describe('encrypt', () => {
    it('should return ciphertext, iv, and authTag', () => {
      const result = encrypt('test-token')
      expect(result.ciphertext).toBeTruthy()
      expect(result.iv).toBeTruthy()
      expect(result.authTag).toBeTruthy()
    })

    it('should produce different ciphertext for same input (random IV)', () => {
      const result1 = encrypt('same-input')
      const result2 = encrypt('same-input')
      expect(result1.ciphertext).not.toBe(result2.ciphertext)
      expect(result1.iv).not.toBe(result2.iv)
    })
  })

  describe('decrypt', () => {
    it('should decrypt back to original plaintext', () => {
      const original = 'my-secret-access-token-12345'
      const encrypted = encrypt(original)
      const decrypted = decrypt(encrypted)
      expect(decrypted).toBe(original)
    })

    it('should handle empty string', () => {
      const encrypted = encrypt('')
      const decrypted = decrypt(encrypted)
      expect(decrypted).toBe('')
    })

    it('should handle unicode characters', () => {
      const original = 'token-with-unicode-\u00e9\u00e8\u00ea'
      const encrypted = encrypt(original)
      const decrypted = decrypt(encrypted)
      expect(decrypted).toBe(original)
    })

    it('should handle long strings', () => {
      const original = 'x'.repeat(10000)
      const encrypted = encrypt(original)
      const decrypted = decrypt(encrypted)
      expect(decrypted).toBe(original)
    })

    it('should throw on tampered ciphertext', () => {
      const encrypted = encrypt('test')
      encrypted.ciphertext = 'ff' + encrypted.ciphertext.slice(2)
      expect(() => decrypt(encrypted)).toThrow()
    })

    it('should throw on tampered authTag', () => {
      const encrypted = encrypt('test')
      encrypted.authTag = 'ff' + encrypted.authTag.slice(2)
      expect(() => decrypt(encrypted)).toThrow()
    })
  })

  describe('key validation', () => {
    it('should throw if encryption key is not set', () => {
      const originalKey = process.env.SOCIAL_TOKEN_ENCRYPTION_KEY
      delete process.env.SOCIAL_TOKEN_ENCRYPTION_KEY
      expect(() => encrypt('test')).toThrow('SOCIAL_TOKEN_ENCRYPTION_KEY environment variable is not set')
      process.env.SOCIAL_TOKEN_ENCRYPTION_KEY = originalKey
    })

    it('should throw if encryption key is wrong length', () => {
      const originalKey = process.env.SOCIAL_TOKEN_ENCRYPTION_KEY
      process.env.SOCIAL_TOKEN_ENCRYPTION_KEY = 'too-short'
      expect(() => encrypt('test')).toThrow('SOCIAL_TOKEN_ENCRYPTION_KEY must be 64 hex characters')
      process.env.SOCIAL_TOKEN_ENCRYPTION_KEY = originalKey
    })
  })
})
