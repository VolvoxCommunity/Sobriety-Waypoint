/**
 * Shared date utility functions
 */

import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { differenceInCalendarDays } from 'date-fns';

// =============================================================================
// Constants
// =============================================================================

/**
 * Device timezone, cached at module load time.
 * This avoids creating a new DateTimeFormat instance on every function call.
 */
export const DEVICE_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Parses a date string (YYYY-MM-DD) as midnight in a specific timezone.
 *
 * When users set a sobriety date like "January 1st", they mean midnight
 * in their timezone, not UTC. This function creates a UTC Date that
 * represents midnight in the specified timezone.
 *
 * Uses fromZonedTime to correctly handle all timezones, including UTC+12/+13
 * where the date can change when converting from UTC.
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @param timezone - IANA timezone string
 * @returns Date object (in UTC) that represents midnight in the specified timezone
 */
function parseDateInTimezone(dateString: string, timezone: string): Date {
  // Pass the date string directly to fromZonedTime as an ISO string
  // This avoids the Date constructor's system timezone interpretation
  // The string is treated as a timezone-agnostic datetime to be interpreted in the target timezone
  const midnightIsoString = `${dateString}T00:00:00`;

  // Convert from the "zoned" representation (midnight in the timezone) to UTC
  // This correctly handles all timezones including UTC+12/+13
  return fromZonedTime(midnightIsoString, timezone);
}

/**
 * Calculates the difference in calendar days between two dates in a specific timezone.
 *
 * Uses calendar day comparison rather than timestamp math to ensure day counts
 * increment at midnight in the user's timezone, not UTC. This is critical for
 * sobriety tracking where users expect day counts to change at their local midnight.
 *
 * @param startDate - The earlier date (Date object or YYYY-MM-DD string, interpreted in timezone)
 * @param endDate - The later date (defaults to now, interpreted in timezone)
 * @param timezone - IANA timezone string (e.g., 'America/Los_Angeles'). Defaults to device timezone
 * @returns Number of calendar days between dates in the specified timezone, minimum 0
 *
 * @example
 * ```ts
 * // User in PST sets sobriety date as "January 1st"
 * const days = getDateDiffInDays('2024-01-01', new Date(), 'America/Los_Angeles');
 * // Day count increments at PST midnight, not UTC midnight
 * ```
 */
export function getDateDiffInDays(
  startDate: Date | string,
  endDate: Date = new Date(),
  timezone: string = DEVICE_TIMEZONE
): number {
  // If startDate is a string (YYYY-MM-DD), parse it as midnight in the timezone
  let start: Date;
  if (typeof startDate === 'string') {
    start = parseDateInTimezone(startDate, timezone);
  } else {
    start = startDate;
  }

  // Convert both dates to the user's timezone for calendar day comparison
  const zonedStart = toZonedTime(start, timezone);
  const zonedEnd = toZonedTime(endDate, timezone);

  // Calculate calendar day difference (not timestamp-based)
  // This counts full calendar days, so Jan 1 23:59 to Jan 2 00:01 = 1 day
  const diffDays = differenceInCalendarDays(zonedEnd, zonedStart);

  return Math.max(0, diffDays);
}
