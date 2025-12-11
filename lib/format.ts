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

/**
 * Adds an alpha channel to a hex color, returning an rgba string.
 *
 * Supports 3-digit (#RGB), 6-digit (#RRGGBB), and 8-digit (#RRGGBBAA) hex colors.
 * If the color is already in rgba format or is invalid, returns it unchanged.
 *
 * @param color - A hex color string (e.g., "#FF5500", "#F50", "#FF550080")
 * @param alpha - Alpha value from 0 (transparent) to 1 (opaque)
 * @returns An rgba color string (e.g., "rgba(255, 85, 0, 0.5)")
 *
 * @example
 * ```ts
 * hexWithAlpha('#FF5500', 0.3); // "rgba(255, 85, 0, 0.3)"
 * hexWithAlpha('#F50', 0.5);    // "rgba(255, 85, 0, 0.5)"
 * hexWithAlpha('rgb(255, 0, 0)', 0.5); // "rgb(255, 0, 0)" (unchanged)
 * ```
 */
export function hexWithAlpha(color: string, alpha: number): string {
  // If not a hex color, return unchanged
  if (!color.startsWith('#')) {
    return color;
  }

  // Remove the # prefix
  let hex = color.slice(1);

  // Expand 3-digit hex to 6-digit
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }

  // Handle 8-digit hex (already has alpha) - extract RGB portion
  if (hex.length === 8) {
    hex = hex.slice(0, 6);
  }

  // Parse RGB values
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Return unchanged if parsing failed
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return color;
  }

  // Clamp alpha to valid range
  const clampedAlpha = Math.max(0, Math.min(1, alpha));

  return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
}
