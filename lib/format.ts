// =============================================================================
// Imports
// =============================================================================
import { Profile } from '@/types/database';

// =============================================================================
// Types & Interfaces
// =============================================================================
/**
 * A partial profile object that may contain name information.
 */
type ProfileLike = Partial<Pick<Profile, 'first_name' | 'last_initial'>> | null | undefined;

// =============================================================================
// Functions
// =============================================================================

/**
 * Formats a profile's name as "FirstName LastInitial." or just "FirstName" if no last initial.
 * Returns "?" if the profile is null/undefined or has no first name.
 *
 * @param profile - The profile object (or partial profile) to format
 * @returns Formatted name string
 *
 * @example
 * ```ts
 * formatProfileName({ first_name: 'John', last_initial: 'D' })
 * // Returns: "John D."
 *
 * formatProfileName({ first_name: 'Jane', last_initial: null })
 * // Returns: "Jane"
 *
 * formatProfileName(null)
 * // Returns: "?"
 * ```
 */
export function formatProfileName(profile: ProfileLike): string {
  // Handle null/undefined profile
  if (!profile) {
    return '?';
  }

  // Handle missing or empty first name
  const firstName = profile.first_name?.trim();
  if (!firstName) {
    return '?';
  }

  // Format with last initial if available
  if (profile.last_initial) {
    return `${firstName} ${profile.last_initial}.`;
  }

  // Return first name only
  return firstName;
}
