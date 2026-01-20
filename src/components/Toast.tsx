import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {colors, borderRadius, spacing, typography, shadows} from '@/theme/colors';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const {width} = Dimensions.get('window');

const icons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
  action,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      if (duration > 0) {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onHide());
  };

  if (!visible) return null;

  const getColors = () => {
    switch (type) {
      case 'success':
        return {bg: colors.success, light: colors.successLight, icon: colors.success};
      case 'error':
        return {bg: colors.error, light: colors.errorLight, icon: colors.error};
      case 'warning':
        return {bg: colors.warning, light: colors.warningLight, icon: colors.warning};
      default:
        return {bg: colors.info, light: colors.infoLight, icon: colors.info};
    }
  };

  const toastColors = getColors();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{translateY}],
          opacity,
        },
      ]}>
      <View style={[styles.toast, {backgroundColor: colors.white}]}>
        <View style={[styles.iconContainer, {backgroundColor: toastColors.light}]}>
          <Text style={[styles.icon, {color: toastColors.icon}]}>{icons[type]}</Text>
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        {action && (
          <TouchableOpacity onPress={action.onPress} style={styles.actionButton}>
            <Text style={styles.actionText}>{action.label}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};


const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.lg,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 16,
    fontWeight: '700',
  },
  message: {
    flex: 1,
    ...typography.smallMedium,
    color: colors.textPrimary,
  },
  actionButton: {
    marginLeft: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  actionText: {
    ...typography.smallMedium,
    color: colors.primary,
  },
  closeButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  closeIcon: {
    fontSize: 14,
    color: colors.textTertiary,
  },
});
