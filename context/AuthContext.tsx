import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  getAdditionalUserInfo,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from '@/firebaseconfig';
import type { Auth } from 'firebase/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { User, UserProfile, AuthContextValue } from '@/types';

// Create the authentication context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Map Firebase error codes to user-friendly messages
const errorMessages: Record<string, string | null> = {
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Invalid email or password. Please try again.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/email-already-in-use': 'This email is already in use. Try signing in instead.',
  'auth/weak-password': 'Password is too weak. Please choose a stronger password.',
  'auth/popup-closed-by-user': null, // Don't show error for user-initiated cancellation
  'auth/cancelled-popup-request': null, // Don't show error for multiple popups
  'auth/unauthorized-domain': 'This domain is not authorized for authentication. Please contact support.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled for this project.',
  'auth/account-exists-with-different-credential': 'An account already exists with the same email address but different sign-in credentials.',
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Firebase instances are properly typed from the config

  // Helper to produce user-friendly error messages
  const handleAuthError = (error: unknown, customMessage = 'Authentication failed. Please try again.'): string => {
    const authError = error as { code?: string; message?: string; customData?: any };
    console.error('Auth error details:', {
      code: authError.code || 'No code',
      message: authError.message || 'No message',
      customData: authError.customData || 'No custom data'
    });
    
    // Get user-friendly message or use default
    const userMessage = errorMessages[authError.code || ''] || customMessage;
    
    // Only set error state if we want to show this error to the user
    if (userMessage !== null) {
      setError(userMessage);
    }
    
    return userMessage; // Pass through for component-level handling
  };

  // Listen for authentication state changes
  useEffect(() => {
    if (!auth) {
      console.error('Auth service not initialized');
      setLoading(false);
      setError('Authentication service unavailable');
      return () => {};
    }
    
    const unsubscribe = onAuthStateChanged(
      auth, 
      (user) => {
        if (user) {
          console.log('User authenticated:', user.uid);
        } else {
          console.log('No user is signed in.');
        }
        setUser(user ? {
          id: user.uid,
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName || undefined,
          photoURL: user.photoURL || undefined,
          emailVerified: user.emailVerified,
          createdAt: user.metadata.creationTime || new Date().toISOString(),
          lastLoginAt: user.metadata.lastSignInTime || undefined,
          metadata: {
            creationTime: user.metadata.creationTime,
            lastSignInTime: user.metadata.lastSignInTime
          }
        } : null);
        setLoading(false);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setError('Authentication monitoring failed. Please refresh the page.');
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Email/Password Sign Up
  const emailSignUp = async (email: string, password: string): Promise<User> => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log(`User ${userCredential.user.email} signed up successfully`);
      return {
        id: userCredential.user.uid,
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        displayName: userCredential.user.displayName || undefined,
        photoURL: userCredential.user.photoURL || undefined,
        emailVerified: userCredential.user.emailVerified,
        createdAt: userCredential.user.metadata.creationTime || new Date().toISOString(),
        lastLoginAt: userCredential.user.metadata.lastSignInTime || undefined,
        metadata: {
          creationTime: userCredential.user.metadata.creationTime,
          lastSignInTime: userCredential.user.metadata.lastSignInTime
        }
      };
    } catch (error) {
      throw handleAuthError(error, 'Failed to create account. Please try again.');
    }
  };

  // Email/Password Sign In
  const emailSignIn = async (email: string, password: string): Promise<User> => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log(`User ${userCredential.user.email} logged in successfully`);
      return {
        id: userCredential.user.uid,
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        displayName: userCredential.user.displayName || undefined,
        photoURL: userCredential.user.photoURL || undefined,
        emailVerified: userCredential.user.emailVerified,
        createdAt: userCredential.user.metadata.creationTime || new Date().toISOString(),
        lastLoginAt: userCredential.user.metadata.lastSignInTime || undefined,
        metadata: {
          creationTime: userCredential.user.metadata.creationTime,
          lastSignInTime: userCredential.user.metadata.lastSignInTime
        }
      };
    } catch (error) {
      throw handleAuthError(error, 'Failed to sign in. Please check your credentials.');
    }
  };

  // Google sign-in function
  const googleSignIn = async (): Promise<User> => {
    setError(null);
    try {
      if (!googleProvider) {
        const error = new Error('Google authentication provider not initialized');
        (error as any).code = 'auth/provider-not-initialized';
        throw error;
      }
      
      console.log('Starting Google sign-in process...');
      const result = await signInWithPopup(auth, googleProvider);
      
      // Get user info and token
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      const isNewUser = getAdditionalUserInfo(result)?.isNewUser;
      
      if (!token) {
        console.warn('Google sign-in succeeded but no access token was returned');
      }
      
      console.log(`User ${result.user.email} ${isNewUser ? 'signed up' : 'logged in'} with Google`);
      return {
        id: result.user.uid,
        uid: result.user.uid,
        email: result.user.email!,
        displayName: result.user.displayName || undefined,
        photoURL: result.user.photoURL || undefined,
        emailVerified: result.user.emailVerified,
        createdAt: result.user.metadata.creationTime || new Date().toISOString(),
        lastLoginAt: result.user.metadata.lastSignInTime || undefined,
        metadata: {
          creationTime: result.user.metadata.creationTime,
          lastSignInTime: result.user.metadata.lastSignInTime
        }
      };
    } catch (error) {
      // Special handling for network errors which might not have a code
      const authError = error as { code?: string; message?: string };
      if (!authError.code && authError.message && authError.message.includes('network')) {
        handleAuthError({
          code: 'auth/network-error',
          message: authError.message
        }, 'Network error. Please check your internet connection and try again.');
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      // Handle all other errors
      throw handleAuthError(error, 'Failed to sign in with Google. Please try again.');
    }
  };

  // Sign out function
  const logout = async (): Promise<void> => {
    setError(null);
    try {
      if (!auth) {
        throw new Error('Auth service not initialized');
      }
      
      await signOut(auth);
    } catch (error) {
      const authError = error as { code?: string; message?: string };
      const errorMessage = authError.code ? authError.message : String(error);
      setError('Failed to sign out. Please try again.');
      console.error('Sign out error:', errorMessage);
      throw error;
    }
  };

  // Password reset function
  const resetPassword = async (email: string): Promise<boolean> => {
    setError(null);
    try {
      if (!auth) {
        throw new Error('Auth service not initialized');
      }
      
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      throw handleAuthError(error, 'Failed to send password reset email. Please try again.');
    }
  };

  // Create a user profile function (can be extended later)
  const updateUserProfile = async (profile: Partial<UserProfile>): Promise<void> => {
    // This is a placeholder for future functionality
    console.log('Updating user profile:', profile);
  };

  // Provide the auth context value
  const value: AuthContextValue = {
    user,
    loading,
    error,
    emailSignUp,
    emailSignIn,
    googleSignIn,
    resetPassword,
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};