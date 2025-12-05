/**
 * Color utility functions for handling color operations.
 */

/**
 * Adds opacity to a hex color by converting it to rgba format.
 *
 * @param color - Hex color string (e.g., '#007AFF' or '007AFF')
 * @param opacity - Opacity value between 0 and 1 (e.g., 0.2 for 20% opacity)
 * @returns RGBA color string (e.g., 'rgba(0, 122, 255, 0.2)')
 */
export function withOpacity(color: string, opacity: number): string {
  // Remove # if present
  const hex = color.replace('#', '');

  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Clamp opacity between 0 and 1
  const clampedOpacity = Math.max(0, Math.min(1, opacity));

  return `rgba(${r}, ${g}, ${b}, ${clampedOpacity})`;
}
