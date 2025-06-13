import jwt from 'jsonwebtoken';

/**
 * Generate a test JWT token for integration tests
 */
export function generateTestToken(email: string, userId?: string): string {
  const payload = {
    email,
    userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
  };

  // Use a test secret or the same secret as the app
  const secret = process.env.JWT_SECRET || 'test-secret-key';
  
  return jwt.sign(payload, secret);
} 