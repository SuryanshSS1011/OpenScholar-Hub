import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
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

  // Google sign-in function
  const googleSignIn = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // You can access additional user info and tokens here if needed
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info is in result.user
      return result.user;
    } catch (error) {
      setError(error.message);
      // Handle specific errors
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('Sign-in popup was closed by the user');
      }
      if (error.code === 'auth/cancelled-popup-request') {
        console.log('Multiple popup requests were triggered');
      }
      throw error; // Re-throw to allow handling in components
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