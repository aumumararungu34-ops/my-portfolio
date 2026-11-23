import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: 'AIzaSyAYZKJtMnXTHRUdiYzrDH4BHyYyFRjhVDQ',
  authDomain: 'my-portfolio-c2bca.firebaseapp.com',
  projectId: 'my-portfolio-c2bca',
  storageBucket: 'my-portfolio-c2bca.firebasestorage.app',
  messagingSenderId: '15398554914',
  appId: '1:15398554914:web:0b1a24ce9ae1340df5a97b',
}

export const firebaseConfigured = Object.values(firebaseConfig).every(Boolean)

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app, 'us-central1')