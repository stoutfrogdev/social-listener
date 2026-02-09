import { collections, FieldValue } from '@/lib/firebase'
import type { Brand, CreateBrandInput, UpdateBrandInput, BrandMember } from '@/types'

export async function createBrand(
  ownerId: string,
  ownerName: string,
  ownerEmail: string,
  input: CreateBrandInput
): Promise<Brand> {
  const brandData = {
    name: input.name,
    description: input.description || null,
    ownerId,
    members: [{
      userId: ownerId,
      userName: ownerName,
      userEmail: ownerEmail,
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

  // Re-read the document to get actual server timestamps
  const doc = await docRef.get()
  return docToBrand(doc)
}

export async function getBrandById(id: string): Promise<Brand | null> {
  const doc = await collections.brands.doc(id).get()

  if (!doc.exists) {
    return null
  }

  return docToBrand(doc)
}

export async function getBrandsByUserId(userId: string): Promise<Brand[]> {
  // Run both queries in parallel instead of sequentially
  const [ownerSnapshot, memberSnapshot] = await Promise.all([
    collections.brands
      .where('ownerId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get(),
    collections.brands
      .where('members', 'array-contains', { userId })
      .orderBy('createdAt', 'desc')
      .get(),
  ])

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

/**
 * Check if a user can access (view) a brand.
 * Accepts an optional pre-fetched brand to avoid redundant Firestore reads.
 */
export async function userCanAccessBrand(
  userId: string,
  brandId: string,
  existingBrand?: Brand | null
): Promise<boolean> {
  const brand = existingBrand ?? await getBrandById(brandId)

  if (!brand) {
    return false
  }

  if (brand.ownerId === userId) {
    return true
  }

  return brand.members.some(member => member.userId === userId)
}

/**
 * Check if a user can edit a brand.
 * Accepts an optional pre-fetched brand to avoid redundant Firestore reads.
 */
export async function userCanEditBrand(
  userId: string,
  brandId: string,
  existingBrand?: Brand | null
): Promise<boolean> {
  const brand = existingBrand ?? await getBrandById(brandId)

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
  userName: string,
  userEmail: string,
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
      userName,
      userEmail,
      role,
      addedAt: FieldValue.serverTimestamp(),
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
      userName: (m.userName as string) || undefined,
      userEmail: (m.userEmail as string) || undefined,
      role: m.role as BrandMember['role'],
      addedAt: (m.addedAt as { toDate?: () => Date })?.toDate?.() || new Date(),
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
      displayName: (sc.displayName as string) || undefined,
      profileUrl: (sc.profileUrl as string) || undefined,
      avatarUrl: (sc.avatarUrl as string) || undefined,
      enabled: sc.enabled as boolean,
      connectedBy: (sc.connectedBy as string) || undefined,
      connectedAt: (sc.connectedAt as { toDate?: () => Date })?.toDate?.() || new Date(),
      tokenStatus: (sc.tokenStatus as string) || undefined,
    })),
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  }
}
