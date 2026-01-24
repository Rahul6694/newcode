import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '@/types';
import {Button, Input, useToast, Typography, Header} from '@/components';
import {colors, spacing, typography, borderRadius, shadows} from '@/theme/colors';

import { authApi } from '@/apiservice';

const {width, height} = Dimensions.get('window');

type ForgotPasswordNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordNavigationProp>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const {showSuccess, showError} = useToast();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Form fade and slide animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

 const handleSendOTP = async () => {
  if (!validateEmail()) return;

  setLoading(true);

  try {
    const res = await authApi.forgotPassword(email.trim());

    if (res.message !== 'OTP sent successfully') {
      console.log('Forgot password failed:', res);
      setEmailError(res.message || 'Failed to send OTP');
      return;
    }

    showSuccess(res.message || 'OTP sent to your email');

    navigation.navigate('ResetPassword', {
      email: email.trim(),
    });

  } catch (error: any) {
    console.log('Forgot password error:', error);
    setEmailError('Unable to send OTP. Please try again.');
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'dark-content'}
        backgroundColor={Platform.OS === 'android' ? colors.primarySoft : undefined}
        translucent={Platform.OS === 'android' ? false : undefined}
      />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.backgroundGradient} />
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Header
            title="Forgot Password"
            onBackPress={() => navigation.goBack()}
          />
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {/* Header Section with Enhanced Animation */}
            <Animated.View
              style={[
                styles.header,
                {
                  opacity: fadeAnim,
                  transform: [{translateY: slideAnim}],
                },
              ]}>
              <View style={styles.titleContainer}>
              <Typography variant="h1" style={{  
    fontSize: 26,
    textAlign: 'left',}}>
                  Forgot Password
                </Typography>
                <Typography variant="body" style={styles.subtitle}>
                  Enter your email address and we'll send you an OTP to reset your password
                </Typography>
              </View>
            </Animated.View>

            {/* Form Card with Animation */}
            <Animated.View
              style={[
                styles.formCard,
                {
                  opacity: fadeAnim,
                  transform: [{translateY: slideAnim}],
                },
              ]}>
              <View style={styles.form}>
                <Input
                  label="Email Address"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={text => {
                    setEmail(text);
                    if (emailError) setEmailError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  error={emailError}
                  leftIconImage={require('@/assets/images/email.png')}
                />

                <Button
                  title="Send OTP"
                  onPress={handleSendOTP}
                  loading={loading}
                  disabled={loading || !email.trim()}
                  fullWidth
                  size="lg"
                  style={styles.sendButton}
                />

                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  disabled={loading}
                  activeOpacity={0.7}
                  style={styles.backButton}>
                  <Typography variant="smallMedium" color="primary" weight="600">
                    Back to Login
                  </Typography>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Footer Help Text - Fixed at Bottom */}
        {/* <Animated.View
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
            },
          ]}>
          <View style={styles.helpCard}>
            <View style={styles.helpIconContainer}>
              <Image
                source={require('@/assets/images/customer-service.png')}
                style={styles.helpIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.helpTextContainer}>
              <Typography variant="smallMedium" color="primary" weight="600" style={styles.helpTitle}>
                Need Help?
              </Typography>
              <Typography variant="small" color="textSecondary" style={styles.helpDescription}>
                Reach out to your support team anytime
              </Typography>
            </View>
          </View>
        </Animated.View> */}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.35,
    backgroundColor: colors.primarySoft,
    borderBottomLeftRadius: borderRadius.xl * 2,
    borderBottomRightRadius: borderRadius.xl * 2,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl * 2,
  },
  header: {
    alignItems: 'flex-start',
    paddingBottom: spacing.lg,
    marginTop: spacing.xl,
  },
  titleContainer: {
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 10,
  },

  subtitle: {
    textAlign: 'left',
    paddingHorizontal: 0,

    fontSize: 13,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginTop: spacing.xl,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  form: {
    gap: spacing.lg,
  },
  sendButton: {
    marginTop: spacing.md,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
    width: '100%',
  },
  helpIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.infoLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpIcon: {
    width: 28,
    height: 28,
  },
  helpTextContainer: {
    flex: 1,

  },
  helpTitle: {
   
  },
  helpDescription: {
  
  },
});
