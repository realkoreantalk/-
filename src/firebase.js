import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyACN_fkK12XD7BJ5mMwfm3n2IqPq0wMGVM",
  authDomain: "real-korean-talk.firebaseapp.com",
  projectId: "real-korean-talk",
  storageBucket: "real-korean-talk.firebasestorage.app",
  messagingSenderId: "236722130766",
  appId: "1:236722130766:web:cdf573273bc884ed17d81f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 관리자 UID
export const ADMIN_UID = 'rn5FhcRFPfSCn2blcY4qbAocqUi2';
