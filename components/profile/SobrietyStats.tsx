import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Heart } from 'lucide-react-native';
import type { useTheme } from '@/contexts/ThemeContext';
import { parseDateAsLocal } from '@/lib/date';

// =============================================================================
// Types & Interfaces
// =============================================================================

/**
 * Props for the SobrietyStats component.
 */
interface SobrietyStatsProps {
  /** Number of days sober */
  daysSober: number;
  /** ISO date string of when the sobriety journey started */
  journeyStartDate: string | null;
  /** ISO date string of when the current streak started */
  currentStreakStartDate: string | null;
  /** Whether the user has any slip-ups recorded */
  hasSlipUps: boolean;
  /** Whether days sober data is loading */
  loading: boolean;
  /** Theme object from ThemeContext */
  theme: ReturnType<typeof useTheme>['theme'];
  /** Callback when log slip-up button is pressed */
  onLogSlipUp: () => void;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Render a card showing sobriety metrics (days sober, journey start, current streak) with slip-up action.
 *
 * @param daysSober - Total days the user has been sober
 * @param journeyStartDate - ISO date string of when the journey started, or `null` if unknown
 * @param currentStreakStartDate - ISO date string marking the start of the current streak, or `null`
 * @param hasSlipUps - Whether the user has recorded any slip-ups (controls current streak visibility)
 * @param loading - If `true`, replaces the days counter with a loading placeholder
 * @param onLogSlipUp - Callback invoked when the "Record a Setback" button is pressed
 * @returns The SobrietyStats UI component
 */
export default function SobrietyStats({
  daysSober,
  journeyStartDate,
  currentStreakStartDate,
  hasSlipUps,
  loading,
  theme,
  onLogSlipUp,
}: SobrietyStatsProps): React.JSX.Element {
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View testID="profile-sobriety-stats" style={styles.container} accessible={false}>
      <View style={styles.header} accessibilityRole="header" accessibilityLabel="Sobriety Journey">
        <Heart size={24} color={theme.primary} fill={theme.primary} />
        <Text style={styles.title}>Sobriety Journey</Text>
      </View>

      <Text
        testID="profile-days-sober"
        style={styles.daysSober}
        accessibilityRole="text"
        accessibilityLabel={
          loading ? 'Loading days sober' : `${daysSober} ${daysSober === 1 ? 'Day' : 'Days'} Sober`
        }
        accessibilityLiveRegion="polite"
      >
        {loading ? '...' : `${daysSober} ${daysSober === 1 ? 'Day' : 'Days'}`}
      </Text>

      {journeyStartDate && (
        <Text style={styles.journeyStartDate}>
          Journey started:{' '}
          {parseDateAsLocal(journeyStartDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
      )}

      {hasSlipUps && currentStreakStartDate && (
        <Text
          style={styles.currentStreakDate}
          accessibilityRole="text"
          accessibilityLabel={`Current streak since ${parseDateAsLocal(currentStreakStartDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
        >
          Current streak since{' '}
          {parseDateAsLocal(currentStreakStartDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
      )}

      <TouchableOpacity
        testID="profile-log-slip-up-button"
        style={styles.slipUpButton}
        onPress={onLogSlipUp}
        accessibilityRole="button"
        accessibilityLabel="Record a Setback"
        accessibilityHint="Logs a slip up and resets your streak"
      >
        <Heart size={18} color={theme.white} />
        <Text style={styles.slipUpButtonText}>Record a Setback</Text>
      </TouchableOpacity>
    </View>
  );
}

// =============================================================================
// Styles
// =============================================================================

const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.card,
      margin: 16,
      padding: 20,
      borderRadius: 16,
      alignItems: 'center',
      shadowColor: theme.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 16,
      fontFamily: theme.fontRegular,
      fontWeight: '600',
      color: theme.text,
      marginLeft: 12,
    },
    daysSober: {
      fontSize: 48,
      fontFamily: theme.fontRegular,
      fontWeight: '700',
      color: theme.primary,
    },
    journeyStartDate: {
      fontSize: 14,
      fontFamily: theme.fontRegular,
      color: theme.textSecondary,
      marginTop: 8,
    },
    currentStreakDate: {
      fontSize: 14,
      fontFamily: theme.fontRegular,
      color: theme.text,
      fontWeight: '500',
      marginTop: 8,
    },
    slipUpButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      marginTop: 20,
      gap: 8,
    },
    slipUpButtonText: {
      fontSize: 14,
      fontFamily: theme.fontRegular,
      fontWeight: '600',
      color: theme.white,
    },
  });
