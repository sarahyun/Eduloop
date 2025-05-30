import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDqEMsgtSyDqUIMK1DDw87ochvxrJpDJa4",
  authDomain: "eduloop-a2108.firebaseapp.com",
  projectId: "eduloop-a2108",
  storageBucket: "eduloop-a2108.firebasestorage.app",
  messagingSenderId: "279270247932",
  appId: "1:279270247932:web:54e64ea8ac5f6d94c77679"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);