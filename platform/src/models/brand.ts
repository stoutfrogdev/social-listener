import { collections, FieldValue } from '@/lib/firebase'
import type { Brand, CreateBrandInput, UpdateBrandInput, BrandMember } from '@/types'

export async function createBrand(ownerId: string, input: CreateBrandInput): Promise<Brand> {
  const now = new Date()

  const brandData = {
    name: input.name,
    description: input.description || null,
    ownerId,
    members: [{
      userId: ownerId,
      role: 'owner',
      addedAt: FieldValue.serverTimestamp(),
    }],
    settings: {
      tone: input.settings?.tone || '',
      guidelines: input.settings?.guidelines || '',
      ...input.settings,
    },
    socialConnections: [],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }

  const docRef = await collections.brands.add(brandData)

  return {
    id: docRef.id,
    name: brandData.name,
    description: input.description,
    ownerId,
    members: [{
      userId: ownerId,
      role: 'owner',
      addedAt: now,
    }],
    settings: {
      tone: brandData.settings.tone,
      guidelines: brandData.settings.guidelines,
    },
    socialConnections: [],
    createdAt: now,
    updatedAt: now,
  }
}

export async function getBrandById(id: string): Promise<Brand | null> {
  const doc = await collections.brands.doc(id).get()

  if (!doc.exists) {
    return null
  }

  return docToBrand(doc)
}

export async function getBrandsByUserId(userId: string): Promise<Brand[]> {
  // Get brands where user is owner
  const ownerSnapshot = await collections.brands
    .where('ownerId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get()

  // Get brands where user is a member
  const memberSnapshot = await collections.brands
    .where('members', 'array-contains', { userId })
    .orderBy('createdAt', 'desc')
    .get()

  const brandMap = new Map<string, Brand>()

  ownerSnapshot.docs.forEach(doc => {
    brandMap.set(doc.id, docToBrand(doc))
  })

  memberSnapshot.docs.forEach(doc => {
    if (!brandMap.has(doc.id)) {
      brandMap.set(doc.id, docToBrand(doc))
    }
  })

  return Array.from(brandMap.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )
}

export async function updateBrand(id: string, input: UpdateBrandInput): Promise<Brand | null> {
  const docRef = collections.brands.doc(id)
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
  if (input.description !== undefined) {
    updateData.description = input.description
  }
  if (input.settings !== undefined) {
    const currentData = doc.data()!
    updateData.settings = {
      ...currentData.settings,
      ...input.settings,
    }
  }

  await docRef.update(updateData)

  return getBrandById(id)
}

export async function deleteBrand(id: string): Promise<boolean> {
  const docRef = collections.brands.doc(id)
  const doc = await docRef.get()

  if (!doc.exists) {
    return false
  }

  await docRef.delete()
  return true
}

export async function userCanAccessBrand(userId: string, brandId: string): Promise<boolean> {
  const brand = await getBrandById(brandId)

  if (!brand) {
    return false
  }

  if (brand.ownerId === userId) {
    return true
  }

  return brand.members.some(member => member.userId === userId)
}

export async function userCanEditBrand(userId: string, brandId: string): Promise<boolean> {
  const brand = await getBrandById(brandId)

  if (!brand) {
    return false
  }

  if (brand.ownerId === userId) {
    return true
  }

  const member = brand.members.find(m => m.userId === userId)
  return member?.role === 'admin' || member?.role === 'owner'
}

export async function addBrandMember(
  brandId: string,
  userId: string,
  role: BrandMember['role']
): Promise<Brand | null> {
  const docRef = collections.brands.doc(brandId)
  const doc = await docRef.get()

  if (!doc.exists) {
    return null
  }

  await docRef.update({
    members: FieldValue.arrayUnion({
      userId,
      role,
      addedAt: new Date(),
    }),
    updatedAt: FieldValue.serverTimestamp(),
  })

  return getBrandById(brandId)
}

export async function removeBrandMember(brandId: string, userId: string): Promise<Brand | null> {
  const brand = await getBrandById(brandId)

  if (!brand) {
    return null
  }

  // Cannot remove owner
  if (brand.ownerId === userId) {
    return null
  }

  const memberToRemove = brand.members.find(m => m.userId === userId)

  if (!memberToRemove) {
    return brand
  }

  const docRef = collections.brands.doc(brandId)
  await docRef.update({
    members: FieldValue.arrayRemove(memberToRemove),
    updatedAt: FieldValue.serverTimestamp(),
  })

  return getBrandById(brandId)
}

// Helper function to convert Firestore doc to Brand
function docToBrand(doc: FirebaseFirestore.DocumentSnapshot): Brand {
  const data = doc.data()!

  return {
    id: doc.id,
    name: data.name,
    description: data.description || undefined,
    ownerId: data.ownerId,
    members: (data.members || []).map((m: Record<string, unknown>) => ({
      userId: m.userId as string,
      role: m.role as BrandMember['role'],
      addedAt: m.addedAt?.toDate?.() || new Date(),
    })),
    settings: {
      tone: data.settings?.tone || '',
      guidelines: data.settings?.guidelines || '',
      ...data.settings,
    },
    socialConnections: (data.socialConnections || []).map((sc: Record<string, unknown>) => ({
      platform: sc.platform as string,
      accountId: sc.accountId as string,
      accountName: sc.accountName as string,
      enabled: sc.enabled as boolean,
      connectedAt: sc.connectedAt?.toDate?.() || new Date(),
    })),
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  }
}
