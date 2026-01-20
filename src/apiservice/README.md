/**
 * API Service Usage Guide
 * 
 * This directory contains all API-related files for the application.
 * 
 * Files:
 * - axiosInstance.ts: Configured axios instance with interceptors
 * - ApiClient.ts: Generic HTTP client class with GET, POST, PUT, PATCH, DELETE methods
 * - endpoints.ts: All API endpoint definitions organized by feature
 * - index.ts: Barrel export file
 * 
 * Usage Examples:
 * 
 * 1. Using authApi:
 *    import { authApi } from '@/apiservice';
 *    const response = await authApi.login('user@example.com', 'password');
 * 
 * 2. Using userApi:
 *    import { userApi } from '@/apiservice';
 *    const profile = await userApi.getProfile();
 *    await userApi.updateProfile({name: 'John Doe'});
 * 
 * 3. Using tripApi:
 *    import { tripApi } from '@/apiservice';
 *    const trips = await tripApi.getAllTrips({page: 1, limit: 10});
 *    const trip = await tripApi.getTripById('trip-id');
 * 
 * 4. Uploading files:
 *    import { documentApi } from '@/apiservice';
 *    const formData = new FormData();
 *    formData.append('file', {uri, type, name});
 *    await documentApi.uploadDocument('trip-id', formData);
 * 
 * 5. Using raw ApiClient for custom requests:
 *    import { ApiClient } from '@/apiservice';
 *    const data = await ApiClient.post('/custom-endpoint', {custom: 'data'});
 * 
 * Features:
 * - Automatic token injection via interceptors
 * - Global error handling
 * - TypeScript support with generics
 * - Organized endpoints by feature
 * - File upload support
 * - Automatic token refresh on 401 errors
 */
