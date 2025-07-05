// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyA3wEPitdPeEMvE8ioo7jB5H5FK4156I2I",
  authDomain: "my-bucket-list-12a15.firebaseapp.com",
  projectId: "my-bucket-list-12a15",
  storageBucket: "my-bucket-list-12a15.firebasestorage.appspot.com",
  messagingSenderId: "545053036437",
  appId: "1:545053036437:web:bd53927d9b1127a14cf09c",
  measurementId: "G-9XNKVK1YR8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
const db = getFirestore(app);
export { db };
export default app;