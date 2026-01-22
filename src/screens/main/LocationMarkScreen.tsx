import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TodoStackParamList } from '@/types';
import {
  Button,
  Card,
  useToast,
  Typography,
  ProofDocumentUpload,
} from '@/components';
import { Header } from '@/components/Header';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from '@/theme/colors';
import { Animated } from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';
import { usePermissions } from '@/hooks/usePermissions';
import { tripApi } from '@/apiservice';

type LocationMarkRouteProp = RouteProp<TodoStackParamList, 'LocationMark'>;
type LocationMarkNavigationProp = StackNavigationProp<
  TodoStackParamList,
  'LocationMark'
>;

export const LocationMarkScreen: React.FC = () => {
  const route = useRoute<LocationMarkRouteProp>();
  const navigation = useNavigation<LocationMarkNavigationProp>();
  const { tripId, stage } = route.params;
  const { showSuccess, showError } = useToast();
  const permissions = usePermissions();


  console.log(stage, 'stage===============>');

  // UI state only
  const [loading] = useState(false);
  const [location] = useState(true); // Always show location for UI
  const [marking, setMarking] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [cameraAttempts, setCameraAttempts] = useState(0);
  const [galleryAttempts, setGalleryAttempts] = useState(0);
  const [docsUploaded, setDocsUploaded] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getActiveTrips();
  }, []);

  const trip = Array.isArray(data) && data.length > 0 ? data[0] : null;

  const getActiveTrips = async () => {
    try {
      const res = await tripApi.getActiveTrip();
      if (res && res.success) {
        console.log('Profile data:', res);
        const data = res.data || res;
        setData(data || []);
        console.log('efefe', data);
      } else {
        const errorMsg = res?.message || 'Failed to load profile';
        console.log('Profile data failed:', res);
      }
    } catch (error: any) {
      console.log('Load profile error:', error);
    } finally {
    }
  };
  // UI handlers only
  const handleTakePhoto = async () => {
    console.log(
      '[LocationMarkScreen] handleTakePhoto called, attempt:',
      cameraAttempts + 1,
    );

    // Request camera permission first
    console.log('[LocationMarkScreen] Requesting camera permission...');
    const cameraGranted = await permissions.requestCameraPermission();
    console.log(
      '[LocationMarkScreen] Camera permission granted:',
      cameraGranted,
    );

    if (!cameraGranted) {
      const newAttempts = cameraAttempts + 1;
      setCameraAttempts(newAttempts);
      console.warn(
        '[LocationMarkScreen] Camera permission denied, attempt:',
        newAttempts,
      );

      if (newAttempts >= 2) {
        // Automatically open settings after 2 attempts
        console.warn(
          '[LocationMarkScreen] Max attempts reached, opening settings automatically...',
        );
        showError('Opening Settings to enable camera permission...');
        setTimeout(() => {
          permissions.openSettings();
          setCameraAttempts(0); // Reset attempts
        }, 500);
      } else {
        showError(
          `Camera permission required (Attempt ${newAttempts}/2). Try again.`,
        );
      }
      return;
    }

    // Reset attempts on success
    setCameraAttempts(0);

    try {
      console.log('[LocationMarkScreen] Launching camera...');
      const image = await ImageCropPicker.openCamera({
        width: 720,
        height: 720,
        cropping: true,
        cropperCircleOverlay: false,
        compressImageQuality: 0.5,
        mediaType: 'photo',
        includeExif: true,
      });

      console.log('[LocationMarkScreen] Photo captured:', image.path);
      setDocuments([...documents, image]);
      // showSuccess('Photo added successfully');
    } catch (error: any) {
      console.log('[LocationMarkScreen] Camera error:', error);
      if (error.code === 'E_PICKER_CANCELLED') {
        console.log('[LocationMarkScreen] Camera cancelled by user');
      } else {
        showError(error.message || 'Camera error occurred');
      }
    }
  };

  const handlePickImage = async () => {
    console.log(
      '[LocationMarkScreen] handlePickImage called, attempt:',
      galleryAttempts + 1,
    );

    // Check current permission status first
    console.log('[LocationMarkScreen] Checking gallery permission status...');
    const currentStatus = await permissions.checkGalleryPermission();
    console.log(
      '[LocationMarkScreen] Current gallery permission status:',
      currentStatus,
    );

    // Request gallery permission
    console.log('[LocationMarkScreen] Requesting gallery permission...');
    const galleryGranted = await permissions.requestGalleryPermission();
    console.log(
      '[LocationMarkScreen] Gallery permission granted:',
      galleryGranted,
    );

    if (!galleryGranted) {
      const newAttempts = galleryAttempts + 1;
      setGalleryAttempts(newAttempts);
      console.warn(
        '[LocationMarkScreen] Gallery permission DENIED, attempt:',
        newAttempts,
      );

      if (newAttempts >= 2) {
        // Automatically open settings after 2 attempts
        console.warn(
          '[LocationMarkScreen] Max attempts reached, opening settings automatically...',
        );
        showError('Opening Settings to enable gallery permission...');
        setTimeout(() => {
          permissions.openSettings();
          setGalleryAttempts(0); // Reset attempts
        }, 500);
      } else {
        showError(
          `Gallery permission required (Attempt ${newAttempts}/2). Try again.`,
        );
      }
      console.log(
        '[LocationMarkScreen] Returning early - permission not granted',
      );
      return; // IMPORTANT: Exit the function here
    }

    // Reset attempts on success
    setGalleryAttempts(0);

    try {
      console.log('[LocationMarkScreen] Launching image picker...');
      const images = await ImageCropPicker.openPicker({
        width: 720,
        height: 720,
        cropping: true,
        cropperCircleOverlay: false,
        compressImageQuality: 0.5,
        mediaType: 'photo',
        multiple: true,
        maxFiles: 10,
        includeExif: true,
      });

      const selectedImages = Array.isArray(images) ? images : [images];
      console.log(
        '[LocationMarkScreen] Images selected:',
        selectedImages.length,
      );
      const newPhotos = selectedImages.map(img => img.path);
      setDocuments([...documents, ...selectedImages]);
      // showSuccess(`${newPhotos.length} photo(s) added`);
    } catch (error: any) {
      console.log('[LocationMarkScreen] Gallery error:', error);
      if (error.code === 'E_PICKER_CANCELLED') {
        console.log('[LocationMarkScreen] Gallery cancelled by user');
      } else {
        showError(error.message || 'Gallery error occurred');
      }
    }
  };

  const handleRemoveDocument = (index: number) => {
    const newDocs = documents.filter((_, i) => i !== index);
    setDocuments(newDocs);
    showSuccess('Document removed');
  };

  // UI handlers only
  const uploadDocuments = async () => {
    if (documents.length === 0) {
      showError('Please add documents before uploading');
      return;
    }

    setUploadingDocs(true);

    try {
      const formData = new FormData();

      documents.forEach((doc, index) => {
        formData.append('document', {
          uri: doc.path,
          name: doc.filename || `document_${index}.jpg`,
          type: doc.mime || 'image/jpeg',
        });
      });

      //  uri: selectedPhoto?.path || selectedPhoto?.uri,
      //     name: selectedPhoto?.name || '',
      //     type: selectedPhoto?.mime || 'image/jpeg',

      formData.append('remarks', 'Loading completed');
      console.log(formData, documents, 'formData=======>');

      const response = await tripApi.uploadDocument(tripId, formData);

      console.log(response, 'upload response===============>');

      if (response.success) {
        showSuccess('Documents uploaded successfully');
        setDocsUploaded(true);
      } else {
        const errorMsg = response.message || response.error || 'Failed to upload documents';
        showError(errorMsg);
      }
    } catch (error: any) {
      console.log('Upload error:', error);
      const errorMsg = error?.message || 'Failed to upload documents. Please try again.';
      showError(errorMsg);
    } finally {
      setUploadingDocs(false);
    }
  };

  const markTripAsLoaded = async () => {
    setMarking(true);

    try {
      await tripApi.markLoaded(tripId, 'All items loaded properly');

      showSuccess('Trip marked as loaded');
      navigation.replace('TripInProgress', { tripId });
    } catch (error: any) {
      console.log(error);
      showError(error.message || 'Failed to mark trip as loaded');
    } finally {
      setMarking(false);
    }
  };
  const handlePrimaryAction = () => {
    if (!docsUploaded) {
      uploadDocuments(); // step 1
    } else {
      markTripAsLoaded(); // step 2
    }
  };
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Mark as Loaded" onBackPress={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Loading State */}
        {loading && (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Typography
              variant="body"
              color="textSecondary"
              style={styles.loadingText}
            >
              Accessing location...
            </Typography>
          </View>
        )}

        {/* Error State */}
        {!loading && !location && (
          <View style={styles.errorWrapper}>
            <Typography
              variant="h1"
              color="warning"
              weight="400"
              style={styles.errorIcon}
            >
              ⚠️
            </Typography>
            <Typography
              variant="h4"
              color="textPrimary"
              weight="700"
              style={styles.errorTitle}
            >
              Location Required
            </Typography>
            <Typography
              variant="body"
              color="textSecondary"
              style={styles.errorDesc}
            >
              Enable location services to continue
            </Typography>
            <Button
              title="🔄 Retry"
              onPress={() => showSuccess('Location accessed')}
              variant="outline"
              style={styles.retryBtn}
            />
          </View>
        )}

        {/* Combined Banner Section - All in One */}
        <Card style={styles.combinedBannerCard}>
          <View style={styles.combinedBanner}>
            {/* Header Section */}
            <View style={styles.combinedHeader}>
              <View style={styles.headerTop}>
                <View style={styles.headerLeft}>
                  <Typography
                    variant="h3"
                    color="textPrimary"
                    weight="700"
                    style={styles.combinedTitle}
                  >
                    Trip Loading...
                  </Typography>
                  <View style={styles.weightBadgeInline}>
                    <Typography
                      variant="smallMedium"
                      color="white"
                      weight="700"
                      style={styles.weightBadgeTextInline}
                    >
                      {trip?.assignedWeight ?? 'N/A'} TON
                    </Typography>
                  </View>
                </View>
                <View style={styles.statusBadgeInline}>
                  <View
                    style={[
                      styles.statusDotInline,
                      documents.length > 0 && styles.statusDotReady,
                    ]}
                  />
                  <Typography
                    variant="caption"
                    color={documents.length > 0 ? 'success' : 'warning'}
                    weight="700"
                    style={[
                      styles.statusTextInline,
                      documents.length > 0 && styles.statusTextReady,
                    ]}
                  >
                    {documents.length > 0 ? 'READY' : 'PENDING'}
                  </Typography>
                </View>
              </View>
              <Typography
                variant="body"
                color="textSecondary"
                style={styles.combinedSubtitle}
              >
                All items loaded properly and ready for delivery
              </Typography>
            </View>

            {/* Trip Info Section */}
            <View style={styles.tripInfoSection}>
              <View style={styles.tripInfoRow}>
                <View style={styles.tripInfoItem}>
                  <Typography
                    variant="body"
                    color="textSecondary"
                    weight="500"
                    style={styles.tripInfoLabel}
                  >
                    Trip Number
                  </Typography>
                  <Typography
                    variant="bodyMedium"
                    color="textPrimary"
                    weight="600"
                    style={styles.tripInfoValue}
                  >
                    {trip?.tripNumber ?? 'N/A'}
                  </Typography>
                </View>
                <View style={styles.tripInfoDivider} />
                <View style={styles.tripInfoItem}>
                  <Typography
                    variant="body"
                    color="textSecondary"
                    weight="500"
                    style={styles.tripInfoLabel}
                  >
                    Total Weight
                  </Typography>
                  <Typography
                    variant="bodyMedium"
                    color="textPrimary"
                    weight="600"
                    style={styles.tripInfoValue}
                  >
                    {trip?.assignedWeight ?? 'N/A'} TON
                  </Typography>
                </View>
              </View>
            </View>

            {/* Document Upload Section */}
            <View style={styles.documentSection}>
              <ProofDocumentUpload
                documents={documents}
                onTakePhoto={handleTakePhoto}
                onPickImage={handlePickImage}
                onRemoveDocument={handleRemoveDocument}
                title="Upload Documents"
                subtitle={`Capture or select photos for the loding process`}
              />
            </View>

            {/* Action Button */}
            <View style={styles.combinedButtonContainer}>
              <Button
                title={
                  marking
                    ? 'Processing...'
                    : uploadingDocs
                    ? 'Uploading...'
                    : docsUploaded
                    ? 'Mark as Loaded'
                    : 'Upload Documents'
                }
                onPress={handlePrimaryAction}
                loading={uploadingDocs || marking}
                disabled={uploadingDocs || marking}
                fullWidth
                size="lg"
                style={styles.combinedButton}
              />
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  errorWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  errorTitle: {
    ...typography.h3,
    color: colors.error,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorDesc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  retryBtn: {
    marginTop: spacing.md,
  },
  actionWrapper: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  backButtonHeader: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: colors.textPrimary,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  backButtonPlaceholder: {
    width: 40,
  },
  successCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.lg,
    overflow: 'hidden',
    borderRadius: borderRadius.xl,
  },
  successSection: {
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  gradientHeader: {
    backgroundColor: colors.primarySoft,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  truckIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  truckIcon: {
    fontSize: 40,
  },
  successTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
    fontSize: 18,
  },
  weightBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    ...shadows.sm,
    borderWidth: 1.5,
    borderColor: colors.primaryDark,
  },
  weightBadgeText: {
    ...typography.bodyMedium,
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  successContent: {
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  successSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
    fontSize: 13,
  },
  combinedBannerCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  combinedBanner: {
    backgroundColor: colors.white,
  },
  combinedHeader: {
    backgroundColor: colors.primarySoft,
    padding: spacing.xl,
    paddingVertical: spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  combinedTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 22,
    marginBottom: spacing.sm,
  },
  weightBadgeInline: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    ...shadows.md,
  },
  weightBadgeTextInline: {
    ...typography.h4,
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  statusBadgeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  statusDotInline: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning,
    marginRight: spacing.sm,
  },
  statusDotReady: {
    backgroundColor: colors.success,
  },
  statusTextInline: {
    ...typography.bodyMedium,
    color: colors.warning,
    fontWeight: '700',
    fontSize: 13,
  },
  statusTextReady: {
    color: colors.success,
  },
  combinedSubtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontSize: 14,
  },
  tripInfoSection: {
    padding: spacing.lg,
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.background,
  },
  tripInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tripInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  tripInfoDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  tripInfoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.sm,
    fontWeight: '900',
  },
  tripInfoValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  documentSection: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: 5,
  },
  documentSectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
    fontSize: 18,
  },
  documentSectionSubtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    fontSize: 14,
  },
  documentsContainerInline: {
    marginTop: spacing.sm,
  },
  documentsHeaderInline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  documentsCountInline: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  addMoreButtonInline: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: borderRadius.md,
  },
  addMoreButtonTextInline: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  documentsGridInline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  documentItemInline: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.sm,
  },
  documentItemImageInline: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeDocumentButtonInline: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeDocumentTextInline: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  documentActionButtonsInline: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    justifyContent: 'center',
  },
  addDocumentButtonInline: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  addDocumentButtonTextInline: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  uploadOptionsContainerInline: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  uploadOptionInline: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    minHeight: 100,
  },
  uploadOptionIconInline: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',

    ...shadows.sm,
  },
  uploadOptionIconGalleryInline: {
    backgroundColor: colors.success,
  },
  uploadOptionIconImage: {
    width: 28,
    height: 28,
    tintColor: colors.white,
  },
  uploadOptionIconImageGallery: {
    tintColor: colors.white,
  },
  uploadOptionTextInline: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  combinedButtonContainer: {
    width: '100%',

    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
  },
  combinedButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: spacing.lg,
    borderRadius: 16,
    padding: 16,
    ...shadows.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '600',
  },
  statusRemarksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#166534',
    marginRight: 4,
  },
  statusText: {
    color: '#166534',
    fontWeight: '700',
    fontSize: 11,
  },
  remarksSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  remarksIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  remarksText: {
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.primaryDark,
  },
  documentCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  documentTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  documentSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  documentsContainer: {
    marginTop: spacing.sm,
  },
  documentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  documentsCount: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  addMoreButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primarySoft,
    borderRadius: borderRadius.md,
  },
  addMoreButtonText: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '700',
  },
  documentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  documentItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.sm,
  },
  documentItemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeDocumentButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeDocumentText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  documentActionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  addDocumentButton: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  addDocumentButtonText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  uploadButton: {
    marginTop: spacing.sm,
  },
  uploadOptionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  uploadOption: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    minHeight: 120,
  },
  uploadOptionIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  uploadOptionIconGallery: {
    backgroundColor: colors.success,
  },
  uploadOptionIconText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 1,
  },
  uploadOptionText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
});
