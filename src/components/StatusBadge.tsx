import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {TripStatus} from '@/types';
import {colors, borderRadius, spacing, typography} from '@/theme/colors';

interface StatusBadgeProps {
  status: TripStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<TripStatus, {color: string; bg: string; label: string}> = {
 'ASSIGNED': {
    color: colors.statusAssigned,
    bg: '#F3E8FF',
    label: 'ASSIGNED',
  },
  'IN_PROGRESS': {
    color: colors.statusInProgress,
    bg: colors.primaryLight,
    label: 'In Progress',
  },
  'LOADED': {
    color: colors.statusLoaded,
    bg: colors.warningLight,
    label: 'Loaded',
  },
  'ARRIVED': {
    color: colors.statusArrived,
    bg: colors.successLight,
    label: 'Arrived',
  },
  'COMPLETED': {
    color: colors.statusCompleted,
    bg: '#D1FAE5',
    label: 'Completed',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({status, size = 'md'}) => {
  const config = statusConfig[status];
  console.log(config,status,statusConfig,"config=====>")
  return (
    <View
      style={[
        styles.badge,
        {backgroundColor: config?.bg},
        size === 'sm' && styles.badgeSm,
      ]}>
      <View style={[styles.dot, {backgroundColor: config?.color}]} />
      <Text
        style={[
          styles.text,
          {color: config?.color},
          size === 'sm' && styles.textSm,
        ]}>
        {config?.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  badgeSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  text: {
    ...typography.captionMedium,
  },
  textSm: {
    fontSize: 11,
  },
});
