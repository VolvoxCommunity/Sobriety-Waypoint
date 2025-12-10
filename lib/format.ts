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
 * Formats a profile's display name, returning a fallback when missing.
 *
 * Trims whitespace from `display_name` and returns it; if `profile` is null/undefined or `display_name` is null/undefined/empty after trimming, returns `"?"`.
 *
 * @param profile - Partial profile that may contain `display_name`
 * @returns The trimmed `display_name`, or `"?"` when unavailable
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