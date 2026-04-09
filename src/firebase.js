import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, serverTimestamp } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
const firebaseConfig = {
  apiKey: 'AIzaSyAF75Xgfg7uZJnSrhWBv5fXA41rgV_tms8',
  authDomain: 'ertadih-store.firebaseapp.com',
  projectId: 'ertadih-store',
  storageBucket: 'ertadih-store.firebasestorage.app',
  messagingSenderId: '762370033757',
  appId: '1:762370033757:web:9dead45ecc0cf44afb65b4',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export { serverTimestamp }