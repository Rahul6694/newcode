import ApiClient, { ApiResponse } from './ApiClient';

// Auth endpoints
export const authApi = {
  login: (email: string, password: string) =>
    ApiClient.post('/auth/login', { email, password }),

  logout: (): Promise<ApiResponse> => ApiClient.post('/auth/logout'),

  refreshToken: (): Promise<ApiResponse> =>
    ApiClient.post('/auth/refresh-token'),

  forgotPassword: (email: string): Promise<ApiResponse> =>
    ApiClient.post('/auth/forgot-password', { email, panel: 'DRIVER' }),

  resetPassword: (email: string, otp: string, newPassword: string) =>
    ApiClient.post('/auth/reset-password', { email, otp, newPassword }),
  verifyOtp: (email: string, otp: string): Promise<ApiResponse> =>
    ApiClient.post('/auth/verify-otp', { email, otp }),
};

// Trip endpoints
export const tripApi = {
  getAllTrips: (params?: any): Promise<ApiResponse> =>
    ApiClient.get('/trips', { params }),

  getTripById: (tripId: string): Promise<ApiResponse> =>
    ApiClient.get(`/trips/${tripId}`),


  startTrip: (
    tripId: string,
    payload: { latitude: number; longitude: number }
  ): Promise<ApiResponse> =>
    ApiClient.post(`/trips/${tripId}/start`, payload),


  completeTrip: (tripId: string, data: any): Promise<ApiResponse> =>
    ApiClient.post(`/trips/${tripId}/complete`, data),

  getTripHistory: (page: number = 1, limit: number = 10): Promise<ApiResponse> =>
    ApiClient.get('/trips/driver/history', {
      params: { page, limit },
    }),

  getActiveTrip: (params?: any): Promise<ApiResponse> =>
    ApiClient.get('/trips/driver/active', { params }),

  getDeatilsTrip: (id: string): Promise<ApiResponse> =>
    ApiClient.get(`/trips/${id}`),
  /** NEW: Upload Loading Documents */


  /** NEW: Mark Trip as Loaded with Remarks */
  markLoaded: (tripId: string, loadingRemarks: string): Promise<ApiResponse> =>
    ApiClient.post(
      `/trips/${tripId}/mark-loaded`,
      { loadingRemarks }
    ),
    markArrived: (
  tripId: string,
  payload: { arrivedLatitude: number; arrivedLongitude: number }
): Promise<ApiResponse> =>
  ApiClient.post(`/trips/${tripId}/mark-arrived`, payload),

   uploadDocument: (tripId: string, formData: FormData): Promise<ApiResponse> =>
    ApiClient.uploadFile(`/trips/${tripId}/upload-loading-docs`, formData),

};

// Location endpoints
export const locationApi = {

  markLocation: (
    tripId: string,
    name: string,
    coordinates: any,
  ): Promise<ApiResponse> =>
    ApiClient.post(`/location/mark/${tripId}`, { name, coordinates }),
};


 

// Notification endpoints
export const notificationApi = {
  getNotifications: (params?: any): Promise<ApiResponse> =>
    ApiClient.get('/notifications', { params }),

  markAsRead: (notificationId: string): Promise<ApiResponse> =>
    ApiClient.post(`/notifications/${notificationId}/read`),

  deleteNotification: (notificationId: string): Promise<ApiResponse> =>
    ApiClient.delete(`/notifications/${notificationId}`),

  updateNotificationSettings: (settings: any): Promise<ApiResponse> =>
    ApiClient.put('/notifications/settings', settings),
};

// Support endpoints
export const supportApi = {
  submitTicket: (data: any): Promise<ApiResponse> =>
    ApiClient.post('/support/tickets', data),

  getTickets: (params?: any): Promise<ApiResponse> =>
    ApiClient.get('/support/tickets', { params }),

  getTicketById: (ticketId: string): Promise<ApiResponse> =>
    ApiClient.get(`/support/tickets/${ticketId}`),

  addComment: (ticketId: string, comment: string): Promise<ApiResponse> =>
    ApiClient.post(`/support/tickets/${ticketId}/comments`, { comment }),

  uploadTicketAttachment: (
    ticketId: string,
    formData: FormData,
  ): Promise<ApiResponse> =>
    ApiClient.uploadFile(`/support/tickets/${ticketId}/attachments`, formData),
};

// Dashboard endpoints
export const dashboardApi = {
  getDashboardStats: (): Promise<ApiResponse> =>
    ApiClient.get('/dashboard/stats'),

  getEarnings: (params?: any): Promise<ApiResponse> =>
    ApiClient.get('/dashboard/earnings', { params }),

  getPerformanceMetrics: (): Promise<ApiResponse> =>
    ApiClient.get('/dashboard/performance'),
};
