// @/utils/apiMiddleware.js
import { getAuth } from 'firebase-admin/auth';
import { initFirebaseAdmin } from './firebaseAdmin';

/**
 * Middleware to verify Firebase authentication for API routes
 * Some routes may be public, others may require authentication
 */
export const withApiAuth = (handler, options = { requireAuth: false }) => {
  return async (req, res) => {
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
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid authentication token' });
      }
      
      const token = authHeader.split('Bearer ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized: Missing token' });
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
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Rate limiting middleware for API routes
 * Prevents abuse by limiting the number of requests per time period
 */
export const withRateLimit = (handler, options = { limit: 100, window: 60000 }) => {
  // Simple in-memory store for rate limiting
  // In production, use a more robust solution like Redis
  const rateLimit = new Map();
  
  return async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();
    
    // Get existing rate limit data for this IP
    const rateLimitData = rateLimit.get(ip) || { count: 0, reset: now + options.window };
    
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
    res.setHeader('X-RateLimit-Limit', options.limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, options.limit - rateLimitData.count));
    res.setHeader('X-RateLimit-Reset', rateLimitData.reset);
    
    // Check if rate limit exceeded
    if (rateLimitData.count > options.limit) {
      return res.status(429).json({ 
        error: 'Too many requests', 
        message: 'Rate limit exceeded. Please try again later.'
      });
    }
    
    // Proceed to the handler
    return handler(req, res);
  };
};