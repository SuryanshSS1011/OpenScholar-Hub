import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

// HOC to protect routes that require authentication
export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // Check auth state once loading is complete
      if (!loading && !user) {
        // Store the page they were trying to access
        sessionStorage.setItem('redirectAfterLogin', router.asPath);
        // Redirect to login
        router.push('/auth/signin');
      }
    }, [user, loading, router]);

    // While checking auth state, show loading state
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-700">Loading...</p>
          </div>
        </div>
      );
    }

    // If not authenticated, show nothing (will redirect)
    if (!user) {
      return null;
    }

    // If authenticated, show the protected component
    return <Component {...props} />;
  };
}

// HOC for public routes that should redirect authenticated users
export function withPublicAuth(Component) {
  return function PublicComponent(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // Check if already logged in and if we need to redirect somewhere
      if (!loading && user) {
        // Check if there's a stored redirect path
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin');
          router.push(redirectPath);
        } else {
          // Default redirect to dashboard
          router.push('/dashboard');
        }
      }
    }, [user, loading, router]);

    // Show loading state only briefly or if not already authenticated
    if (loading && !user) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    // If already authenticated, don't show anything (will redirect)
    if (user) {
      return null;
    }

    // If not authenticated and done loading, show the public component
    return <Component {...props} />;
  };
}