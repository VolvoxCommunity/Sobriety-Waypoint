/**
 * @fileoverview Dashboard card displaying money saved since sobriety.
 *
 * Shows total savings calculated from historical spending patterns and days sober.
 * Includes breakdown by day/week/month and opens edit sheet on press.
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, type ThemeColors } from '@/contexts/ThemeContext';
import { DollarSign } from 'lucide-react-native';
import { calculateSavings, formatCurrency, type SpendingFrequency } from '@/lib/savings';

// =============================================================================
// Types
// =============================================================================

interface MoneySavedCardProps {
  /** Historical spending amount */
  amount: number;
  /** Spending frequency */
  frequency: SpendingFrequency;
  /** Days since sobriety start */
  daysSober: number;
  /** Callback when card is pressed (opens edit sheet) */
  onPress: () => void;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Dashboard card displaying money saved since sobriety.
 *
 * Shows total saved, spending basis, and breakdown by day/week/month.
 * Tapping the card opens the edit bottom sheet.
 *
 * @param amount - Historical spending amount
 * @param frequency - Spending frequency
 * @param daysSober - Days since sobriety start
 * @param onPress - Callback when pressed
 */
export default function MoneySavedCard({
  amount,
  frequency,
  daysSober,
  onPress,
}: MoneySavedCardProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const savings = useMemo(
    () => calculateSavings(amount, frequency, daysSober),
    [amount, frequency, daysSober]
  );

  return (
    <TouchableOpacity
      testID="money-saved-card"
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Money saved: ${formatCurrency(savings.totalSaved)}. Tap to edit.`}
    >
      <View style={styles.header}>
        <DollarSign size={24} color={theme.success} />
        <Text style={styles.headerTitle}>Money Saved</Text>
      </View>

      <Text testID="money-saved-total" style={styles.totalAmount}>
        {formatCurrency(savings.totalSaved)}
      </Text>

      <Text style={styles.basisText}>
        Based on {formatCurrency(amount)}/{frequency} spending
      </Text>

      <View style={styles.breakdownContainer}>
        <View testID="breakdown-day" style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Day</Text>
          <Text style={styles.breakdownValue}>{formatCurrency(savings.perDay)}</Text>
        </View>
        <View testID="breakdown-week" style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Week</Text>
          <Text style={styles.breakdownValue}>{formatCurrency(savings.perWeek)}</Text>
        </View>
        <View testID="breakdown-month" style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Month</Text>
          <Text style={styles.breakdownValue}>{formatCurrency(savings.perMonth)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// =============================================================================
// Styles
// =============================================================================

const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.card,
      margin: 16,
      marginTop: 0,
      padding: 24,
      borderRadius: 16,
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
    headerTitle: {
      fontSize: 18,
      fontFamily: theme.fontRegular,
      fontWeight: '600',
      color: theme.text,
      marginLeft: 12,
    },
    totalAmount: {
      fontSize: 40,
      fontFamily: theme.fontRegular,
      fontWeight: '700',
      color: theme.success,
      textAlign: 'center',
      marginBottom: 8,
    },
    basisText: {
      fontSize: 14,
      fontFamily: theme.fontRegular,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
    },
    breakdownContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    breakdownItem: {
      alignItems: 'center',
      backgroundColor: theme.background,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      minWidth: 90,
    },
    breakdownLabel: {
      fontSize: 12,
      fontFamily: theme.fontRegular,
      color: theme.textSecondary,
      marginBottom: 4,
    },
    breakdownValue: {
      fontSize: 16,
      fontFamily: theme.fontRegular,
      fontWeight: '600',
      color: theme.text,
    },
  });
