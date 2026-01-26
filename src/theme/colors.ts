// Professional color palette for Atce Driver App
export const colors = {
  // Primary colors
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#3B82F6',
  primarySoft: '#DBEAFE',

  // Secondary colors
  secondary: '#0F172A',
  secondaryLight: '#1E293B',

  // Status colors
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Neutral colors
  white: '#FFFFFF',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  
  // Text colors
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',
  textLink: '#2563EB',

  // Trip status colors
  statusAssigned: '#8B5CF6',
  statusInProgress: '#3B82F6',
  statusLoaded: '#F59E0B',
  statusArrived: '#10B981',
  statusCompleted: '#059669',

  // Overlay
  overlay: 'rgba(15, 23, 42, 0.5)',
  overlayLight: 'rgba(15, 23, 42, 0.3)',
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const typography = {
  h1: {fontSize: 28, fontWeight: '700' as const, lineHeight: 36},
  h2: {fontSize: 24, fontWeight: '700' as const, lineHeight: 32},
  h3: {fontSize: 20, fontWeight: '600' as const, lineHeight: 28},
  h4: {fontSize: 18, fontWeight: '600' as const, lineHeight: 26},
  body: {fontSize: 16, fontWeight: '400' as const, },
  bodyMedium: {fontSize: 16, fontWeight: '500' as const, lineHeight: 24},
  bodySemibold: {fontSize: 16, fontWeight: '600' as const, lineHeight: 24},
  small: {fontSize: 14, fontWeight: '400' as const, lineHeight: 20},
  smallMedium: {fontSize: 14, fontWeight: '500' as const, lineHeight: 20},
  caption: {fontSize: 12, fontWeight: '400' as const, lineHeight: 16},
  captionMedium: {fontSize: 12, fontWeight: '500' as const, lineHeight: 16},
};