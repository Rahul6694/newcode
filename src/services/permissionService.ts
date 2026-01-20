import {PermissionsAndroid, Platform, Linking, Alert} from 'react-native';
import {PERMISSIONS, RESULTS, check, request, checkMultiple, requestMultiple} from 'react-native-permissions';

export type PermissionResult = 'granted' | 'denied' | 'blocked';

interface PermissionCheck {
  status: PermissionResult;
  granted: boolean;
}

class PermissionService {
  /**
   * Check camera permission status
   */
  async checkCameraPermission(): Promise<PermissionResult> {
    console.log('[PermissionService] Checking camera permission...');
    try {
      if (Platform.OS === 'ios') {
        const result = await check(PERMISSIONS.IOS.CAMERA);
        console.log('[PermissionService] iOS camera status:', result);
        return this.mapPermissionResult(result);
      } else {
        const result = await check(PERMISSIONS.ANDROID.CAMERA);
        console.log('[PermissionService] Android camera status:', result);
        return this.mapPermissionResult(result);
      }
    } catch (error) {
      console.error('[PermissionService] Error checking camera permission:', error);
      return 'denied';
    }
  }

  /**
   * Check gallery/photo permission status
   */
  async checkGalleryPermission(): Promise<PermissionResult> {
    console.log('[PermissionService] Checking gallery permission...');
    try {
      if (Platform.OS === 'ios') {
        const result = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
        console.log('[PermissionService] iOS gallery status:', result);
        return this.mapPermissionResult(result);
      } else {
        // For Android 13+, use READ_MEDIA_IMAGES, otherwise use READ_EXTERNAL_STORAGE
        const permission = Platform.Version >= 33 
          ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES 
          : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
        const result = await check(permission);
        console.log('[PermissionService] Android gallery status:', result);
        return this.mapPermissionResult(result);
      }
    } catch (error) {
      console.error('[PermissionService] Error checking gallery permission:', error);
      return 'denied';
    }
  }

  /**
   * Request camera permission with user prompt
   */
  async requestCameraWithPrompt(): Promise<boolean> {
    console.log('[PermissionService] Requesting camera permission...');
    try {
      if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.CAMERA);
        console.log('[PermissionService] iOS camera request result:', result);
        return result === RESULTS.GRANTED;
      } else {
        const result = await request(PERMISSIONS.ANDROID.CAMERA);
        console.log('[PermissionService] Android camera request result:', result);
        return result === RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('[PermissionService] Error requesting camera permission:', error);
      return false;
    }
  }

  /**
   * Request gallery permission with user prompt
   */
  async requestGalleryWithPrompt(): Promise<boolean> {
    console.log('[PermissionService] Requesting gallery permission...');
    try {
      if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        console.log('[PermissionService] iOS gallery request result:', result);
        return result === RESULTS.GRANTED;
      } else {
        const permission = Platform.Version >= 33 
          ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES 
          : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
        const result = await request(permission);
        console.log('[PermissionService] Android gallery request result:', result);
        return result === RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('[PermissionService] Error requesting gallery permission:', error);
      return false;
    }
  }

  /**
   * Request both camera and gallery permissions
   */
  async requestCameraAndGalleryPermissions(): Promise<{
    camera: boolean;
    gallery: boolean;
  }> {
    console.log('[PermissionService] Requesting camera and gallery permissions...');
    try {
      if (Platform.OS === 'ios') {
        const [cameraResult, galleryResult] = await requestMultiple([
          PERMISSIONS.IOS.CAMERA,
          PERMISSIONS.IOS.PHOTO_LIBRARY,
        ]);
        const camera = cameraResult === RESULTS.GRANTED;
        const gallery = galleryResult === RESULTS.GRANTED;
        console.log('[PermissionService] iOS permissions result:', {camera, gallery});
        return {camera, gallery};
      } else {
        const permission = Platform.Version >= 33 
          ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES 
          : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
        const [cameraResult, galleryResult] = await requestMultiple([
          PERMISSIONS.ANDROID.CAMERA,
          permission,
        ]);
        const camera = cameraResult === RESULTS.GRANTED;
        const gallery = galleryResult === RESULTS.GRANTED;
        console.log('[PermissionService] Android permissions result:', {camera, gallery});
        return {camera, gallery};
      }
    } catch (error) {
      console.error('[PermissionService] Error requesting multiple permissions:', error);
      return {camera: false, gallery: false};
    }
  }

  /**
   * Open app settings to allow user to change permissions manually
   */
  async openAppSettings(): Promise<void> {
    console.log('[PermissionService] Opening app settings...');
    try {
      if (Platform.OS === 'ios') {
        Linking.openURL('app-settings:');
      } else {
        Linking.openSettings();
      }
    } catch (error) {
      console.error('[PermissionService] Error opening app settings:', error);
      Alert.alert(
        'Settings',
        'Unable to open settings. Please enable permissions manually in your device settings.',
        [{text: 'OK'}]
      );
    }
  }

  /**
   * Map react-native-permissions result to simplified status
   */
  private mapPermissionResult(result: string): PermissionResult {
    switch (result) {
      case RESULTS.GRANTED:
        return 'granted';
      case RESULTS.BLOCKED:
        return 'blocked';
      case RESULTS.DENIED:
      case RESULTS.UNAVAILABLE:
      default:
        return 'denied';
    }
  }
}

export const permissionService = new PermissionService();
