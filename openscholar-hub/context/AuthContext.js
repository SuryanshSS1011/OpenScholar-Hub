import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
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
      // Don't set error for user-initiated cancellations
      if (error.code !== 'auth/popup-closed-by-user' && 
          error.code !== 'auth/cancelled-popup-request') {
        setError(error.message);
      }
      
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('Sign-in popup was closed by the user');
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.log('Multiple popup requests were triggered');
      } else {
        // Handle other errors
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used
        const email = error.customData?.email;
        // The AuthCredential type that was used
        const credential = GoogleAuthProvider.credentialFromError(error);
        
        console.error(`Error ${errorCode}: ${errorMessage}`);
      }
      
      // We need to re-throw the error to let the component handle it appropriately
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

  // Password reset function
  const resetPassword = async (email) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      setError(error.message);
      console.error('Password reset error:', error);
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