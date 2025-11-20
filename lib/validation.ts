/**
 * Validation utility functions
 */

/**
 * Validates email address format
 * @param email - Email address to validate
 * @returns true if email is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;

  // Basic email regex - validates format like user@domain.com
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
