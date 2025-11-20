import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export interface ThemedTextProps extends TextProps {
  variant?: 'default' | 'title' | 'subtitle' | 'caption';
}

export default function ThemedText({ variant = 'default', style, ...props }: ThemedTextProps) {
  const { theme } = useTheme();

  const variantStyles = {
    default: {
      fontSize: 16,
      color: theme.text,
    },
    title: {
      fontSize: 24,
      fontWeight: '700' as const,
      color: theme.text,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: theme.text,
    },
    caption: {
      fontSize: 12,
      color: theme.textSecondary,
    },
  };

  return <Text style={[variantStyles[variant], style]} {...props} />;
}
