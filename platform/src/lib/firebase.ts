import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
}

function initFirebaseAdmin() {
  if (getApps().length === 0) {
    return initializeApp(firebaseAdminConfig)
  }
  return getApps()[0]
}

const app = initFirebaseAdmin()
export const db = getFirestore(app)

// Collection references
export const collections = {
  users: db.collection('users'),
  brands: db.collection('brands'),
  queueItems: db.collection('queueItems'),
}

// Helper to convert Firestore timestamp to Date
export function timestampToDate(timestamp: FirebaseFirestore.Timestamp): Date {
  return timestamp.toDate()
}

// Helper to get server timestamp
export function serverTimestamp() {
  return FirebaseFirestore.FieldValue.serverTimestamp()
}

import { FieldValue } from 'firebase-admin/firestore'
export { FieldValue }
