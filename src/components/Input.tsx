import React, {useState} from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  Image,
  ImageSourcePropType,
} from 'react-native';
import {colors, borderRadius, spacing, typography} from '@/theme/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: string | ImageSourcePropType;
  rightIcon?: string | ImageSourcePropType;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  leftIconImage?: ImageSourcePropType;
  rightIconImage?: ImageSourcePropType;
  passwordVisibleIcon?: ImageSourcePropType;
  passwordHiddenIcon?: ImageSourcePropType;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  secureTextEntry,
  leftIconImage,
  rightIconImage,
  passwordVisibleIcon,
  passwordHiddenIcon,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const showPasswordToggle = secureTextEntry !== undefined;
  const actualSecureEntry = secureTextEntry && !isPasswordVisible;

  const renderLeftIcon = () => {
    if (leftIconImage) {
      return <Image source={leftIconImage} style={styles.leftIconImage} resizeMode="contain" />;
    }
    if (leftIcon && typeof leftIcon === 'string') {
      return <Text style={styles.leftIcon}>{leftIcon}</Text>;
    }
    return null;
  };

  const renderRightIcon = () => {
    if (showPasswordToggle) {
      const iconSource = isPasswordVisible
        ? passwordVisibleIcon || require('@/assets/images/eye.png')
        : passwordHiddenIcon || require('@/assets/images/hidden.png');
      return (
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          style={styles.rightIconButton}>
          <Image source={iconSource} style={styles.rightIconImage} resizeMode="contain" />
        </TouchableOpacity>
      );
    }
    if (rightIconImage) {
      return (
        <TouchableOpacity
          onPress={onRightIconPress}
          style={styles.rightIconButton}
          disabled={!onRightIconPress}>
          <Image source={rightIconImage} style={styles.rightIconImage} resizeMode="contain" />
        </TouchableOpacity>
      );
    }
    if (rightIcon && typeof rightIcon === 'string') {
      return (
        <TouchableOpacity
          onPress={onRightIconPress}
          style={styles.rightIconButton}
          disabled={!onRightIconPress}>
          <Text style={styles.rightIcon}>{rightIcon}</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}>
        {renderLeftIcon()}
        <TextInput
          style={[
            styles.input,
            (leftIcon || leftIconImage) && styles.inputWithLeftIcon,
          ]}
          placeholderTextColor={colors.textTertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={actualSecureEntry}
          {...props}
        />
        {renderRightIcon()}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.smallMedium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md + 2,
    ...typography.body,
    color: colors.textPrimary,
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.sm,
  },
  leftIcon: {
    fontSize: 18,
    color: colors.textTertiary,
  },
  leftIconImage: {
    width: 20,
    height: 20,
    tintColor: '#4A4A4A',
    
  },
  rightIconButton: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIcon: {
    fontSize: 18,
    color: '#4A4A4A',
  },
  rightIconImage: {
    width: 20,
    height: 20,
    tintColor: '#4A4A4A',
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  hint: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
