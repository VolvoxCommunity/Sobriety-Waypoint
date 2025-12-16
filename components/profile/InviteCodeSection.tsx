import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Share2, QrCode } from 'lucide-react-native';
import type { useTheme } from '@/contexts/ThemeContext';

// =============================================================================
// Types & Interfaces
// =============================================================================

/**
 * Props for the InviteCodeSection component.
 */
interface InviteCodeSectionProps {
  /** Section title */
  title: string;
  /** Whether to show the empty state */
  isEmpty: boolean;
  /** Empty state message */
  emptyMessage: string;
  /** Primary button label */
  primaryButtonLabel: string;
  /** Whether to show the primary button as "Generate New" variant */
  showGenerateNew?: boolean;
  /** Theme object from ThemeContext */
  theme: ReturnType<typeof useTheme>['theme'];
  /** Callback when primary button is pressed */
  onPrimaryAction: () => void;
  /** Callback when secondary button is pressed (optional, for sponsor section) */
  onSecondaryAction?: () => void;
  /** Children to render (relationship cards) */
  children?: React.ReactNode;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Displays a section for managing invite codes with title, relationships list,
 * and action buttons for generating/entering codes.
 *
 * @param props - Component props
 * @returns The invite code section component
 *
 * @example
 * ```tsx
 * <InviteCodeSection
 *   title="Your Sponsees"
 *   isEmpty={false}
 *   emptyMessage="No sponsees yet"
 *   primaryButtonLabel="Generate Invite Code"
 *   theme={theme}
 *   onPrimaryAction={() => {}}
 * >
 *   <RelationshipCard ... />
 * </InviteCodeSection>
 * ```
 */
export default function InviteCodeSection({
  title,
  isEmpty,
  emptyMessage,
  primaryButtonLabel,
  showGenerateNew = false,
  theme,
  onPrimaryAction,
  onSecondaryAction,
  children,
}: InviteCodeSectionProps): React.JSX.Element {
  const styles = createStyles(theme);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {isEmpty ? (
        <View>
          <Text style={styles.emptyStateText}>{emptyMessage}</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onPrimaryAction}
            accessibilityRole="button"
            accessibilityLabel={primaryButtonLabel}
          >
            {primaryButtonLabel.includes('Generate') ? (
              <Share2 size={20} color={theme.primary} />
            ) : (
              <QrCode size={20} color={theme.primary} />
            )}
            <Text style={styles.actionButtonText}>{primaryButtonLabel}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {children}
          {showGenerateNew && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onPrimaryAction}
              accessibilityRole="button"
              accessibilityLabel={primaryButtonLabel}
            >
              <Share2 size={20} color={theme.primary} />
              <Text style={styles.actionButtonText}>{primaryButtonLabel}</Text>
            </TouchableOpacity>
          )}
          {onSecondaryAction && !isEmpty && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onSecondaryAction}
              accessibilityRole="button"
              accessibilityLabel="Connect to Another Sponsor"
            >
              <QrCode size={20} color={theme.primary} />
              <Text style={styles.actionButtonText}>Connect to Another Sponsor</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

// =============================================================================
// Styles
// =============================================================================

const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    section: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: theme.fontRegular,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
    },
    emptyStateText: {
      fontSize: 14,
      fontFamily: theme.fontRegular,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      padding: 16,
      borderRadius: 12,
      shadowColor: theme.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    actionButtonText: {
      fontSize: 16,
      fontFamily: theme.fontRegular,
      fontWeight: '600',
      color: theme.text,
      marginLeft: 12,
    },
  });
