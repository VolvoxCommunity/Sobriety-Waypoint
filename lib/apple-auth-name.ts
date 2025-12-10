/**
 * Shared module for passing Apple Sign In name data between components.
 *
 * Apple only provides the user's name on the FIRST sign-in. This data comes
 * from the native credential object, NOT from the identity token. Since
 * Supabase's signInWithIdToken only receives the token (not the credential),
 * the name data is not available in user_metadata automatically.
 *
 * This module allows AppleSignInButton to store the name data BEFORE calling
 * signInWithIdToken, so that AuthContext can store it in user_metadata for
 * later use during onboarding.
 *
 * Flow:
 * 1. AppleSignInButton receives credential with fullName from Apple
 * 2. AppleSignInButton calls setPendingAppleAuthName() with the name data
 * 3. AppleSignInButton calls signInWithIdToken()
 * 4. onAuthStateChange fires → storeAppleNameInMetadata runs
 * 5. storeAppleNameInMetadata calls getPendingAppleAuthName() to get name
 * 6. Name is stored in Supabase user_metadata (persists across sessions)
 * 7. Onboarding screen pre-fills display name from user_metadata
 * 8. Profile is created when user completes onboarding
 *
 * @module lib/apple-auth-name
 */

// =============================================================================
// Imports
// =============================================================================

import { logger, LogCategory } from '@/lib/logger';

// =============================================================================
// Types
// =============================================================================

/**
 * Apple Sign In name data extracted from the native credential.
 * This data is only available on the user's first sign-in with Apple.
 *
 * @property firstName - The user's given name
 * @property familyName - The user's family name (surname)
 * @property displayName - Formatted display name for UI (e.g., "John D.")
 * @property fullName - Complete name (e.g., "John Doe")
 */
export interface PendingAppleAuthName {
  firstName: string;
  familyName: string;
  displayName: string;
  fullName: string;
}

// =============================================================================
// Module State
// =============================================================================

/**
 * Module-level state for pending Apple auth name.
 *
 * @remarks
 * - Tests must call clearPendingAppleAuthName() in beforeEach/afterEach
 *   to prevent state leakage between tests.
 * - Concurrent sign-in attempts will overwrite this value. This is acceptable
 *   since only the most recent credential should be processed.
 * - Cleanup happens in storeAppleNameInMetadata after storing to user_metadata.
 */
let pendingName: PendingAppleAuthName | null = null;

// =============================================================================
// Functions
// =============================================================================

/**
 * Store pending Apple Sign In name data before authentication.
 * Call this BEFORE signInWithIdToken so the data is available
 * when createOAuthProfileIfNeeded runs.
 *
 * @param data - The name data extracted from Apple credential
 * @throws {TypeError} If data is not a valid object or contains invalid string properties
 */
export function setPendingAppleAuthName(data: PendingAppleAuthName): void {
  // Validate that data is an object (not null, undefined, or array)
  if (data === null || data === undefined || typeof data !== 'object' || Array.isArray(data)) {
    const error = new TypeError('setPendingAppleAuthName: data must be a non-null object');
    logger.error('Failed to set pending Apple auth name: invalid data type', error, {
      category: LogCategory.AUTH,
      dataType: typeof data,
      isNull: data === null,
      isUndefined: data === undefined,
      isArray: Array.isArray(data),
    });
    throw error;
  }

  // Validate displayName and fullName are non-empty (required)
  // firstName and familyName can be empty strings (Apple may only provide one)
  const requiredNonEmptyFields: (keyof PendingAppleAuthName)[] = ['displayName', 'fullName'];

  const invalidFields: string[] = [];

  for (const field of requiredNonEmptyFields) {
    const value = data[field];
    if (
      value === null ||
      value === undefined ||
      typeof value !== 'string' ||
      value.trim().length === 0
    ) {
      invalidFields.push(field);
    }
  }

  // Validate firstName and familyName are strings (can be empty)
  const optionalStringFields: (keyof PendingAppleAuthName)[] = ['firstName', 'familyName'];

  for (const field of optionalStringFields) {
    const value = data[field];
    if (value === null || value === undefined || typeof value !== 'string') {
      invalidFields.push(field);
    }
  }

  if (invalidFields.length > 0) {
    const error = new TypeError(
      `setPendingAppleAuthName: invalid properties: ${invalidFields.join(', ')}`
    );
    logger.warn('Failed to set pending Apple auth name: invalid properties', {
      category: LogCategory.AUTH,
      invalidFields,
      providedFields: Object.keys(data),
    });
    throw error;
  }

  // All validation passed - store the name and log success
  pendingName = data;
  logger.info('Pending Apple auth name set successfully', {
    category: LogCategory.AUTH,
    hasFirstName: !!data.firstName,
    hasFamilyName: !!data.familyName,
    hasDisplayName: !!data.displayName,
    hasFullName: !!data.fullName,
  });
}

/**
 * Get pending Apple Sign In name data.
 * Call this in storeAppleNameInMetadata to check if there's
 * name data from an in-progress Apple Sign In.
 *
 * @returns The pending name data, or null if none
 */
export function getPendingAppleAuthName(): PendingAppleAuthName | null {
  return pendingName;
}

/**
 * Clear pending Apple Sign In name data.
 * Call this after the name has been stored in user_metadata to clean up.
 */
export function clearPendingAppleAuthName(): void {
  pendingName = null;
}
