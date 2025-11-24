/**
 * Shared date utility functions
 */

/**
 * Calculates the difference in days between two dates.
 *
 * @param startDate - The earlier date
 * @param endDate - The later date (defaults to now)
 * @returns Number of full days between dates, minimum 0
 */
export function getDateDiffInDays(startDate: Date, endDate: Date = new Date()): number {
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}
