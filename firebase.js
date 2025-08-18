// Import the functions you need from the Firebase SDK
import { initializeApp } from "firebase/app";              // ✅ Creates the Firebase app instance
import { getAnalytics } from "firebase/analytics";         // ✅ Enables Google Analytics for tracking
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // ✅ Authentication (email/password, Google sign-in, etc.)
import { getFirestore } from "firebase/firestore";         // ✅ Firestore database access

// TODO: You can also import other Firebase SDKs you need later
// Docs: https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// (These keys tell Firebase which project to connect to)
const firebaseConfig = {
  apiKey: "AIzaSyD8qwF1HCOJkWvX2iowc5MB8fZouevZc2I",             // Identifies your app to Firebase services
  authDomain: "amanisky-design.firebaseapp.com",                // Used for authentication (OAuth redirect domain)
  projectId: "amanisky-design",                                  // Unique project ID in Firebase
  storageBucket: "amanisky-design.firebasestorage.app",          // Storage location for files/images
  messagingSenderId: "318046953354",                             // Used for Firebase Cloud Messaging
  appId: "1:318046953354:web:b2e5883bd726a5a0997273",             // Unique ID for this Firebase app instance
  measurementId: "G-FN0GRQLXHG"                                  // Google Analytics tracking ID (optional)
};

// 1️⃣ Initialize Firebase with the config object
const app = initializeApp(firebaseConfig);

// 2️⃣ Initialize Analytics for tracking (optional but useful)
const analytics = getAnalytics(app);

// 3️⃣ Initialize Firestore database
const fireStore = getFirestore(app);

// 4️⃣ Initialize Authentication service
export const auth = getAuth(app);                 // Export so other files can use it

// 5️⃣ Set up Google Authentication Provider for "Sign in with Google"
export const googleProvider = new GoogleAuthProvider();

// 6️⃣ Export Firestore database reference so other files can use it
export const db = fireStore;
