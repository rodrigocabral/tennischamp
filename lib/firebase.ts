import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD2Iorp7xvbgEImIbuieWspAe_0yFvz2v4",
  authDomain: "presenca-open.firebaseapp.com",
  projectId: "presenca-open",
  storageBucket: "presenca-open.firebasestorage.app",
  messagingSenderId: "167081822431",
  appId: "1:167081822431:web:3f1055e9af9cb084d6816a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app; 