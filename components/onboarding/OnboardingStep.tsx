// =============================================================================
// Imports
// =============================================================================
import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';

// =============================================================================
// Types & Interfaces
// =============================================================================
interface OnboardingStepProps {
  children: React.ReactNode;
}

// =============================================================================
// Component
// =============================================================================
/**
 * Animated wrapper component for onboarding flow steps.
 *
 * Provides consistent animations when transitioning between onboarding steps.
 * Uses slide-in and slide-out animations for a smooth user experience.
 *
 * @param props - Component props
 * @param props.children - Content to display within the step
 * @returns Animated view containing the step content
 *
 * @example
 * ```tsx
 * <OnboardingStep>
 *   <Text>Welcome to step 1</Text>
 * </OnboardingStep>
 * ```
 */
const OnboardingStep: React.FC<OnboardingStepProps> = ({ children }) => {
  return (
    <Animated.View
      entering={FadeInRight.duration(500)}
      exiting={FadeOutLeft.duration(500)}
      style={styles.container}
    >
      {children}
    </Animated.View>
  );
};

// =============================================================================
// Styles
// =============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.get('window').width,
    paddingHorizontal: 24,
  },
});

export default OnboardingStep;
