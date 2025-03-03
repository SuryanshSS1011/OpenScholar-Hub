import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  GoogleAuthProvider,
  getAdditionalUserInfo
} from 'firebase/auth';
import { auth, googleProvider } from '@/firebaseconfig';

// Create the authentication context
const AuthContext = createContext();

// Map Firebase error codes to user-friendly messages
const errorMessages = {
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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to produce user-friendly error messages
  const handleAuthError = (error, customMessage = 'Authentication failed. Please try again.') => {
    console.error('Auth error details:', {
      code: error.code,
      message: error.message,
      customData: error.customData || 'No custom data'
    });
    
    // Get user-friendly message or use default
    const userMessage = errorMessages[error.code] || customMessage;
    
    // Only set error state if we want to show this error to the user
    if (userMessage !== null) {
      setError(userMessage);
    }
    
    return error; // Pass through for component-level handling
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
        setUser(user);
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
  const emailSignUp = async (email, password) => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log(`User ${userCredential.user.email} signed up successfully`);
      return userCredential.user;
    } catch (error) {
      throw handleAuthError(error, 'Failed to create account. Please try again.');
    }
  };

  // Email/Password Sign In
  const emailSignIn = async (email, password) => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log(`User ${userCredential.user.email} logged in successfully`);
      return userCredential.user;
    } catch (error) {
      throw handleAuthError(error, 'Failed to sign in. Please check your credentials.');
    }
  };

  // Google sign-in function
  const googleSignIn = async () => {
    setError(null);
    try {
      if (!googleProvider) {
        throw new Error({code: 'auth/provider-not-initialized', message: 'Google authentication provider not initialized'});
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
      return result.user;
    } catch (error) {
      // Special handling for network errors which might not have a code
      if (!error.code && error.message && error.message.includes('network')) {
        return handleAuthError({
          code: 'auth/network-error',
          message: error.message
        }, 'Network error. Please check your internet connection and try again.');
      }
      
      // Handle all other errors
      throw handleAuthError(error, 'Failed to sign in with Google. Please try again.');
    }
  };

  // Sign out function
  const logout = async () => {
    setError(null);
    try {
      if (!auth) {
        throw new Error('Auth service not initialized');
      }
      
      await signOut(auth);
    } catch (error) {
      const errorMessage = error.code ? error.message : error.toString();
      setError('Failed to sign out. Please try again.');
      console.error('Sign out error:', errorMessage);
      throw error;
    }
  };

  // Password reset function
  const resetPassword = async (email) => {
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
  const updateUserProfile = async (profile) => {
    // This is a placeholder for future functionality
    console.log('Updating user profile:', profile);
  };

  // Provide the auth context value
  const value = {
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
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};