import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { useTheme } from '@/contexts/ThemeContext';

// =============================================================================
// Types & Interfaces
// =============================================================================

/**
 * Props for the ProfileHeader component.
 */
interface ProfileHeaderProps {
  /** User's display name */
  displayName: string | null | undefined;
  /** User's email address */
  email: string | undefined;
  /** Theme object from ThemeContext */
  theme: ReturnType<typeof useTheme>['theme'];
}

// =============================================================================
// Component
// =============================================================================

/**
 * Displays the user's profile header with avatar, name, and email.
 *
 * Shows a circular avatar with the user's first initial, their display name,
 * and email address in a centered vertical layout.
 *
 * @param props - Component props
 * @returns The profile header component
 *
 * @example
 * ```tsx
 * <ProfileHeader
 *   displayName="John D."
 *   email="john@example.com"
 *   theme={theme}
 * />
 * ```
 */
export default function ProfileHeader({
  displayName,
  email,
  theme,
}: ProfileHeaderProps): React.JSX.Element {
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Extract first initial for avatar
  const initial = (displayName?.[0] || '?').toUpperCase();

  return (
    <View style={styles.container} accessible={true}>
      <View style={styles.avatar} accessibilityRole="image">
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <Text style={styles.name} accessibilityRole="header">
        {displayName ?? '?'}
      </Text>
      <Text style={styles.email} accessibilityRole="text">
        {email}
      </Text>
    </View>
  );
}

// =============================================================================
// Styles
// =============================================================================

const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      padding: 24,
      paddingTop: 20,
      backgroundColor: theme.surface,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    avatarText: {
      fontSize: 32,
      fontFamily: theme.fontRegular,
      fontWeight: '700',
      color: theme.white,
    },
    name: {
      fontSize: 24,
      fontFamily: theme.fontRegular,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 4,
    },
    email: {
      fontSize: 14,
      fontFamily: theme.fontRegular,
      color: theme.textSecondary,
      marginBottom: 12,
    },
  });
