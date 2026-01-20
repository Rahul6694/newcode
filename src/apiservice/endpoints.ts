import ApiClient, {ApiResponse} from './ApiClient';

// Auth endpoints
export const authApi = {

  login: (email: string, password: string) =>
    ApiClient.post('/auth/login', { email, password }),

  register: (userData: any): Promise<ApiResponse> =>
    ApiClient.post('/auth/register', userData),

  logout: (): Promise<ApiResponse> =>
    ApiClient.post('/auth/logout'),

  refreshToken: (): Promise<ApiResponse> =>
    ApiClient.post('/auth/refresh-token'),

  forgotPassword: (email: string): Promise<ApiResponse> =>
    ApiClient.post('/auth/forgot-password', {email,panel: 'DRIVER'}),

resetPassword: (email: string, otp: string, newPassword: string) => 
    ApiClient.post('/auth/reset-password', { email, otp, newPassword }),
  verifyOtp: (email: string, otp: string): Promise<ApiResponse> =>
    ApiClient.post('/auth/verify-otp', {email, otp}),
};

// User endpoints
export const userApi = {
  getProfile: (): Promise<ApiResponse> =>
    ApiClient.get('/auth/profile'),

 

  changePassword: (oldPassword: string, newPassword: string): Promise<ApiResponse> =>
    ApiClient.post('/user/change-password', {oldPassword, newPassword}),

  uploadProfileImage: (formData: FormData): Promise<ApiResponse> =>
    ApiClient.uploadFile('/user/profile/image', formData),

  deleteAccount: (): Promise<ApiResponse> =>
    ApiClient.delete('/user/account'),
};

// Trip endpoints
export const tripApi = {
  getAllTrips: (params?: any): Promise<ApiResponse> =>
    ApiClient.get('/trips', {params}),

  getTripById: (tripId: string): Promise<ApiResponse> =>
    ApiClient.get(`/trips/${tripId}`),

  createTrip: (tripData: any): Promise<ApiResponse> =>
    ApiClient.post('/trips', tripData),

  updateTrip: (tripId: string, tripData: any): Promise<ApiResponse> =>
    ApiClient.put(`/trips/${tripId}`, tripData),

  deleteTrip: (tripId: string): Promise<ApiResponse> =>
    ApiClient.delete(`/trips/${tripId}`),

  startTrip: (tripId: string): Promise<ApiResponse> =>
    ApiClient.post(`/trips/${tripId}/start`),

  completeTrip: (tripId: string, data: any): Promise<ApiResponse> =>
    ApiClient.post(`/trips/${tripId}/complete`, data),

  getTripHistory: (params?: any): Promise<ApiResponse> =>
    ApiClient.get('/trips/history', {params}),
};

// Location endpoints
export const locationApi = {
  updateLocation: (latitude: number, longitude: number): Promise<ApiResponse> =>
    ApiClient.post('/location/update', {latitude, longitude}),

  getLocationHistory: (tripId: string): Promise<ApiResponse> =>
    ApiClient.get(`/location/history/${tripId}`),

  markLocation: (tripId: string, name: string, coordinates: any): Promise<ApiResponse> =>
    ApiClient.post(`/location/mark/${tripId}`, {name, coordinates}),
};

// Document endpoints
export const documentApi = {
  uploadDocument: (tripId: string, formData: FormData): Promise<ApiResponse> =>
    ApiClient.uploadFile(`/documents/${tripId}/upload`, formData),

  getDocuments: (tripId: string): Promise<ApiResponse> =>
    ApiClient.get(`/documents/${tripId}`),

  deleteDocument: (documentId: string): Promise<ApiResponse> =>
    ApiClient.delete(`/documents/${documentId}`),

  verifyDocument: (documentId: string, data: any): Promise<ApiResponse> =>
    ApiClient.post(`/documents/${documentId}/verify`, data),
};

// Notification endpoints
export const notificationApi = {
  getNotifications: (params?: any): Promise<ApiResponse> =>
    ApiClient.get('/notifications', {params}),

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
    ApiClient.get('/support/tickets', {params}),

  getTicketById: (ticketId: string): Promise<ApiResponse> =>
    ApiClient.get(`/support/tickets/${ticketId}`),

  addComment: (ticketId: string, comment: string): Promise<ApiResponse> =>
    ApiClient.post(`/support/tickets/${ticketId}/comments`, {comment}),

  uploadTicketAttachment: (ticketId: string, formData: FormData): Promise<ApiResponse> =>
    ApiClient.uploadFile(`/support/tickets/${ticketId}/attachments`, formData),
};

// Dashboard endpoints
export const dashboardApi = {
  getDashboardStats: (): Promise<ApiResponse> =>
    ApiClient.get('/dashboard/stats'),

  getEarnings: (params?: any): Promise<ApiResponse> =>
    ApiClient.get('/dashboard/earnings', {params}),

  getPerformanceMetrics: (): Promise<ApiResponse> =>
    ApiClient.get('/dashboard/performance'),
};
