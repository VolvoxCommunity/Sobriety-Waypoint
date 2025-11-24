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
type SponseeLike = Partial<Pick<Profile, 'first_name' | 'last_initial'>> | null | undefined;

// =============================================================================
// Functions
// =============================================================================

/**
 * Formats a sponsee's name as "FirstName LastInitial." or just "FirstName" if no last initial.
 * Returns "?" if the sponsee is null/undefined or has no first name.
 *
 * @param sponsee - The sponsee profile object (or partial profile)
 * @returns Formatted name string
 *
 * @example
 * ```ts
 * formatSponseeName({ first_name: 'John', last_initial: 'D' })
 * // Returns: "John D."
 *
 * formatSponseeName({ first_name: 'Jane', last_initial: null })
 * // Returns: "Jane"
 *
 * formatSponseeName(null)
 * // Returns: "?"
 * ```
 */
export function formatSponseeName(sponsee: SponseeLike): string {
  // Handle null/undefined sponsee
  if (!sponsee) {
    return '?';
  }

  // Handle missing or empty first name
  const firstName = sponsee.first_name?.trim();
  if (!firstName) {
    return '?';
  }

  // Format with last initial if available
  if (sponsee.last_initial) {
    return `${firstName} ${sponsee.last_initial}.`;
  }

  // Return first name only
  return firstName;
}
