// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // ✅ import getAuth

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD8qwF1HCOJkWvX2iowc5MB8fZouevZc2I",
  authDomain: "amanisky-design.firebaseapp.com",
  projectId: "amanisky-design",
  storageBucket: "amanisky-design.firebasestorage.app",
  messagingSenderId: "318046953354",
  appId: "1:318046953354:web:b2e5883bd726a5a0997273",
  measurementId: "G-FN0GRQLXHG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();