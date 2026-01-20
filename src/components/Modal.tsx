import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal as RNModal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Image,
} from 'react-native';
import {colors, borderRadius, spacing, typography, shadows} from '@/theme/colors';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  size = 'md',
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const getWidthStyle = () => {
    switch (size) {
      case 'sm':
        return {maxWidth: 340};
      case 'lg':
        return {maxWidth: 500};
      case 'full':
        return {maxWidth: '95%' as any};
      default:
        return {maxWidth: 400};
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
      <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View 
            style={[
              styles.backdrop,
              {
                opacity: opacityAnim,
              }
            ]} 
          />
        </TouchableWithoutFeedback>
        <View style={styles.modalWrapper} pointerEvents="box-none">
            <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardView}
            pointerEvents="box-none">
            <TouchableWithoutFeedback onPress={() => {}}>
              <Animated.View
                style={[
                  styles.content,
                  getWidthStyle(),
                  {
                    transform: [{scale: scaleAnim}],
                    opacity: opacityAnim,
                  },
                ]}>
                {(title || showCloseButton) && (
                  <View style={styles.header}>
                    {title && (
                      <View style={styles.titleContainer}>
                        <Text style={styles.title}>{title}</Text>
                      </View>
                    )}
                    {showCloseButton && (
                      <TouchableOpacity
                        onPress={onClose}
                        style={styles.closeButton}
                        activeOpacity={0.7}>
                        <Image
                          source={require('@/assets/images/close.png')}
                          style={styles.closeIcon}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                <View style={styles.body}>{children}</View>
              </Animated.View>
            </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.xl,
  },
  keyboardView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl + 4,
    width: '100%',
    maxHeight: '85%',
    ...shadows.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.background,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 20,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: colors.textSecondary,
  },
  body: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
});
