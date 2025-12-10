/**
 * Shared module for passing Apple Sign In name data between components.
 *
 * Apple only provides the user's name on the FIRST sign-in. This data comes
 * from the native credential object, NOT from the identity token. Since
 * Supabase's signInWithIdToken only receives the token (not the credential),
 * the name data is not available in user_metadata when the profile is created.
 *
 * This module allows AppleSignInButton to store the name data BEFORE calling
 * signInWithIdToken, so that createOAuthProfileIfNeeded in AuthContext can
 * read it and include it in the initial profile creation.
 *
 * Flow:
 * 1. AppleSignInButton receives credential with fullName from Apple
 * 2. AppleSignInButton calls setPendingAppleAuthName() with the name data
 * 3. AppleSignInButton calls signInWithIdToken()
 * 4. onAuthStateChange fires → createOAuthProfileIfNeeded runs
 * 5. createOAuthProfileIfNeeded calls getPendingAppleAuthName() to get name
 * 6. Profile is created with display_name populated
 * 7. clearPendingAppleAuthName() is called to clean up
 *
 * @module lib/apple-auth-name
 */

// =============================================================================
// Types
// =============================================================================

interface PendingAppleAuthName {
  firstName: string;
  familyName: string;
  displayName: string;
  fullName: string;
}

// =============================================================================
// Module State
// =============================================================================

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
 */
export function setPendingAppleAuthName(data: PendingAppleAuthName): void {
  pendingName = data;
}

/**
 * Get pending Apple Sign In name data.
 * Call this in createOAuthProfileIfNeeded to check if there's
 * name data from an in-progress Apple Sign In.
 *
 * @returns The pending name data, or null if none
 */
export function getPendingAppleAuthName(): PendingAppleAuthName | null {
  return pendingName;
}

/**
 * Clear pending Apple Sign In name data.
 * Call this after profile creation is complete to clean up.
 */
export function clearPendingAppleAuthName(): void {
  pendingName = null;
}
