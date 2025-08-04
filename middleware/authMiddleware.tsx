import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { ComponentType } from 'react';

// Server-side auth middleware for API routes
export function authMiddleware(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // For now, we'll implement a basic middleware
    // In a real app, you'd validate JWT tokens or session cookies here
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // For development, we'll skip auth validation
      // In production, uncomment the next line:
      // return res.status(401).json({ error: 'Unauthorized: No valid token provided' });
    }

    // Extract token and validate (this is a placeholder implementation)
    if (authHeader) {
      const token = authHeader.substring(7);
      if (!token) {
        // For development, we'll skip auth validation
        // In production, uncomment the next line:
        // return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }
    }

    // In a real implementation, you would:
    // 1. Verify the Firebase ID token
    // 2. Add user info to req object
    // For now, we'll just continue
    
    return handler(req, res);
  };
}

// HOC to protect routes that require authentication
export function withAuth<P extends object>(Component: ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
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
export function withPublicAuth<P extends object>(Component: ComponentType<P>) {
  return function PublicComponent(props: P) {
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