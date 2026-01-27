import React, { useEffect, useEffectEvent, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp, CommonActions, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TodoStackParamList } from '@/types';
import { Button, Card, useToast, Typography, ProofDocumentUpload, Input } from '@/components';
import { Header } from '@/components/Header';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme/colors';
import ImageCropPicker from 'react-native-image-crop-picker';
import { usePermissions } from '@/hooks/usePermissions';
import { tripApi } from '@/apiservice';
import useLocation from '@/hooks/useLocation';

type MarkCompleteRouteProp = RouteProp<TodoStackParamList, 'MarkComplete'>;
type MarkCompleteNavigationProp = StackNavigationProp<TodoStackParamList, 'MarkComplete'>;

export const MarkCompleteScreen: React.FC = () => {
  const route = useRoute<MarkCompleteRouteProp>();
  const navigation = useNavigation<MarkCompleteNavigationProp>();
  const { tripId } = route.params;
  const { showSuccess, showError } = useToast();
  const [LoadedValue, setLoadedValue] = useState<any>(null)
  // UI state only
  const [deliveryPhotos, setDeliveryPhotos] = useState<any[]>([]);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [cameraAttempts, setCameraAttempts] = useState(0);
  const [galleryAttempts, setGalleryAttempts] = useState(0);
  const permissions = usePermissions();
 const [data, setData] = useState<any>(null);
   const isFocused = useIsFocused();
 const { latitude, longitude, heading, error } = useLocation(isFocused);
  // Dummy trip data

useEffect(() => {  
    getActiveTrips() 
   },[]); 


  const trip = Array.isArray(data) && data.length > 0 ? data[0] : null;
  
  
  
    const getActiveTrips = async () => {
      try {
        const res = await tripApi.getActiveTrip();
        if (res) {
          console.log('Profile data:', res);
          const data = res.data || res;
          setData(data||[])
          console.log('efefe',data);
        } else {
          const errorMsg = res?.message || 'Failed to load profile';
          console.log('Profile data:', res);
        }
      } catch (error: any) {
        console.log('Load profile error:', error);
      } finally {
      }
    };  
const tripData = {
  orderId: trip?.order?.orderNumber ?? 'N/A',
  tripNumber: trip?.tripNumber ?? 'N/A',

  customerName: trip?.order?.unloadingContactName ?? 'N/A',
  customerPhone: trip?.order?.unloadingContactNumber ?? 'N/A',

  address: trip?.order?.unloadingAddress ?? 'N/A',

  vehicleNumber: trip?.vehicle?.registrationNumber ?? 'N/A',
  vehicleMake: trip?.vehicle?.make ?? 'N/A',

  assignedWeight: trip?.assignedWeight ?? 'N/A',
  materialType: trip?.order?.materialType ?? 'N/A',

  distance: trip?.distance ?? 'N/A',
  totalAmount: trip?.order?.totalAmount ?? 'N/A',

  status: trip?.status ?? 'N/A',
};


  // UI handlers only
  const handleTakePhoto = async () => {
    console.log('[MarkCompleteScreen] handleTakePhoto called, attempt:', cameraAttempts + 1);
    
    // Request camera permission first
    console.log('[MarkCompleteScreen] Requesting camera permission...');
    const cameraGranted = await permissions.requestCameraPermission();
    console.log('[MarkCompleteScreen] Camera permission granted:', cameraGranted);
    
    if (!cameraGranted) {
      const newAttempts = cameraAttempts + 1;
      setCameraAttempts(newAttempts);
      console.warn('[MarkCompleteScreen] Camera permission denied, attempt:', newAttempts);
      
      if (newAttempts >= 2) {
        // Automatically open settings after 2 attempts
        console.warn('[MarkCompleteScreen] Max attempts reached, opening settings automatically...');
        showSuccess('Opening Settings to enable camera permission...');
        setTimeout(() => {
          permissions.openSettings();
          setCameraAttempts(0); // Reset attempts
        }, 500);
      } else {
        showSuccess(`Camera permission required (Attempt ${newAttempts}/2). Try again.`);
      }
      return;
    }
    
    // Reset attempts on success
    setCameraAttempts(0);

    try {
      console.log('[MarkCompleteScreen] Launching camera...');
      const image = await ImageCropPicker.openCamera({
        width: 1920,
        height: 1920,
        cropping: false,
        cropperCircleOverlay: false,
        compressImageQuality: 0.8,
        mediaType: 'photo',
        includeExif: true,
      });
      
      console.log('[MarkCompleteScreen] Photo captured:', image.path);
      setDeliveryPhotos([...deliveryPhotos, image]);
      showSuccess('Photo captured successfully');
    } catch (error: any) {
      console.log('[MarkCompleteScreen] Camera error:', error);
      if (error.code === 'E_PICKER_CANCELLED') {
        console.log('[MarkCompleteScreen] Camera cancelled by user');
      } else {
        showSuccess(error.message || 'Camera error occurred');
      }
    }
  };

  const handlePickImage = async () => {
    console.log('[MarkCompleteScreen] handlePickImage called, attempt:', galleryAttempts + 1);
    
    // Check current permission status first
    console.log('[MarkCompleteScreen] Checking gallery permission status...');
    const currentStatus = await permissions.checkGalleryPermission();
    console.log('[MarkCompleteScreen] Current gallery permission status:', currentStatus);
    
    // Request gallery permission
    console.log('[MarkCompleteScreen] Requesting gallery permission...');
    const galleryGranted = await permissions.requestGalleryPermission();
    console.log('[MarkCompleteScreen] Gallery permission granted:', galleryGranted);
    
    if (!galleryGranted) {
      const newAttempts = galleryAttempts + 1;
      setGalleryAttempts(newAttempts);
      console.warn('[MarkCompleteScreen] Gallery permission DENIED, attempt:', newAttempts);
      
      if (newAttempts >= 2) {
        // Automatically open settings after 2 attempts
        console.warn('[MarkCompleteScreen] Max attempts reached, opening settings automatically...');
        showSuccess('Opening Settings to enable gallery permission...');
        setTimeout(() => {
          permissions.openSettings();
          setGalleryAttempts(0); // Reset attempts
        }, 500);
      } else {
        showSuccess(`Gallery permission required (Attempt ${newAttempts}/2). Try again.`);
      }
      console.log('[MarkCompleteScreen] Returning early - permission not granted');
      return; // IMPORTANT: Exit the function here
    }
    
    // Reset attempts on success
    setGalleryAttempts(0);

    try {
      console.log('[MarkCompleteScreen] Launching image picker...');
      const result = await ImageCropPicker.openPicker({
        multiple: true,
        maxFiles: 10,
        mediaType: 'photo',
        compressImageQuality: 0.8,
      });
      
      const images = Array.isArray(result) ? result : [result];
      const newPhotos = images.map(img => img.path);
      console.log('[MarkCompleteScreen] Photos selected:', newPhotos);
      setDeliveryPhotos([...deliveryPhotos, ...images]);
      showSuccess(`${newPhotos.length} photo(s) added`);
    } catch (error: any) {
      console.log('[MarkCompleteScreen] Gallery error:', error);
      if (error.code === 'E_PICKER_CANCELLED') {
        console.log('[MarkCompleteScreen] Gallery cancelled by user');
      } else {
        showSuccess(error.message || 'Gallery error occurred');
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = deliveryPhotos.filter((_, i) => i !== index);
    setDeliveryPhotos(newPhotos);
    showSuccess('Photo removed');
  };

  // UI handler only
  const handleMarkComplete = async () => {
  if (!tripId) return;

  if (deliveryPhotos.length === 0) {
    showError('Please upload delivery photo');
    return;
  }
if (LoadedValue === null || LoadedValue === '') {
      showError('Please enter loaded weight');

      return;
    }
  try {
    const formData = new FormData();

    // 🔹 same keys as Postman
    // TODO: Replace with actual GPS location in production
    // For now using test coordinates (Chittagong, Bangladesh)
    formData.append('latitude', Number(latitude));
    formData.append('longitude', Number(longitude));
    formData.append('deliveredWeight', LoadedValue.toString());

    // 🔹 multiple files supported
    deliveryPhotos.forEach((photo, index) => {
      formData.append('unloadingDocuments', {
        uri: photo.path,
        type: photo.mime ||'image/jpeg',
        name: photo.filename || `delivery_${index}.jpg`,
      } as any);
    });

    const res = await tripApi.completeTrip(tripId, formData);

    if (res?.success) {
      showSuccess('Trip completed successfully');
      setShowCongratulations(true);
    } else {
      showError(res?.message || 'Failed to complete trip');
    }
  } catch (error) {
    console.log('Complete trip error:', error);
  }
};


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Mark as Complete" onBackPress={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>

        {/* Order Header Card */}
        <Card style={styles.orderHeaderCard}>
          <View style={styles.orderCardHeader}>
            <View style={styles.orderCardHeaderLeft}>
              <Typography variant="h4" color="textPrimary" weight="700" style={styles.orderCardTitle}>Order Details</Typography>
              <Typography variant="caption" color="textSecondary" weight="500" style={styles.orderCardSubtitle}>{tripData.tripNumber}</Typography>
            </View>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Typography variant="caption" color="success" weight="700" style={styles.statusText}>{tripData.status}</Typography>
            </View>
          </View>

          <View style={styles.orderDetailsList}>
            <View style={styles.orderDetailRow}>
              <Typography variant="body" color="textSecondary" weight="500" style={styles.orderDetailLabel}>Order ID</Typography>
              <Typography variant="bodyMedium" color="textPrimary" weight="600" style={styles.orderDetailValue}>{tripData.orderId}</Typography>
            </View>
            <View style={styles.orderDetailRow}>
              <Typography variant="body" color="textSecondary" weight="500" style={styles.orderDetailLabel}>Customer</Typography>
              <Typography variant="bodyMedium" color="textPrimary" weight="600" style={styles.orderDetailValue}>{tripData.customerName}</Typography>
            </View>
            <View style={styles.orderDetailRow}>
              <Typography variant="body" color="textSecondary" weight="500" style={styles.orderDetailLabel}>Vehicle</Typography>
              <Typography variant="bodyMedium" color="textPrimary" weight="600" style={styles.orderDetailValue}>{tripData.vehicleNumber}</Typography>
            </View>
            <View style={styles.orderDetailRow}>
              <Typography variant="body" color="textSecondary" weight="500" style={styles.orderDetailLabel}>Weight</Typography>
              <Typography variant="bodyMedium" color="textPrimary" weight="600" style={styles.orderDetailValue}>{tripData.assignedWeight} TON</Typography>
            </View>
          </View>

          <View style={styles.addressSection}>
            <Typography variant="bodyMedium" color="textSecondary" weight="600" style={styles.addressLabel}>Delivery Address</Typography>
            <Typography variant="body" color="textPrimary" style={styles.addressValue}>{tripData.address}</Typography>
            <Typography variant="body" color="textSecondary" style={styles.contactLabel}>Contact: {tripData.customerPhone}</Typography>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Typography variant="bodyMedium" color="textPrimary" weight="600" style={styles.progressLabel}>Delivery Progress</Typography>
              <Typography variant="bodyMedium" color="primary" weight="700" style={styles.progressPercentage}>80%</Typography>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressBarFill, { width: '80%' }]} />
              </View>
            </View>
            <View style={styles.progressSteps}>
              <View style={[styles.progressStep, styles.progressStepCompleted]}>
                <View style={styles.progressStepDot} />
                <Typography variant="body" color="textSecondary" weight="600" style={styles.progressStepText}>Pickup</Typography>
              </View>
              <View style={[styles.progressStep, styles.progressStepCompleted]}>
                <View style={styles.progressStepDot} />
                <Typography variant="body" color="textSecondary" weight="600" style={styles.progressStepText}>Loaded</Typography>
              </View>
              <View style={[styles.progressStep, styles.progressStepCompleted]}>
                <View style={styles.progressStepDot} />
                <Typography variant="body" color="textSecondary" weight="600" style={styles.progressStepText}>Arrived</Typography>
              </View>
              <View style={[styles.progressStep, deliveryPhotos.length > 0 ? styles.progressStepCompleted : styles.progressStepPending]}>
                <View style={[styles.progressStepDot, deliveryPhotos.length > 0 ? styles.progressStepDotCompleted : styles.progressStepDotPending]} />
                <Typography variant="body" color={deliveryPhotos.length > 0 ? 'success' : 'textSecondary'} weight="600" style={[styles.progressStepText, deliveryPhotos.length > 0 && styles.progressStepTextCompleted]}>Complete</Typography>
              </View>
            </View>
          </View>
        </Card>
  <Input
              label="Unloaded Weight (TON)"
              containerStyle={{ marginTop: spacing.xl, marginHorizontal: spacing.sm, marginBottom: 0 }}
              placeholder="Enter unloaded weight"
              keyboardType="numeric"
              editable={true}
              value={LoadedValue}
            onChangeText={setLoadedValue}
            />
        {/* Proof of Delivery Photo */}
        <ProofDocumentUpload
          documents={deliveryPhotos}
          onTakePhoto={handleTakePhoto}
          onPickImage={handlePickImage}
          onRemoveDocument={handleRemovePhoto}
          title="Proof of Delivery"
          subtitle="Capture photo of delivered parcel"
        />

        {/* Complete Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Mark as Complete"
            onPress={handleMarkComplete}
            fullWidth
            size="lg"
            disabled={deliveryPhotos.length === 0}
            style={styles.completeButton}
          />
        </View>
      </ScrollView>

     {/* Congratulations Modal */}
{showCongratulations && (
  <View style={styles.congratsOverlay}>
    <Animated.View style={styles.congratsCard}>

      {/* Success Icon */}
      <View style={styles.congratsIconWrapper}>
        <View style={styles.congratsIconCircle}>
          <Typography variant="h2" color="white" weight="700">
            ✓
          </Typography>
        </View>
      </View>

      {/* Title */}
      <Typography
        variant="h3"
        weight="700"
        align="center"
        style={styles.congratsTitle}
      >
        Trip Completed
      </Typography>

      {/* Subtitle */}
      <Typography
        variant="bodyMedium"
        color="success"
        weight="700"
        align="center"
        style={styles.congratsSubtitle}
      >
        Delivery Successful 🎉
      </Typography>

      {/* Message */}
      <Typography
        variant="body"
        color="textSecondary"
        align="center"
        style={styles.congratsMessage}
      >
        {deliveryPhotos.length} photo(s) uploaded successfully.
      </Typography>

      {/* Action Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'TodoList'}],
            })
          )
        }
        style={styles.congratsButton}
      >
        <Typography variant="bodyMedium" color="white" weight="700">
        Completed 
        </Typography>
      </TouchableOpacity>

    </Animated.View>
  </View>
)}


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  content: {
    padding: spacing.lg,

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
  orderHeaderCard: {
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  orderCardHeaderLeft: {
    flex: 1,
  },
  orderCardTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xs,
    fontSize: 18,
  },
  orderCardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.success,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '700',
    fontSize: 12,
  },
  orderDetailsList: {
    marginBottom: spacing.lg,
  },
  orderDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  orderDetailLabel: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 14,
  },
  orderDetailValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
  addressSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  addressLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
    fontSize: 14,
  },
  addressValue: {
    ...typography.body,
    color: colors.textPrimary,
    
    fontSize: 15,
    marginBottom: spacing.xs,
  },
  contactLabel: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
  },
  progressSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  progressPercentage: {
    ...typography.bodyMedium,
    color: colors.primaryLight,
    fontWeight: '700',
    fontSize: 14,
  },
  progressBarContainer: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.full,
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStep: {
    flex: 1,
    alignItems: 'center',
  },
  progressStepCompleted: {
    opacity: 1,
  },
  progressStepPending: {
    opacity: 0.5,
  },
  progressStepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: spacing.xs,
  },
  progressStepDotCompleted: {
    backgroundColor: colors.success,
  },
  progressStepDotPending: {
    backgroundColor: colors.border,
  },
  progressStepText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  progressStepTextCompleted: {
    color: colors.success,
  },
  sectionCard: {
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  cameraButton: {
    borderWidth: 2,
    borderColor: colors.primaryLight,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    minHeight: 200,
    marginTop: spacing.sm,
  },
  cameraIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cameraIconText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 1,
  },
  cameraButtonText: {
    ...typography.h4,
    color: colors.primaryLight,
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  cameraButtonHint: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  photoPreviewContainer: {
    marginTop: spacing.sm,
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: 300,
    borderRadius: borderRadius.lg,
    resizeMode: 'cover',
  },
  removePhotoButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  removePhotoText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  photoActionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    justifyContent: 'center',
  },
  retakeButton: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  retakeButtonText: {
    ...typography.bodyMedium,
    color: colors.white,
    fontWeight: '700',
  },
  changePhotoButton: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  changePhotoButtonText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  uploadOptionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  uploadOption: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    minHeight: 100,
  },
  uploadOptionIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  uploadOptionIconGallery: {
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
  uploadOptionText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: spacing.xl,

  },
  completeButton: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  photosContainer: {
    marginTop: spacing.sm,
  },
  photosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  photosCount: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  addMoreButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
  },
  addMoreButtonText: {
    ...typography.bodyMedium,
    color: colors.primaryLight,
    fontWeight: '700',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  photoItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.sm,
  },
  photoItemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removePhotoItemButton: {
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
  removePhotoItemText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  addPhotoButton: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  addPhotoButtonText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  congratsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  
  congratsCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    elevation: 8,
  },
  
  congratsIconWrapper: {
    marginBottom: 16,
  },
  
  congratsIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  congratsTitle: {
    marginTop: 8,
    marginBottom: 4,
  },
  
  congratsSubtitle: {
    marginBottom: 12,
  },
  
  congratsMessage: {
    marginBottom: 24,
  },
  
  congratsButton: {
    width: '100%',
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  

});
