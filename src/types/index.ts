// Core Types
export interface User {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  mobileNumber: string;
  transportCompany: string;
  // Extended profile fields from API
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  designation?: string;
  govtId?: string;
  organizationName?: string;
  organizationRegNumber?: string;
  issuingAuthority?: string;
  registrationCertificate?: string;
  // Additional fields
  userType?: string;
  status?: string;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  documents?: any[];
}

export interface ProfileUpdateData {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  designation?: string;
  govtId?: string;
  organizationName?: string;
  organizationRegNumber?: string;
  issuingAuthority?: string;
  registrationCertificate?: string;
}

export interface OTPRequest {
  email: string;
  purpose: 'VERIFY_EMAIL' | 'RESET_PASSWORD';
}

export interface OTPVerifyRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
  panel: 'DRIVER';
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

export interface Contact {
  name: string;
  phoneNumber: string;
}

export interface Location {
  address: string;
  coordinates: LocationCoordinates;
  contactPerson: Contact;
}

export type TripStatus = 'Assigned' | 'In Progress' | 'Loaded' | 'Arrived' | 'Completed';

export interface Document {
  id: string;
  tripId: string;
  stage: DocumentStage;
  uri: string;
  type: 'image' | 'pdf';
  name: string;
  size: number;
  uploadedAt: Date;
  uploaded: boolean;
}

export type DocumentStage = 'loading' | 'unloading';

export interface Trip {
  id: string;
  tripNumber?: string;
  orderNumber?: string;
  vehicleNumber?: string;
  assignedWeight?: string;
  deliveredWeight?: string | null;
  status: TripStatus;
  loadingLocation: Location;
  unloadingLocation: Location;
  timeline: {
    assigned: Date;
    started?: Date;
    loaded?: Date;
    arrived?: Date;
    completed?: Date;
  };
  documents: {
    loading: Document[];
    unloading: Document[];
  };
  remarks: {
    loading?: string;
    unloading?: string;
  };
  trackingData: LocationPoint[];
}

export interface LocationPoint {
  id: number;
  tripId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  uploaded: boolean;
}

export interface DocumentFile {
  uri: string;
  type: 'image' | 'pdf';
  name: string;
  size: number;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
  message?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'trip_assignment' | 'arrival' | 'completion';
  timestamp: Date;
  read: boolean;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  TODO: undefined;
  History: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: {email: string};
};

export type TodoStackParamList = {
  TodoList: undefined;
  TripDetail: {tripId: string};
  DocumentUpload: {tripId: string; stage: 'loading' | 'unloading'};
  LocationMark: {tripId: string ,stage:any};
  TripInProgress: {tripId: string};
  MarkComplete: {tripId: string};
};

export type HistoryStackParamList = {
  HistoryList: undefined;
  HistoryTripDetail: {tripId: string};
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
};

// Store Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
  validateSession: () => Promise<boolean>;
  updateUser: (user: User) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResult>;
}

export interface TripState {
  active: Trip[];
  history: Trip[];
  current: Trip | null;
  loading: boolean;
  error: string | null;
  getActiveTrips: () => Promise<void>;
  getTripHistory: () => Promise<void>;
  updateTripStatus: (tripId: string, status: TripStatus) => Promise<void>;
  setCurrentTrip: (trip: Trip | null) => void;
  getTripById: (tripId: string) => Promise<Trip | null>;
  addRemarks: (tripId: string, stage: 'loading' | 'unloading', remarks: string) => Promise<void>;
  refreshTrips: () => Promise<void>;
  clearError: () => void;
}

export interface GPSState {
  isTracking: boolean;
  currentLocation: LocationCoordinates | null;
  trackingTripId: string | null;
  startTracking: (tripId: string) => Promise<void>;
  stopTracking: () => Promise<void>;
  getCurrentLocation: () => Promise<LocationCoordinates | null>;
  setCurrentLocation: (location: LocationCoordinates | null) => void;
  setIsTracking: (isTracking: boolean) => void;
  setTrackingTripId: (tripId: string | null) => void;
}

export interface UIState {
  activeTab: keyof MainTabParamList;
  isOnline: boolean;
  notifications: Notification[];
  setActiveTab: (tab: keyof MainTabParamList) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
}