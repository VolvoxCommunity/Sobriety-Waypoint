/**
 * Validation utility functions
 */

/**
 * Regex pattern for valid display names.
 * Allows: letters (any language via \p{L}), regular spaces, periods, hyphens
 * Note: Uses space character ' ' instead of \s to exclude tabs, newlines, etc.
 * Length: 2-30 characters (enforced separately for better error messages)
 */
const DISPLAY_NAME_REGEX = /^[\p{L} .\-]+$/u;

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

/**
 * Validates a display name for user profiles.
 *
 * Rules:
 * - Required (non-empty after trimming)
 * - 2-30 characters
 * - Only letters (any language), spaces, periods, and hyphens
 *
 * @param name - The display name to validate
 * @returns Error message string if invalid, null if valid
 *
 * @example
 * ```ts
 * validateDisplayName('John D.'); // null (valid)
 * validateDisplayName('J'); // 'Display name must be at least 2 characters'
 * validateDisplayName('John@123'); // 'Display name can only contain...'
 * ```
 */
export function validateDisplayName(name: string): string | null {
  const trimmed = name.trim();

  if (!trimmed) {
    return 'Display name is required';
  }

  if (trimmed.length < 2) {
    return 'Display name must be at least 2 characters';
  }

  if (trimmed.length > 30) {
    return 'Display name must be 30 characters or less';
  }

  if (!DISPLAY_NAME_REGEX.test(trimmed)) {
    return 'Display name can only contain letters, spaces, periods, and hyphens';
  }

  return null;
}
