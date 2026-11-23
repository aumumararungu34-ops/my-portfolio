import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { beforeUserCreated, HttpsError as IdentityError } from 'firebase-functions/v2/identity'
import { HttpsError, onCall } from 'firebase-functions/v2/https'

initializeApp()

const auth = getAuth()
const db = getFirestore()
const adminSetupRef = db.doc('system/adminSetup')

export const blockDirectSignUps = beforeUserCreated(() => {
  throw new IdentityError('permission-denied', 'Account creation is disabled for this portfolio.')
})

export const activateSingleAdmin = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in with the Firebase account first.')
  }

  const users = await auth.listUsers(2)
  if (users.users.length !== 1 || users.users[0].uid !== request.auth.uid) {
    throw new HttpsError(
      'permission-denied',
      'Admin access is enabled only when this is the only Firebase Authentication account.',
    )
  }

  const account = users.users[0]
  const reserved = await db.runTransaction(async (transaction) => {
    const setup = await transaction.get(adminSetupRef)
    if (setup.exists) {
      const saved = setup.data()
      return saved.uid === account.uid
        || (saved.status === 'claiming' && saved.email === account.email)
    }

    transaction.create(adminSetupRef, {
      email: account.email,
      uid: account.uid,
      status: 'claiming',
      createdAt: FieldValue.serverTimestamp(),
    })
    return true
  })

  if (!reserved) {
    throw new HttpsError('permission-denied', 'Admin access has already been assigned to a different account.')
  }

  if (account.customClaims?.admin !== true) {
    await auth.setCustomUserClaims(account.uid, {
      ...account.customClaims,
      admin: true,
    })
  }

  await adminSetupRef.set({
    email: account.email,
    uid: account.uid,
    status: 'complete',
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true })

  return { admin: true }
})
