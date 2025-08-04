// @/utils/apiMiddleware.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { initFirebaseAdmin } from './firebaseAdmin';
import type { ApiError } from '@/types';

// Extend NextApiRequest to include user information
interface AuthenticatedRequest extends NextApiRequest {
  user?: DecodedIdToken;
}

// Handler type for API routes
type ApiHandler = (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void | NextApiResponse>;

// Options for authentication middleware
interface AuthOptions {
  requireAuth: boolean;
}

// Rate limiting options
interface RateLimitOptions {
  limit: number;
  window: number;
}

// Rate limit data structure
interface RateLimitData {
  count: number;
  reset: number;
}

/**
 * Middleware to verify Firebase authentication for API routes
 * Some routes may be public, others may require authentication
 */
export const withApiAuth = (
  handler: ApiHandler, 
  options: AuthOptions = { requireAuth: false }
): ApiHandler => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    // Initialize Firebase Admin if it hasn't been initialized
    initFirebaseAdmin();
    
    // For routes that don't require authentication, proceed directly
    if (!options.requireAuth) {
      return handler(req, res);
    }
    
    // For routes that require authentication, verify the token
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const error: ApiError = { 
          message: 'Unauthorized: Missing or invalid authentication token',
          status: 401
        };
        return res.status(401).json({ error: error.message });
      }
      
      const token = authHeader.split('Bearer ')[1];
      
      if (!token) {
        const error: ApiError = { 
          message: 'Unauthorized: Missing token',
          status: 401
        };
        return res.status(401).json({ error: error.message });
      }
      
      try {
        // Verify the token with Firebase Admin
        const decodedToken = await getAuth().verifyIdToken(token);
        
        // Add the user information to the request object
        req.user = decodedToken;
        
        // Proceed to the handler
        return handler(req, res);
      } catch (error) {
        console.error('Error verifying authentication token:', error);
        const authError: ApiError = { 
          message: 'Unauthorized: Invalid token',
          status: 401
        };
        return res.status(401).json({ error: authError.message });
      }
    } catch (error) {
      console.error('Authentication middleware error:', error);
      const serverError: ApiError = { 
        message: 'Internal server error',
        status: 500
      };
      return res.status(500).json({ error: serverError.message });
    }
  };
};

/**
 * Rate limiting middleware for API routes
 * Prevents abuse by limiting the number of requests per time period
 */
export const withRateLimit = (
  handler: ApiHandler, 
  options: RateLimitOptions = { limit: 100, window: 60000 }
): ApiHandler => {
  // Simple in-memory store for rate limiting
  // In production, use a more robust solution like Redis
  const rateLimit = new Map<string, RateLimitData>();
  
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const ip = (req.headers['x-forwarded-for'] as string) || 
              (req.socket.remoteAddress as string) || 
              '127.0.0.1';
    const now = Date.now();
    
    // Get existing rate limit data for this IP
    const rateLimitData = rateLimit.get(ip) || { 
      count: 0, 
      reset: now + options.window 
    };
    
    // Reset counter if the window has passed
    if (now > rateLimitData.reset) {
      rateLimitData.count = 0;
      rateLimitData.reset = now + options.window;
    }
    
    // Increment request count
    rateLimitData.count += 1;
    
    // Update the store
    rateLimit.set(ip, rateLimitData);
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', options.limit.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, options.limit - rateLimitData.count).toString());
    res.setHeader('X-RateLimit-Reset', rateLimitData.reset.toString());
    
    // Check if rate limit exceeded
    if (rateLimitData.count > options.limit) {
      const error: ApiError = {
        message: 'Too many requests',
        status: 429
      };
      return res.status(429).json({ 
        error: error.message, 
        message: 'Rate limit exceeded. Please try again later.'
      });
    }
    
    // Proceed to the handler
    return handler(req, res);
  };
};

// Export types for use in other files
export type { AuthenticatedRequest, ApiHandler, AuthOptions, RateLimitOptions };