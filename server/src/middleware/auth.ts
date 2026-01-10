/**
 * Clerk Authentication Middleware
 * 
 * Validates Clerk session tokens and attaches user info to requests
 */

import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

/**
 * Middleware to require authentication on routes
 */
export const requireAuth = ClerkExpressRequireAuth({
  // Optional: customize error handling
  onError: (error) => {
    console.error('Clerk auth error:', error);
  }
});

/**
 * Middleware to optionally check auth (doesn't block unauthenticated requests)
 */
export const checkAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      // Token validation happens automatically with Clerk middleware
      // Just mark that we have a token
      req.hasAuth = true;
    } catch (err) {
      console.warn('Invalid auth token:', err);
    }
  }
  
  next();
};

/**
 * Get user ID from authenticated request
 */
export function getUserId(req) {
  return req.auth?.userId || null;
}

/**
 * Get user info from authenticated request
 */
export function getUserInfo(req) {
  return {
    userId: req.auth?.userId,
    sessionId: req.auth?.sessionId,
    claims: req.auth?.sessionClaims
  };
}
