import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD9VBu3IAyRWitlR4hPejhC9s-J57AH82Q",
  authDomain: "metria-fcbbc.firebaseapp.com",
  projectId: "metria-fcbbc",
  storageBucket: "metria-fcbbc.firebasestorage.app",
  messagingSenderId: "55755848255",
  appId: "1:55755848255:web:2ac180e2ed3c83d714168a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;