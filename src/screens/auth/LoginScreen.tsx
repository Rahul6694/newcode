import React, { useState, useEffect, useRef } from 'react';
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
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { validateLoginCredentials } from '@/utils/validation';
import { AuthStackParamList } from '@/types';
import { Button, Input, useToast, Typography } from '@/components';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from '@/theme/colors';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '@/apiservice';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '@/redux/authSlice';
import { AppDispatch } from '@/redux/store';

const dispatch: AppDispatch = useDispatch();

const { width, height } = Dimensions.get('window');

type LoginNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNavigationProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rememberMeError, setRememberMeError] = useState('');
  const [loading, setLoading] = useState(false);

  const { showSuccess, showError } = useToast();

  // Load saved email if remember me was checked previously
  useEffect(() => {
    const loadRememberedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('remembered_email');
        const wasRemembered = await AsyncStorage.getItem('remember_me');
        if (savedEmail && wasRemembered === 'true') {
          setEmail('');
          setRememberMe(true);
        }
      } catch (error) {
        console.log('Error loading remembered email:', error);
      }
    };
    loadRememberedEmail();
  }, []);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo animation
    Animated.spring(logoScale, {
      toValue: 1,
      friction: 5,
      tension: 50,
      useNativeDriver: true,
    }).start();

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

  // Validate email
  const validateEmail = (emailValue: string): string => {
    if (!emailValue.trim()) {
      return 'Email address is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue.trim())) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  // Validate password
  const validatePassword = (passwordValue: string): string => {
    if (!passwordValue.trim()) {
      return 'Password is required';
    }
    if (passwordValue.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  // Validate remember me checkbox (optional - just checks if it should be validated)
  const validateRememberMe = (): string => {
    // Remember Me is optional, but we can validate if needed for specific cases
    // For now, no validation required - it's optional
    return '';
  };

  // Real-time validation on blur
  const handleEmailBlur = () => {
    const emailErr = validateEmail(email);
    setEmailError(emailErr);
  };

  const handlePasswordBlur = () => {
    const passwordErr = validatePassword(password);
    setPasswordError(passwordErr);
  };

  // Handle auth errors from Redux

const handleLogin = async () => {
  if (!email.trim() || !password.trim()) {
    showError('Please enter email and password');
    return;
  }

  setLoading(true);

  try {
    const res = await authApi.login(email.trim(), password);
  
    if (!res?.token) {
      showError(res?.message || 'Login failed');
      return;
    }

    dispatch(setToken(res.token));

      // If token exists, login is successful
      if (!res?.token) {
        showError(res?.message || 'Login failed');
        return;
      }

      // Save token in AsyncStorage
      await AsyncStorage.setItem('auth_token', res.token);

      // Save token in Redux
      dispatch(setToken(res.token));
      dispatch(setUser(res?.user))
      showSuccess('Login successful');
    } catch (error: any) {
      console.log('Login error:', error);
      showError(error?.message || 'Unable to login. Try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={
            Platform.OS === 'android' ? colors.primarySoft : undefined
          }
        />
        <View style={styles.backgroundGradient} />
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            enabled={Platform.OS === 'ios'}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
              nestedScrollEnabled={true}
            >
              <View style={styles.contentWrapper}>
                {/* Header Section with Enhanced Animation */}
                <Animated.View
                  style={[
                    styles.header,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }],
                    },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.logoContainer,
                      {
                        transform: [{ scale: logoScale }],
                      },
                    ]}
                  >
                    <View style={styles.logoCircle}>
                      <Image
                        source={require('@/assets/images/logo.jpg')}
                        style={styles.logoImage}
                        resizeMode="contain"
                      />
                    </View>
                    <Typography variant="bodySemibold" style={styles.logoLabel}>
                      ATCE DRIVER
                    </Typography>
                  </Animated.View>
                  <View style={styles.titleContainer}>
                    <Typography variant="h1" style={styles.title}>
                      Welcome Back
                    </Typography>
                    <Typography variant="body" style={styles.subtitle}>
                      Sign in to manage your trips and deliveries
                    </Typography>
                  </View>
                </Animated.View>

                {/* Login Form Card with Animation */}
                <Animated.View
                  style={[
                    styles.formCard,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }],
                    },
                  ]}
                >
                  <View style={styles.form}>
                    <Input
                      label="Email Address"
                      placeholder="Enter your email"
                      value={email}
                      onChangeText={text => {
                        setEmail(text);
                        // Clear error when user starts typing
                        if (emailError) setEmailError('');
                      }}
                      onBlur={handleEmailBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                      error={emailError}
                      leftIconImage={require('@/assets/images/email.png')}
                    />

                    <Input
                      label="Password"
                      placeholder="Enter your password"
                      value={password}
                      onChangeText={text => {
                        setPassword(text);
                        // Clear error when user starts typing
                        if (passwordError) setPasswordError('');
                      }}
                      onBlur={handlePasswordBlur}
                      secureTextEntry
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                      error={passwordError}
                      leftIconImage={require('@/assets/images/padlock.png')}
                      passwordVisibleIcon={require('@/assets/images/eye.png')}
                      passwordHiddenIcon={require('@/assets/images/hidden.png')}
                    />

                    {/* Remember Me & Forgot Password */}
                    <View style={styles.optionsRow}>
                      {/* <TouchableOpacity
                    style={styles.rememberMeContainer}
                    onPress={() => setRememberMe(!rememberMe)}
                      disabled={loading}
                      activeOpacity={0.7}>
                      <View
                        style={[
                          styles.checkbox,
                          rememberMe && styles.checkboxChecked,
                        ]}>
                      {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                      <Typography variant="smallMedium" style={styles.rememberMeText}>
                        Remember Me
                      </Typography>
                  </TouchableOpacity> */}
                      <TouchableOpacity
                        onPress={() => navigation.navigate('ForgotPassword')}
                        disabled={loading}
                        activeOpacity={0.7}
                      >
                        <Typography
                          variant="smallMedium"
                          color="primary"
                          style={styles.forgotPasswordText}
                        >
                          Forgot Password?
                        </Typography>
                      </TouchableOpacity>
                    </View>

                    {/* Login Button */}
                    <Button
                      title="Sign In"
                      onPress={handleLogin}
                      loading={loading}
                      fullWidth
                      size="lg"
                      style={styles.loginButton}
                    />
                  </View>
                </Animated.View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
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

        {/* Footer Help Text - Outside SafeAreaView, Fixed at Bottom */}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.35,
    backgroundColor: colors.primarySoft,
    borderBottomLeftRadius: borderRadius.xl * 3,
    borderBottomRightRadius: borderRadius.xl * 3,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'android' ? spacing.lg : spacing.xl,
    paddingBottom: spacing.lg,
  },
  contentWrapper: {
    flex: 1,
  },
  header: {
    alignItems: 'flex-start',
    paddingBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
    width: '100%',
  },
  logoCircle: {
    width: 100,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: spacing.xs,
  },
  logoImage: {
    width: 100,
    height: 100,
    backgroundColor: 'transparent',
  },
  logoLabel: {
    letterSpacing: 3,
    textAlign: 'center',
  },
  titleContainer: {
    alignItems: 'flex-start',
    width: '100%',
    marginTop: spacing.sm,
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
    lineHeight: 18,
    fontSize: 13,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginTop: spacing.sm,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  form: {
    gap: spacing.md,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: spacing.xs / 2,
    marginBottom: spacing.sm,
    width:"100%"
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  rememberMeText: {
    // Typography component handles styling
  },
  forgotPasswordText: {
    fontWeight: '600',
  },
  loginButton: {
    marginTop: spacing.xs,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: -1,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.md : spacing.lg,
    width: '100%',
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
