import React from 'react';
import {Text as RNText, TextProps as RNTextProps, TextStyle} from 'react-native';
import {typography, colors} from '@/theme/colors';

type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'bodyMedium'
  | 'bodySemibold'
  | 'small'
  | 'smallMedium'
  | 'caption'
  | 'captionMedium';

type TextColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'inverse'
  | 'link'
  | 'success'
  | 'warning'
  | 'error'
  | 'white'
  | 'textPrimary'
  | 'textSecondary'
  | 'textTertiary';

interface TypographyProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: TextColor;
  align?: 'left' | 'center' | 'right' | 'justify';
  weight?: '400' | '500' | '600' | '700';
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color = 'textPrimary',
  align = 'left',
  weight,
  style,
  children,
  ...props
}) => {
  const getColor = (): string => {
    const colorMap: Record<TextColor, string> = {
      primary: colors.primary,
      secondary: colors.secondary,
      tertiary: colors.textTertiary,
      inverse: colors.textInverse,
      link: colors.textLink,
      success: colors.success,
      warning: colors.warning,
      error: colors.error,
      white: colors.white,
      textPrimary: colors.textPrimary,
      textSecondary: colors.textSecondary,
      textTertiary: colors.textTertiary,
    };
    return colorMap[color] || colors.textPrimary;
  };

  const getTypographyStyle = (): TextStyle => {
    return typography[variant];
  };

  const textStyle: TextStyle = {
    ...getTypographyStyle(),
    color: getColor(),
    textAlign: align,
    ...(weight && {fontWeight: weight}),
  };

  return (
    <RNText style={[textStyle, style]} {...props}>
      {children}
    </RNText>
  );
};
