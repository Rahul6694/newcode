import React, {useState, useEffect, useRef} from 'react';
import {
  View,
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
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '@/types';
import {Button, Input, useToast, Typography, Header} from '@/components';
import {colors, spacing, typography, borderRadius, shadows} from '@/theme/colors';
import { authApi } from '@/apiservice';


const {width, height} = Dimensions.get('window');

type ResetPasswordRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;
type ResetPasswordNavigationProp = StackNavigationProp<AuthStackParamList, 'ResetPassword'>;

export const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ResetPasswordNavigationProp>();
  const route = useRoute<ResetPasswordRouteProp>();
  const {email} = route.params;

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [resendTimer, setResendTimer] = useState(60); // 60 seconds timer
  const [canResend, setCanResend] = useState(false);

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

    // Start resend timer on mount
    const timerInterval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  console.log(email)
  const validate = (): boolean => {
    let valid = true;
    setOtpError('');
    setPasswordError('');
    setConfirmError('');

    if (!otp.trim()) {
      setOtpError('OTP is required');
      valid = false;
    } else if (otp.trim().length !== 6) {
      setOtpError('OTP must be 6 digits');
      valid = false;
    }
    if (!newPassword.trim()) {
      setPasswordError('Password is required');
      valid = false;
    } else if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      valid = false;
    }
    if (!confirmPassword.trim()) {
      setConfirmError('Please confirm your password');
      valid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmError('Passwords do not match');
      valid = false;
    }
    return valid;
  };

const handleResetPassword = async () => {
  if (!validate()) return;

  setLoading(true);

  try {
    const res = await authApi.resetPassword(
      email.trim(),
      otp.trim(),
      newPassword
    );

    
    if ( res.message !== 'Password reset successfully') {
      console.log('Reset password failed:', res);
      setOtpError(res.message || 'Invalid OTP');
      return;
    }

    showSuccess(res.message || 'Password reset successfully');

    // Navigate to Login screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });

  } catch (error: any) {
    console.log('Reset password error:', error);
    setOtpError(error?.message || 'Unable to reset password. Please try again.');
  } finally {
    setLoading(false);
  }
};



  const handleResendOTP = async () => {
  if (!canResend) return;

  setLoading(true);
 setLoading(true);

  try {
    const res = await authApi.forgotPassword(email.trim());

    if (res.message !== 'OTP sent successfully') {
      console.log('Forgot password failed:', res);
     
      return;
    }

    showSuccess(res.message || 'OTP resent to your email');

    

  } catch (error: any) {
    console.log('Forgot password error:', error);
   
  } finally {
    setLoading(false);
  }
};


  return (
    <> m
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'dark-content'}
        backgroundColor={Platform.OS === 'android' ? colors.primaryLight : undefined}
        translucent={Platform.OS === 'android' ? false : undefined}
      />
      <SafeAreaView style={styles.container} edges={['bottom', 'top']}>
        <View style={styles.backgroundGradient} />
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Header
            title="Reset Password"
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
                <Typography variant="h1" style={styles.title}>
                  Reset Password
                </Typography>
                <Typography variant="body" style={styles.subtitle}>
                  Enter the OTP sent to {email} and create your new password
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
                  label="OTP Code"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChangeText={text => {
                    // Only allow numeric input and limit to 6 digits
                    const numericText = text.replace(/[^0-9]/g, '');
                    if (numericText.length <= 6) {
                      setOtp(numericText);
                      if (otpError) setOtpError('');
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!loading}
                  error={otpError}
                  leftIconImage={require('@/assets/images/opt-out.png')}
                />

                <Input
                  label="New Password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={text => {
                    setNewPassword(text);
                    if (passwordError) setPasswordError('');
                  }}
                  secureTextEntry
                  editable={!loading}
                  error={passwordError}
                  leftIconImage={require('@/assets/images/padlock.png')}
                  passwordVisibleIcon={require('@/assets/images/eye.png')}
                  passwordHiddenIcon={require('@/assets/images/hidden.png')}
                  hint="Minimum 8 characters"
                />

                <Input
                  label="Confirm Password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChangeText={text => {
                    setConfirmPassword(text);
                    if (confirmError) setConfirmError('');
                  }}
                  secureTextEntry
                  editable={!loading}
                  error={confirmError}
                  leftIconImage={require('@/assets/images/padlock.png')}
                  passwordVisibleIcon={require('@/assets/images/eye.png')}
                  passwordHiddenIcon={require('@/assets/images/hidden.png')}
                />

                <Button
                  title="Reset Password"
                  onPress={handleResetPassword}
                  loading={loading}
                  disabled={loading}
                  fullWidth
                  size="lg"
                  style={styles.resetButton}
                />

                <View style={styles.resendContainer}>
                  <View style={styles.resendRow}>
                    <Typography variant="small" color="textSecondary" weight="400" style={styles.resendText}>
                      Didn't receive code?
                    </Typography>
                    {canResend ? (
                      <TouchableOpacity
                        onPress={handleResendOTP}
                        disabled={loading || !canResend}
                        activeOpacity={0.7}
                        style={styles.resendLink}>
                        <Typography variant="small" color="primary" weight="600" style={styles.resendText}>
                          Resend OTP
                        </Typography>
                      </TouchableOpacity>
                    ) : (
                      <Typography variant="small" color="textSecondary" weight="600" style={styles.resendText}>
                        Resend OTP in {resendTimer}s
                      </Typography>
                    )}
                  </View>
                </View>

                {/* <TouchableOpacity
                  onPress={() => navigation.popToTop()}
                  disabled={loading}
                  activeOpacity={0.7}
                  style={styles.backButton}>
                  <Typography variant="smallMedium" color="primary" weight="600">
                    Back to Login
                  </Typography>
                </TouchableOpacity> */}
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
  title: {
    marginBottom: spacing.xs / 2,
    fontSize: 26,
    textAlign: 'left',
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
  resetButton: {

  },
  resendContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  resendText: {

  },
  resendLink: {
    // Inline styles are handled by the TouchableOpacity wrapper
  },
  backButton: {
    alignItems: 'center',

  },
  footer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? spacing.lg : spacing.xl,
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
  helpTitle: {},
  helpDescription: {},
});
