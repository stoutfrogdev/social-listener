import { collections, FieldValue } from '@/lib/firebase'
import type { User, CreateUserInput, UpdateUserInput } from '@/types'
import { hash, compare } from 'bcryptjs'

const SALT_ROUNDS = 12

export async function createUser(input: CreateUserInput): Promise<User> {
  const passwordHash = await hash(input.password, SALT_ROUNDS)

  const now = new Date()
  const userData = {
    email: input.email.toLowerCase(),
    name: input.name,
    image: input.image || null,
    passwordHash,
    emailVerified: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }

  const docRef = await collections.users.add(userData)

  return {
    id: docRef.id,
    email: userData.email,
    name: userData.name,
    image: input.image,
    createdAt: now,
    updatedAt: now,
  }
}

export async function getUserById(id: string): Promise<User | null> {
  const doc = await collections.users.doc(id).get()

  if (!doc.exists) {
    return null
  }

  const data = doc.data()!
  return {
    id: doc.id,
    email: data.email,
    name: data.name,
    image: data.image || undefined,
    emailVerified: data.emailVerified?.toDate(),
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const snapshot = await collections.users
    .where('email', '==', email.toLowerCase())
    .limit(1)
    .get()

  if (snapshot.empty) {
    return null
  }

  const doc = snapshot.docs[0]
  const data = doc.data()

  return {
    id: doc.id,
    email: data.email,
    name: data.name,
    image: data.image || undefined,
    emailVerified: data.emailVerified?.toDate(),
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  }
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<User | null> {
  const docRef = collections.users.doc(id)
  const doc = await docRef.get()

  if (!doc.exists) {
    return null
  }

  const updateData: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  }

  if (input.name !== undefined) {
    updateData.name = input.name
  }
  if (input.image !== undefined) {
    updateData.image = input.image
  }

  await docRef.update(updateData)

  return getUserById(id)
}

export async function deleteUser(id: string): Promise<boolean> {
  const docRef = collections.users.doc(id)
  const doc = await docRef.get()

  if (!doc.exists) {
    return false
  }

  await docRef.delete()
  return true
}

export async function verifyPassword(email: string, password: string): Promise<User | null> {
  const snapshot = await collections.users
    .where('email', '==', email.toLowerCase())
    .limit(1)
    .get()

  if (snapshot.empty) {
    return null
  }

  const doc = snapshot.docs[0]
  const data = doc.data()

  if (!data.passwordHash) {
    return null
  }

  const isValid = await compare(password, data.passwordHash)

  if (!isValid) {
    return null
  }

  return {
    id: doc.id,
    email: data.email,
    name: data.name,
    image: data.image || undefined,
    emailVerified: data.emailVerified?.toDate(),
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  }
}

export async function emailExists(email: string): Promise<boolean> {
  const snapshot = await collections.users
    .where('email', '==', email.toLowerCase())
    .limit(1)
    .get()

  return !snapshot.empty
}
