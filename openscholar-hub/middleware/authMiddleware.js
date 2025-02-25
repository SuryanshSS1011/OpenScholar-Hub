import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

// Higher Order Component to protect routes that require authentication
export const withAuth = (Component) => {
  const AuthProtected = (props) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // Check authentication state when component mounts
      if (!loading && !user) {
        // Redirect to sign-in if user is not authenticated
        router.push('/auth/signin');
      }
    }, [user, loading, router]);

    // Show loading state while checking authentication
    if (loading) {
      return (
        <div className="min-h-screen flex justify-center items-center bg-gray-50">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-blue-400 h-12 w-12 mb-4"></div>
            <div className="h-4 bg-blue-400 rounded w-48 mb-2"></div>
            <div className="h-3 bg-blue-300 rounded w-32"></div>
          </div>
        </div>
      );
    }
    
    // If authentication check is complete but no user, show nothing
    // (will redirect to sign-in page)
    if (!user) {
      return null;
    }

    // If user is authenticated, render the wrapped component
    return <Component {...props} />;
  };

  // Copy getInitialProps from the wrapped component if it exists
  if (Component.getInitialProps) {
    AuthProtected.getInitialProps = Component.getInitialProps;
  }

  return AuthProtected;
};

// Higher Order Component to redirect authenticated users from pages
// they shouldn't access when logged in (like the sign-in page)
export const withPublicAuth = (Component) => {
  const PublicRoute = (props) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // If user is logged in, redirect to dashboard
      if (!loading && user) {
        router.replace('/dashboard');
      }
    }, [user, loading, router]);

    // Show loading state while checking authentication
    if (loading) {
      return (
        <div className="min-h-screen flex justify-center items-center bg-gray-50">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-blue-400 h-12 w-12 mb-4"></div>
            <div className="h-4 bg-blue-400 rounded w-48 mb-2"></div>
            <div className="h-3 bg-blue-300 rounded w-32"></div>
          </div>
        </div>
      );
    }
    
    // If user is authenticated, show nothing (will redirect)
    if (user) {
      return null;
    }

    // If not authenticated, render the public component
    return <Component {...props} />;
  };

  // Copy getInitialProps from the wrapped component if it exists
  if (Component.getInitialProps) {
    PublicRoute.getInitialProps = Component.getInitialProps;
  }

  return PublicRoute;
};