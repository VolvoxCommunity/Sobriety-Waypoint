import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { ThemeColors } from '@/contexts/ThemeContext';

interface OnboardingStepProps {
  children: React.ReactNode;
  theme: ThemeColors;
}

const OnboardingStep: React.FC<OnboardingStepProps> = ({ children, theme }) => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: Dimensions.get('window').width,
      paddingHorizontal: 24,
    },
  });

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

export default OnboardingStep;
