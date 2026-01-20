import React from 'react';
import {View, StyleSheet, TouchableOpacity, ViewStyle} from 'react-native';
import {colors, borderRadius, spacing, shadows} from '@/theme/colors';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  variant = 'default',
  padding = 'md',
}) => {
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {...shadows.lg};
      case 'outlined':
        return {borderWidth: 1, borderColor: colors.border};
      default:
        return {...shadows.sm};
    }
  };

  const getPaddingStyles = (): ViewStyle => {
    switch (padding) {
      case 'none':
        return {padding: 0};
      case 'sm':
        return {padding: spacing.md};
      case 'lg':
        return {padding: spacing.xxl};
      default:
        return {padding: spacing.lg};
    }
  };

  const cardStyles = [
    styles.card,
    getVariantStyles(),
    getPaddingStyles(),
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
  },
});
