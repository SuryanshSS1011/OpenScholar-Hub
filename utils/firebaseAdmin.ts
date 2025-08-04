// @/utils/firebaseAdmin.ts
import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';

let app: App | undefined;

/**
 * Initialize Firebase Admin SDK
 * @returns The Firebase Admin app instance
 */
export function initFirebaseAdmin(): App | undefined {
  if (!admin.apps.length) {
    try {
      // Validate required environment variables
      if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is required');
      }
      
      if (!process.env.FIREBASE_CLIENT_EMAIL) {
        throw new Error('FIREBASE_CLIENT_EMAIL environment variable is required');
      }
      
      if (!process.env.FIREBASE_PRIVATE_KEY) {
        throw new Error('FIREBASE_PRIVATE_KEY environment variable is required');
      }

      const serviceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };

      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
      });

      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Firebase admin initialization error:', error);
      throw error;
    }
  } else {
    // Use the existing app
    app = admin.apps[0] as App;
  }
  
  return app;
}

/**
 * Get the initialized Firebase Admin app
 * @returns The Firebase Admin app instance or undefined if not initialized
 */
export function getFirebaseAdmin(): App | undefined {
  return app || admin.apps[0] as App;
}

/**
 * Check if Firebase Admin is initialized
 * @returns Boolean indicating if Firebase Admin is initialized
 */
export function isFirebaseAdminInitialized(): boolean {
  return admin.apps.length > 0;
}