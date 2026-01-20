import {useState, useCallback} from 'react';
import {permissionService, PermissionResult} from '@/services/permissionService';

interface PermissionState {
  camera: PermissionResult | null;
  gallery: PermissionResult | null;
  loading: boolean;
}

export const usePermissions = () => {
  const [state, setState] = useState<PermissionState>({
    camera: null,
    gallery: null,
    loading: false,
  });

  const checkCameraPermission = useCallback(async () => {
    setState(prev => ({...prev, loading: true}));
    const result = await permissionService.checkCameraPermission();
    setState(prev => ({...prev, camera: result, loading: false}));
    return result;
  }, []);

  const checkGalleryPermission = useCallback(async () => {
    setState(prev => ({...prev, loading: true}));
    const result = await permissionService.checkGalleryPermission();
    setState(prev => ({...prev, gallery: result, loading: false}));
    return result;
  }, []);

  const requestCameraPermission = useCallback(async () => {
    setState(prev => ({...prev, loading: true}));
    const granted = await permissionService.requestCameraWithPrompt();
    const result = await permissionService.checkCameraPermission();
    setState(prev => ({...prev, camera: result, loading: false}));
    return granted;
  }, []);

  const requestGalleryPermission = useCallback(async () => {
    setState(prev => ({...prev, loading: true}));
    const granted = await permissionService.requestGalleryWithPrompt();
    const result = await permissionService.checkGalleryPermission();
    setState(prev => ({...prev, gallery: result, loading: false}));
    return granted;
  }, []);

  const checkAllPermissions = useCallback(async () => {
    setState(prev => ({...prev, loading: true}));
    const [camera, gallery] = await Promise.all([
      permissionService.checkCameraPermission(),
      permissionService.checkGalleryPermission(),
    ]);
    setState({camera, gallery, loading: false});
    return {camera, gallery};
  }, []);

  const requestAllPermissions = useCallback(async () => {
    setState(prev => ({...prev, loading: true}));
    const result = await permissionService.requestCameraAndGalleryPermissions();
    const [camera, gallery] = await Promise.all([
      permissionService.checkCameraPermission(),
      permissionService.checkGalleryPermission(),
    ]);
    setState({camera, gallery, loading: false});
    return result;
  }, []);

  const openSettings = useCallback(async () => {
    await permissionService.openAppSettings();
  }, []);

  return {
    ...state,
    checkCameraPermission,
    checkGalleryPermission,
    requestCameraPermission,
    requestGalleryPermission,
    checkAllPermissions,
    requestAllPermissions,
    openSettings,
  };
};
