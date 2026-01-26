import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {colors, borderRadius, spacing, typography, shadows} from '@/theme/colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const getVariantStyles = (): {container: ViewStyle; text: TextStyle} => {
    switch (variant) {
      case 'primary':
        return {
          container: {backgroundColor: colors.primaryLight},
          text: {color: colors.white},
        };
      case 'secondary':
        return {
          container: {backgroundColor: colors.secondary},
          text: {color: colors.white},
        };
      case 'outline':
        return {
          container: {backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primaryLight},
          text: {color: colors.primaryLight},
        };
      case 'ghost':
        return {
          container: {backgroundColor: 'transparent'},
          text: {color: colors.primaryLight},
        };
      case 'danger':
        return {
          container: {backgroundColor: colors.error},
          text: {color: colors.white},
        };
      default:
        return {
          container: {backgroundColor: colors.primaryLight},
          text: {color: colors.white},
        };
    }
  };

  const getSizeStyles = (): {container: ViewStyle; text: TextStyle} => {
    switch (size) {
      case 'sm':
        return {
          container: {paddingVertical: spacing.sm, paddingHorizontal: spacing.lg},
          text: {...typography.small},
        };
      case 'lg':
        return {
          container: {paddingVertical: spacing.lg, paddingHorizontal: spacing.xxl},
          text: {...typography.bodySemibold},
        };
      default:
        return {
          container: {paddingVertical: spacing.md, paddingHorizontal: spacing.xl},
          text: {...typography.bodyMedium},
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        variant === 'primary' && !isDisabled && shadows.md,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primaryLight : colors.white}
          size="small"
        />
      ) : (
        <>
          {icon && <Text style={[styles.icon, variantStyles.text]}>{icon}</Text>}
          <Text style={[styles.text, variantStyles.text, sizeStyles.text, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
  icon: {
    marginRight: spacing.sm,
    fontSize: 18,
  },
});
