// CORRECTED React Native implementation
// This should work in your React Native app

import { tripApi } from './src/apiservice/endpoints';
import { documentService } from './src/services/documentService';

async function uploadLoadingDocument(tripId) {
  try {
    // Step 1: Get the document (from camera or gallery)
    const documentResult = await documentService.showDocumentPickerCamera();
    // OR: const documentResult = await documentService.showDocumentPickerGallery();

    // Step 2: Create FormData for upload
    const formData = new FormData();

    // Append the file - React Native FormData handles file objects differently
    formData.append('documents', {
      uri: documentResult.document.uri,
      type: 'image/jpeg', // or 'image/png' depending on your image type
      name: documentResult.document.name,
    });

    // Append remarks
    formData.append('remarks', 'Loading completed');

    // Step 3: Upload using your existing API infrastructure
    const response = await tripApi.uploadDocument(tripId, formData);

    if (response.success) {
      console.log('Upload successful:', response.data);
      return response.data;
    } else {
      console.error('Upload failed:', response.message);
      throw new Error(response.message);
    }

  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}

// Usage example:
const tripId = 'eec75852-be05-47bc-9678-c9c8bcc67d20';
uploadLoadingDocument(tripId);

