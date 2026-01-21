import ImageCropPicker from 'react-native-image-crop-picker';
import {permissionService} from '@/services/permissionService';

export interface DocumentPickerResult {
  document: {
    uri: string;
    type: 'image' | 'pdf';
    name: string;
    size: number;
  };
}

export const documentService = {
  showDocumentPickerCamera: async (): Promise<DocumentPickerResult> => {
    try {
      console.log('[documentService] Requesting camera permission...');
      const granted = await permissionService.requestCameraWithPrompt();
      
      if (!granted) {
        console.warn('[documentService] Camera permission denied');
        throw new Error('Camera permission denied');
      }
      
      console.log('[documentService] Opening camera...');
      const image = await ImageCropPicker.openCamera({
        width: 1920,
        height: 1920,
        cropping: true,
        cropperCircleOverlay: false,
        compressImageQuality: 0.8,
        mediaType: 'photo',
        includeExif: true,
      });
      
      console.log('[documentService] Photo captured:', image.path);
      return {
        document: {
          uri: image.path,
          type: 'image',
          name: `document_${Date.now()}.jpg`,
          size: image.size || 0,
        },
      };
    } catch (error: any) {
      console.log('[documentService] Camera error:', error);
      throw error;
    }
  },

  showDocumentPickerGallery: async (): Promise<DocumentPickerResult> => {
    try {
      console.log('[documentService] Requesting gallery permission...');
      const granted = await permissionService.requestGalleryWithPrompt();
      
      if (!granted) {
        console.warn('[documentService] Gallery permission denied');
        throw new Error('Gallery permission denied');
      }
      
      console.log('[documentService] Opening gallery...');
      const image = await ImageCropPicker.openPicker({
        mediaType: 'photo',
        compressImageQuality: 0.8,
      });
      
      console.log('[documentService] Image selected:', image.path);
      return {
        document: {
          uri: image.path,
          type: 'image',
          name: `document_${Date.now()}.jpg`,
          size: image.size || 0,
        },
      };
    } catch (error: any) {
      console.log('[documentService] Gallery error:', error);
      throw error;
    }
  },

  showDocumentPicker: async (): Promise<DocumentPickerResult> => {
    throw new Error('Use showDocumentPickerCamera or showDocumentPickerGallery instead');
  },
};
