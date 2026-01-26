import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Animated, Easing, Dimensions, StatusBar, Platform, KeyboardAvoidingView, Image, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList } from '@/types';
import { Button, Card, Modal, useToast, Typography } from '@/components';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme/colors';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { clearToken } from '@/redux/authSlice';
import { AppDispatch } from '@/redux/store';
import { authApi } from '@/apiservice';

const dispatch: AppDispatch = useDispatch();


const { height, width } = Dimensions.get('window');

type ProfileNavigationProp = StackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileNavigationProp>();

  const { showSuccess, showError } = useToast();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  // Get user data from API or use stored data as fallback
  const dummyUser = {
    id: profileData?.id || '',
    fullName: profileData?.fullName || profileData?.name || '',
    email: profileData?.email || '',
    phoneNumber: profileData?.phoneNumber || profileData?.mobileNumber || '',
    address: profileData?.address || null,
    status: profileData?.status || 'ACTIVE',
    isEmailVerified: profileData?.isEmailVerified !== undefined ? profileData.isEmailVerified : false,
    designation: profileData?.designation || '',
    organizationName: profileData?.organizationName || null,
    organizationRegNumber: profileData?.organizationRegNumber || null,
    userType: profileData?.userType || 'DRIVER',
    createdAt: profileData?.createdAt || '',
    updatedAt: profileData?.updatedAt || '',
    documents: profileData?.documents || [],
  };

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    loadProfile();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: 200,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadProfile = async () => {
  try {
    setLoading(true);
    
    const res = await authApi.getProfile();
    if (res) {
      console.log('Profile data:', res);
      const profile = res.data || res; 
      setProfileData(profile);

    } else {
      const errorMsg = res?.message || 'Failed to load profile';
      showError(errorMsg);
      console.log('Profile data:', res);
    }
  } catch (error: any) {
    console.log('Load profile error:', error);
    showError(error?.message || 'Unable to load profile. Try again.');
    try {
      const storedUser = await AsyncStorage.getItem('user_data');
      if (storedUser) setProfileData(JSON.parse(storedUser));
    } catch (e) {
      console.log('Error loading stored profile:', e);
    }
  } finally {
    setLoading(false);
  }
};


const handleLogout = async () => {
  setLoading(true);

  try {
    await AsyncStorage.removeItem('auth_token');

    // Clear token in Redux
    dispatch(clearToken());

    showSuccess('Logged out successfully');

    // Reset navigation to Auth stack
   
  } catch (error: any) {
    console.log('Logout error:', error);
   
  } finally {
    setLoading(false);
  }
};

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'D';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const InfoField = ({
    icon,
    iconImage,
    label,
    value,
    isLast = false,
  }: {
    icon?: string;
    iconImage?: ImageSourcePropType;
    label: string;
    value: string | null | undefined;
    isLast?: boolean;
  }) => (
    <>
      <View style={styles.fieldRow}>
        <View style={styles.fieldIconContainer}>
          {iconImage ? (
            <Image source={iconImage} style={styles.fieldIconImage} resizeMode="contain" />
          ) : (
            <Typography variant="body" style={styles.fieldIcon}>{icon || '•'}</Typography>
          )}
        </View>
        <View style={styles.fieldContent}>
          <Typography variant="caption" color="textTertiary" weight="500" style={styles.fieldLabel}>
            {label}
          </Typography>
          <Typography variant="bodyMedium" color="textPrimary" weight="500" style={styles.fieldValue}>
            {value || 'N/A'}
          </Typography>
        </View>
      </View>
      {!isLast && <View style={styles.fieldDivider} />}
    </>
  );

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8FAFC"
        translucent={false}
        hidden={false}
        animated={true}
      />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.backgroundGradient} />
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>

            {/* Modern Profile Header */}
            <Animated.View
              style={[
                styles.header,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                },
              ]}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatarWrapper}>
                  <View style={styles.avatarCircle}>
                    <Typography  style={styles.avatarText}>
                      {getInitials(dummyUser?.fullName)}
                    </Typography>
                  </View>
                  {dummyUser.status === 'ACTIVE' && (
                    <View style={styles.statusIndicator}>
                      <View style={styles.statusDot} />
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.userInfo}>
                <Typography variant="h2" color="textPrimary" weight="700" style={styles.userName}>
                  {dummyUser.fullName}
                </Typography>
                <Typography variant="body" color="textPrimary" style={styles.userEmail} numberOfLines={1}>
                  {dummyUser.email}
                </Typography>
                <View style={styles.badgeContainer}>
                  {/* <View style={styles.statusBadge}>
                    <Typography variant="caption" color="white" weight="600">
                      {dummyUser.status}
                    </Typography>
                  </View> */}
                  {/* {dummyUser.isEmailVerified && (
                    <View style={styles.verifiedBadge}>
                      <Image
                        source={require('@/assets/images/verifie.png')}
                        style={styles.verifiedBadgeIcon}
                        resizeMode="contain"
                      />
                      <Typography variant="caption" color="white" weight="600" style={styles.verifiedBadgeText}>
                        Verified
                      </Typography>
                    </View>
                  )} */}
                  {/* {dummyUser.designation && (
                    <View style={styles.designationBadge}>
                      <Typography variant="caption" color="primary" weight="600">
                        {dummyUser.designation}
                      </Typography>
                    </View>
                  )} */}
                </View>
              </View>
            </Animated.View>

            {/* Personal Information Card */}
            <Animated.View
              style={[
                styles.cardWrapper,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}>
              <Card style={styles.mainCard} padding="none">
                <View style={styles.cardHeader}>
                  <Typography variant="h3" color="textPrimary" weight="700" style={styles.cardTitle}>
                    Personal Information
                  </Typography>
                </View>
                <View style={styles.cardBody}>
                  <InfoField iconImage={require('@/assets/images/user.png')} label="Full Name" value={dummyUser.fullName} />
                  <InfoField iconImage={require('@/assets/images/email.png')} label="Email" value={dummyUser.email} />
                  {/* <InfoField iconImage={require('@/assets/images/verifie.png')} label="Email Verified" value={dummyUser.isEmailVerified ? 'Verified' : 'Not Verified'} /> */}
                  <InfoField iconImage={require('@/assets/images/phone-call.png')} label="Phone Number" value={dummyUser.phoneNumber} />
                  {/* <InfoField iconImage={require('@/assets/images/location.png')} label="Address" value={dummyUser.address} isLast /> */}
                </View>
              </Card>
            </Animated.View>

            {/* Account & Organization Card */}
            <Animated.View
              style={[
                styles.cardWrapper,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}>
              <Card style={styles.mainCard} padding="none">
                <View style={styles.cardHeader}>
                  <Typography variant="h3" color="textPrimary" weight="700" style={styles.cardTitle}>
                    Account & Organization
                  </Typography>
                </View>
                <View style={styles.cardBody}>
                  <InfoField iconImage={require('@/assets/images/user.png')} label="User Type" value={dummyUser.userType} />
                  <InfoField iconImage={require('@/assets/images/briefcase.png')} label="Company Name" value={dummyUser?.companyName || 'N/A'} />
                  {/* <InfoField iconImage={require('@/assets/images/organization.png')} label="Organization Name" value={dummyUser.organizationName || 'N/A'} />
                  <InfoField iconImage={require('@/assets/images/contact-form.png')} label="Registration Number" value={dummyUser.organizationRegNumber || 'N/A'} isLast /> */}
                </View>
              </Card>
            </Animated.View>

            {/* Documents Section */}
            {dummyUser.documents && dummyUser.documents.length > 0 && (
              <Animated.View
                style={[
                  styles.cardWrapper,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}>
                <Card style={styles.documentsCard} padding="none">
                  <View style={styles.cardHeader}>
                    <Typography variant="h3" color="textPrimary" weight="700" style={styles.cardTitle}>
                      Documents
                    </Typography>
                    <Typography variant="caption" color="textSecondary" style={styles.cardSubtitle}>
                      {dummyUser.documents.length} document{dummyUser.documents.length > 1 ? 's' : ''}
                    </Typography>
                  </View>
                  <View style={styles.documentsList}>
                    {dummyUser.documents.map((doc: any, index: number) => (
                      <View key={index}>
                        <View style={styles.documentItem}>
                          <View style={styles.documentIconWrapper}>
                            <Image
                              source={require('@/assets/images/approve.png')}
                              style={styles.documentIconImage}
                              resizeMode="contain"
                            />
                          </View>
                          <View style={styles.documentInfo}>
                            <Typography variant="bodyMedium" color="textPrimary" weight="600" style={styles.documentName}>
                              {doc.name || `Document ${index + 1}`}
                            </Typography>
                            {doc.type && (
                              <Typography variant="small" color="textSecondary" style={styles.documentType}>
                                {doc.type}
                              </Typography>
                            )}
                          </View>
                          {doc.status && (
                            <View
                              style={[
                                styles.documentStatusBadge,
                                doc.status === 'VERIFIED' && styles.documentStatusVerified,
                                doc.status === 'PENDING' && styles.documentStatusPending,
                                doc.status === 'REJECTED' && styles.documentStatusRejected,
                              ]}>
                              <Typography variant="caption" color="white" weight="600" style={styles.documentStatusText}>
                                {doc.status}
                              </Typography>
                            </View>
                          )}
                        </View>
                        {index < dummyUser.documents.length - 1 && <View style={styles.documentDivider} />}
                      </View>
                    ))}
                  </View>
                </Card>
              </Animated.View>
            )}

            {/* Logout Button */}
            {/* <Animated.View
              style={[
                styles.logoutWrapper,
                {
                  opacity: fadeAnim,
                  transform: [{translateY: slideAnim}],
                },
              ]}>
          <Button
            title="Sign Out"
            onPress={() => setShowLogoutConfirm(true)}
            variant="outline"
            fullWidth
                style={styles.logoutButton}
          />
            </Animated.View> */}

            <View style={styles.buttonContainer}>
              <Button

                title="Sign Out"
                onPress={() => setShowLogoutConfirm(true)}
                fullWidth
                size="lg"

                style={styles.completeButton}
              />
            </View>

          </ScrollView>
        </KeyboardAvoidingView>

        {/* Logout Confirmation Modal */}
        <Modal
          visible={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          title="Sign Out"
          size="sm">
          <View style={styles.modalContent}>
            <Typography color="textSecondary" style={styles.modalText}>
              Are you sure you want to sign out? You'll need to sign in again to access your trips.
            </Typography>
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowLogoutConfirm(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Sign Out"
                onPress={handleLogout}
                variant="danger"
                style={styles.modalButton}
              />
            </View>
          </View>
        </Modal>
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
    height: height * 0.46,
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
    paddingTop: spacing.sm,
  },
  header: {
 

    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: spacing.xl,
    marginBottom: 100

  },
  completeButton: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    ...shadows.md,
    
  },
  avatarContainer: {
  
  },
  avatarWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
    borderWidth: 5,
    borderColor: colors.white,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primaryLight,
  // paddingTop: Platform.OS === 'ios' ? spacing.xl : 0,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.white,
    ...shadows.md,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.white,
  },
  userInfo: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  userName: {
    marginBottom: spacing.xs,
    textAlign: 'center',
    fontSize: 28,
  },
  userEmail: {
    marginBottom: spacing.md,
    textAlign: 'center',
    opacity: 0.9,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  statusBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    ...shadows.sm,
  },
  verifiedBadge: {
    backgroundColor: colors.info,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    ...shadows.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  verifiedBadgeIcon: {
    width: 14,
    height: 14,
    tintColor: colors.white,
  },
  verifiedBadgeText: {
    marginLeft: 0,
  },
  designationBadge: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    ...shadows.sm,
  },
  cardWrapper: {
    marginTop: spacing.xl,
  },
  mainCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    ...shadows.lg,
    overflow: 'hidden',
  },
  documentsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    ...shadows.lg,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  cardTitle: {
    fontSize: 20,
  },
  cardSubtitle: {
    marginTop: spacing.xs,
  },
  cardBody: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md + 2,
  },
  fieldIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  fieldIcon: {
    fontSize: 22,
  },
  fieldIconImage: {
    width: 24,
    height: 24,
    tintColor: colors.primaryLight,
  },
  fieldContent: {
    flex: 1,
    justifyContent: 'center',
  },
  fieldLabel: {
    marginBottom: spacing.xs,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 15,
    
  },
  fieldDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: 64,
  },
  documentsList: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  documentIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.infoLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  documentIcon: {
    fontSize: 22,
  },
  documentIconImage: {
    width: 24,
    height: 24,
    tintColor: colors.info,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    marginBottom: spacing.xs,
  },
  documentType: {
    fontSize: 12,
  },
  documentStatusBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  documentStatusVerified: {
    backgroundColor: colors.success,
  },
  documentStatusPending: {
    backgroundColor: colors.warning,
  },
  documentStatusRejected: {
    backgroundColor: colors.error,
  },
  documentStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  documentDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: 64,
  },
  logoutWrapper: {
    marginTop: spacing.xxl,

  },
  logoutButton: {
    borderRadius: borderRadius.lg,
    marginBottom: 10,
    backgroundColor: colors.primaryLight,

  },
  bottomPadding: {
    // height: Platform.OS === 'ios' ? spacing.xxxl * 2 : spacing.xxxl,

  },
  modalContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalText: {
    textAlign: 'center',
    marginBottom: spacing.xxl,
    
    fontSize: 15,
    paddingHorizontal: spacing.sm,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
    marginBottom: 30
  },
  modalButton: {
    flex: 1,
    minWidth: 0,
  },
});
