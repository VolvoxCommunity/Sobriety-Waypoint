// =============================================================================
// Imports
// =============================================================================
import { Profile } from '@/types/database';

// =============================================================================
// Types & Interfaces
// =============================================================================
/**
 * A partial profile object that may contain display name information.
 */
type ProfileLike = Partial<Pick<Profile, 'display_name'>> | null | undefined;

// =============================================================================
// Functions
// =============================================================================

/**
 * Formats a profile's display name.
 * Returns "?" if the profile is null/undefined or has no display name.
 *
 * @param profile - The profile object (or partial profile) to format
 * @returns Formatted name string
 *
 * @example
 * ```ts
 * formatProfileName({ display_name: 'John D.' })
 * // Returns: "John D."
 *
 * formatProfileName({ display_name: null })
 * // Returns: "?"
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

  // Handle missing or empty display name
  const displayName = profile.display_name?.trim();
  if (!displayName) {
    return '?';
  }

  return displayName;
}
