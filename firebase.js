// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);