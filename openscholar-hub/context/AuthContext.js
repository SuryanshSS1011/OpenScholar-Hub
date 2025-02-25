// @/context/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleProvider } from '@/firebaseconfig';

// Create the authentication context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth, 
      (user) => {
        setUser(user);
        setLoading(false); // Set loading to false when auth state is determined
      },
      (error) => {
        console.error('Auth state change error:', error);
        setError(error.message);
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
      const errorCode = error.code;
      const errorMessage = error.message;
      setError(errorMessage);
      console.error(`Error ${errorCode}: ${errorMessage}`);
      throw error;
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
      const errorCode = error.code;
      const errorMessage = error.message;
      setError(errorMessage);
      console.error(`Error ${errorCode}: ${errorMessage}`);
      throw error;
    }
  };

  // Google sign-in function
  const googleSignIn = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Get the Google Access Token to access the Google API
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      console.log(`User ${result.user.email} logged in with Google`);
      return result.user;
    } catch (error) {
      setError(error.message);
      const errorCode = error.code;
      const errorMessage = error.message;
      
      // Handle specific errors
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('Sign-in popup was closed by the user');
      }
      if (error.code === 'auth/cancelled-popup-request') {
        console.log('Multiple popup requests were triggered');
      }
      
      // The email of the user's account used
      const email = error.customData?.email;
      // The AuthCredential type that was used
      const credential = GoogleAuthProvider.credentialFromError(error);
      
      console.error(`Error ${errorCode}: ${errorMessage}`);
      throw error;
    }
  };

  // Sign out function
  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (error) {
      setError(error.message);
      console.error('Sign out error:', error);
      throw error;
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