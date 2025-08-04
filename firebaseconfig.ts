import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Enhanced error checking for Firebase configuration
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
] as const;

// Check for missing environment variables and log warnings
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.warn(`Firebase configuration warning: ${varName} is not defined in environment variables.`);
  }
});

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase with proper types
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let googleProvider: GoogleAuthProvider;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Initialize Google provider with additional scopes for better user information
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('profile');
  googleProvider.addScope('email');
  
  // Set custom parameters for better UX
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Re-throw to ensure initialization failures are caught
  throw error;
}

export { auth, db, storage, googleProvider };
export type { FirebaseApp, Auth, Firestore, FirebaseStorage };