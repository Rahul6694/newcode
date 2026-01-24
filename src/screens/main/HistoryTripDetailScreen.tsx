import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Linking} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute, useNavigation, RouteProp, CommonActions} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {HistoryStackParamList, Trip, TripStatus, MainTabParamList} from '@/types';
import {Card, StatusBadge, Typography, useToast} from '@/components';
import {Header} from '@/components/Header';
import {colors, spacing, typography, borderRadius, shadows} from '@/theme/colors';
import { tripApi } from '@/apiservice/endpoints';



// Convert API response to Trip format
const convertApiResponseToTrip = (apiTrip: any): Trip => {
  return {
    id: apiTrip.id,
    tripNumber: apiTrip.tripNumber,
    orderNumber: apiTrip.order?.orderNumber || '',
    vehicleNumber: apiTrip.vehicle?.registrationNumber || '',
    assignedWeight: apiTrip.assignedWeight || '0',
    deliveredWeight: apiTrip.deliveredWeight || null,
    status: (apiTrip.status === 'COMPLETED' ? 'Completed' : apiTrip.status) as TripStatus,
    loadingLocation: {
      address: apiTrip.order?.loadingAddress || apiTrip.order?.loadingCity || 'Loading Location',
      coordinates: {
        latitude: 0,
        longitude: 0,
        accuracy: 10,
        timestamp: apiTrip.startTime ? new Date(apiTrip.startTime) : new Date(apiTrip.createdAt),
      },
      contactPerson: {
        name: apiTrip.order?.loadingContactName || 'Contact Person',
        phoneNumber: apiTrip.order?.loadingContactNumber || '0000000000',
      },
    },
    unloadingLocation: {
      address: apiTrip.order?.unloadingAddress || apiTrip.order?.unloadingCity || 'Unloading Location',
      coordinates: {
        latitude: 0,
        longitude: 0,
        accuracy: 10,
        timestamp: apiTrip.endTime ? new Date(apiTrip.endTime) : new Date(apiTrip.createdAt),
      },
      contactPerson: {
        name: apiTrip.order?.unloadingContactName || 'Contact Person',
        phoneNumber: apiTrip.order?.unloadingContactNumber || '0000000000',
      },
    },
    timeline: {
      assigned: new Date(apiTrip.createdAt),
      started: apiTrip.startTime ? new Date(apiTrip.startTime) : undefined,
      loaded: apiTrip.loadingDate ? new Date(apiTrip.loadingDate) : undefined,
      completed: apiTrip.endTime ? new Date(apiTrip.endTime) : undefined,
    },
    documents: {
      loading: [],
      unloading: [],
    },
    remarks: {
      loading: undefined,
      unloading: undefined,
    },
    trackingData: [],
  };
};

// Extended Trip type with API response fields
interface ExtendedTrip extends Trip {
  distance?: string;
  driver?: {
    fullName: string;
    mobileNumber: string;
    licenseNumber: string;
  };
  payment?: {
    tripAmount: string;
  };
  material?: {
    materialType: string;
  };
  vehicleMake?: string;
}


type HistoryTripDetailRouteProp = RouteProp<HistoryStackParamList, 'HistoryTripDetail'>;
type HistoryTripDetailNavigationProp = StackNavigationProp<HistoryStackParamList, 'HistoryTripDetail'>;

export const HistoryTripDetailScreen: React.FC = () => {
  const route = useRoute<HistoryTripDetailRouteProp>();
  const navigation = useNavigation<HistoryTripDetailNavigationProp>();
  const {tripId} = route.params;
  const {showError} = useToast();

  const [trip, setTrip] = useState<ExtendedTrip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTripDetails();
  }, [tripId]);

const handleCall = (phoneNumber: string) => {
  Linking.openURL(`tel:${phoneNumber}`);
};
  
  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      console.log('=== Fetching Trip Details ===');
      console.log('Trip ID:', tripId);
      
      const response = await tripApi.getTripById(tripId);
      
      console.log('Trip Details API Response:', {
        response: response,
        hasData: !!response?.data,
        responseType: typeof response,
        keys: response ? Object.keys(response) : [],
      });
      
      // Handle different response structures
      if (response) {
        let apiTrip = null;
        
        // Structure 1: {success, statusCode, message, data: {id, tripNumber, ...}}
        if (response.data && response.data.id) {
          apiTrip = response.data;
        }
        // Structure 2: Response is the trip object directly {id, tripNumber, ...}
        else if (response.id || (response as any).tripNumber) {
          apiTrip = response as any;
        }
        // Structure 3: {success, data: {trip: {...}}}
        else if ((response as any).data && (response as any).data.trip) {
          apiTrip = (response as any).data.trip;
        }
        // Structure 4: Direct trip in response.data but not wrapped
        else if ((response as any).data) {
          apiTrip = (response as any).data;
        }
        
        console.log('Extracted trip data:', {
          hasApiTrip: !!apiTrip,
          tripId: apiTrip?.id,
          tripNumber: apiTrip?.tripNumber,
        });
        
        if (apiTrip && (apiTrip.id || apiTrip.tripNumber)) {
          // Convert API response to ExtendedTrip format
          const convertedTrip = convertApiResponseToTrip(apiTrip);
          const extendedTrip: ExtendedTrip = {
            ...convertedTrip,
            distance: apiTrip.distance,
            driver: apiTrip.driver,
            payment: apiTrip.tripAmount ? {
              tripAmount: apiTrip.tripAmount,
            } : undefined,
            material: apiTrip.material,
            vehicleMake: apiTrip.vehicle?.vehicleMake,
          };
          
          setTrip(extendedTrip);
          console.log('Trip details loaded successfully');
        } else {
          console.log('No valid trip data found in response');
          showError('Trip not found');
          navigation.goBack();
        }
      } else {
        console.log('No response received');
        showError('Trip not found');
        navigation.goBack();
      }
    } catch (error: any) {
      console.log('=== Fetch Trip Details Error ===');
      console.log('Error:', error);
      console.log('Error response:', error?.response);
      console.log('Error status:', error?.response?.status);
      console.log('Error data:', error?.response?.data);
      
      // Check if it's a 404 error
      if (error?.response?.status === 404) {
        showError('Trip not found');
      } else {
        showError(error?.response?.data?.message || 'Failed to load trip details');
      }
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: Date) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(d));

  const calculateDuration = (start: Date, end: Date) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Typography variant="body" color="textSecondary" style={styles.loadingText}>Loading...</Typography>
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.center}>
        <Typography variant="body" color="error" style={styles.errorText}>Trip not found</Typography>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Trip History Details"
        onBackPress={() => {
          // Navigate back within History stack
          navigation.goBack();
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerCardHeader}>
            <View style={styles.headerCardHeaderLeft}>
              <Typography variant="h4" color="textPrimary" weight="700" style={styles.headerCardTitle}>Order Details</Typography>
              <Typography variant="bodyMedium" color="textSecondary" weight="500" style={styles.headerCardSubtitle}>{trip.tripNumber || `#${trip.id.slice(-6).toUpperCase()}`}</Typography>
            </View>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Typography variant="caption" color="primary" weight="700" style={styles.statusText}>{trip.status}</Typography>
            </View>
          </View>

          <View style={styles.orderDetailsList}>
            {trip.orderNumber && (
              <View style={styles.orderDetailRow}>
                <Typography variant="body" color="textSecondary" weight="500" style={styles.orderDetailLabel}>Order ID</Typography>
                <Typography variant="bodyMedium" color="textPrimary" weight="600" style={styles.orderDetailValue}>{trip.orderNumber}</Typography>
              </View>
            )}
            {trip.vehicleNumber && (
              <View style={styles.orderDetailRow}>
                <Typography variant="body" color="textSecondary" weight="500" style={styles.orderDetailLabel}>Vehicle</Typography>
                <Typography variant="bodyMedium" color="textPrimary" weight="600" style={styles.orderDetailValue}>{trip.vehicleNumber}</Typography>
              </View>
            )}
            {trip.assignedWeight && (
              <View style={styles.orderDetailRow}>
                <Typography variant="body" color="textSecondary" weight="500" style={styles.orderDetailLabel}>Weight</Typography>
                <Typography variant="bodyMedium" color="textPrimary" weight="600" style={styles.orderDetailValue}>{trip.assignedWeight} KG</Typography>
              </View>
            )}
          </View>
        </Card>

        {/* Route & Timeline */}
        <Card style={styles.section}>
          <Typography variant="bodyMedium" color="textPrimary" weight="600" style={styles.sectionTitle}>Route & Timeline</Typography>
          {trip.distance && (
            <View style={styles.routeInfo}>
              <View style={styles.routeTextContainer}>
                <Image 
                  source={require('@/assets/images/location.png')} 
                  style={styles.routeIcon}
                  resizeMode="contain"
                />
                <View style={styles.routeTextRow}>
                  <Typography variant="bodyMedium" color="textPrimary" weight="600" style={styles.routeText}>
                    {trip.loadingLocation.address.split(',')[0]}
                  </Typography>
                  <Image 
                    source={require('@/assets/images/next.png')} 
                    style={styles.routeArrow}
                    resizeMode="contain"
                  />
                  <Typography variant="bodyMedium" color="textPrimary" weight="600" style={styles.routeText}>
                    {trip.unloadingLocation.address.split(',')[0]}
                  </Typography>
                </View>
              </View>
              <Typography variant="bodyMedium" color="primary" weight="700" style={styles.distanceText}>{trip.distance} km</Typography>
            </View>
          )}
          <View style={styles.timeline}>
            {trip.timeline.assigned && (
              <View style={styles.timelineItem}>
                <Typography variant="bodyMedium" color="textSecondary" weight="600" style={styles.timelineLabel}>Assigned</Typography>
                <Typography variant="bodyMedium" color="textPrimary" weight="500" style={styles.timelineDate}>{formatDate(trip.timeline.assigned)}</Typography>
              </View>
            )}
            {trip.timeline.started && (
              <View style={styles.timelineItem}>
                <Typography variant="bodyMedium" color="textSecondary" weight="600" style={styles.timelineLabel}>Started</Typography>
                <Typography variant="bodyMedium" color="textPrimary" weight="500" style={styles.timelineDate}>{formatDate(trip.timeline.started)}</Typography>
              </View>
            )}
            {trip.timeline.completed && (
              <View style={styles.timelineItem}>
                <Typography variant="bodyMedium" color="textSecondary" weight="600" style={styles.timelineLabel}>Completed</Typography>
                <Typography variant="bodyMedium" color="textPrimary" weight="500" style={styles.timelineDate}>{formatDate(trip.timeline.completed)}</Typography>
              </View>
            )}
            {trip.timeline.started && trip.timeline.completed && (
              <View style={styles.timelineItem}>
                <Typography variant="bodyMedium" color="textSecondary" weight="600" style={styles.timelineLabel}>Duration</Typography>
                <Typography variant="bodyMedium" color="textPrimary" weight="500" style={styles.timelineDate}>
                  {calculateDuration(trip.timeline.started, trip.timeline.completed)}
                </Typography>
              </View>
            )}
          </View>
        </Card>

        {/* Pickup Location */}
        <Card style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Image 
              source={require('@/assets/images/location.png')} 
              style={styles.sectionTitleIcon}
              resizeMode="contain"
            />
            <Typography variant="bodyMedium" color="textPrimary" weight="600" style={styles.sectionTitle}>Pickup Location</Typography>
          </View>
          <Typography variant="bodyMedium" color="textPrimary" weight="500" style={styles.address}>
            {trip.loadingLocation.address || 'Location not specified'}
          </Typography>
          {trip.loadingLocation.contactPerson.phoneNumber ? (
            <View style={styles.contactRow}>
              <Typography variant="bodyMedium" color="textSecondary" weight="600" style={styles.contact}>{trip.loadingLocation.contactPerson.name}</Typography>
              <TouchableOpacity
                style={styles.callBtn}
               onPress={() => handleCall(trip.loadingLocation.contactPerson.phoneNumber || 'NA')}>
                <Image 
                  source={require('@/assets/images/phone-call.png')} 
                  style={styles.callIcon}
                  resizeMode="contain"
                />
                <Typography variant="smallMedium" color="primary" style={styles.callText}>Call</Typography>
              </TouchableOpacity>
            </View>
          ) : (
            <Typography variant="small" color="textTertiary" style={styles.noContact}>No contact information available</Typography>
          )}
        </Card>

        {/* Delivery Location */}
        <Card style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Image 
              source={require('@/assets/images/location.png')} 
              style={styles.sectionTitleIcon}
              resizeMode="contain"
            />
            <Typography variant="bodyMedium" color="textPrimary" weight="600" style={styles.sectionTitle}>Delivery Location</Typography>
          </View>
          <Typography variant="bodyMedium" color="textPrimary" weight="500" style={styles.address}>
            {trip.unloadingLocation.address || 'Location not specified'}
          </Typography>
          {trip.unloadingLocation.contactPerson.phoneNumber ? (
            <View style={styles.contactRow}>
              <Typography variant="bodyMedium" color="textSecondary" weight="600" style={styles.contact}>{trip.unloadingLocation.contactPerson.name}</Typography>
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => handleCall(trip.unloadingLocation.contactPerson.phoneNumber || 'NA')}>
                <Image 
                  source={require('@/assets/images/phone-call.png')} 
                  style={styles.callIcon}
                  resizeMode="contain"
                />
                <Typography variant="smallMedium" color="primary" style={styles.callText}>Call</Typography>
              </TouchableOpacity>
            </View>
          ) : (
            <Typography variant="small" color="textTertiary" style={styles.noContact}>No contact information available</Typography>
          )}
        </Card>

        {/* Weight & Load Information */}
        {(trip.assignedWeight || trip.deliveredWeight) && (
          <Card style={styles.section}>
            <Typography variant="bodyMedium" color="textPrimary" weight="600" style={styles.sectionTitle}>Weight & Load Information</Typography>
            <View style={styles.weightInfo}>
              {trip.deliveredWeight && (
                <View style={styles.weightRow}>
                  <Image 
                    source={require('@/assets/images/shipped.png')} 
                    style={styles.weightIcon}
                    resizeMode="contain"
                  />
                  <View style={styles.weightDetails}>
                    <Typography variant="bodyMedium" color="textPrimary" weight="700" style={styles.weightValue}>{trip.deliveredWeight} kg</Typography>
                    <Typography variant="bodyMedium" color="textSecondary" weight="600" style={styles.weightLabel}>Delivered Weight</Typography>
                    {trip.assignedWeight && (
                      <Typography variant="small" color="warning" style={styles.assignedWeight}>Assigned: {trip.assignedWeight} kg</Typography>
                    )}
                  </View>
                </View>
              )}
              {trip.vehicleMake && (
                <View style={styles.vehicleInfoRow}>
                  <Typography variant="smallMedium" color="textSecondary" style={styles.vehicleInfoText}>Vehicle Make: {trip.vehicleMake}</Typography>
                  {trip.vehicleNumber && (
                    <Typography variant="smallMedium" color="textSecondary" style={styles.vehicleInfoText}>Vehicle Number: {trip.vehicleNumber}</Typography>
                  )}
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Driver & Vehicle Details */}
        {trip.driver && (
          <Card style={styles.section}>
            <Typography variant="bodyMedium" color="textPrimary" weight="600" style={styles.sectionTitle}>Driver & Vehicle Details</Typography>
            <View style={styles.driverInfo}>
              <View style={styles.driverAvatar}>
                <Typography variant="h3" color="primary" weight="700" style={styles.driverAvatarText}>{trip.driver.fullName.charAt(0)}</Typography>
              </View>
              <View style={styles.driverDetails}>
                <Typography variant="bodyMedium" color="textPrimary" weight="600" style={styles.driverName}>{trip.driver.fullName}</Typography>
                <Typography variant="bodyMedium" color="textSecondary" weight="500" style={styles.driverPhone}>{trip.driver.mobileNumber}</Typography>
                <Typography variant="bodyMedium" color="textSecondary" weight="500" style={styles.driverLicense}>License: {trip.driver.licenseNumber}</Typography>
                {trip.vehicleNumber && (
                  <Typography variant="small" color="textTertiary" style={styles.vehicleId}>Vehicle: {trip.vehicleNumber}</Typography>
                )}
              </View>
              <TouchableOpacity
                style={styles.callDriverBtn}
             onPress={() => handleCall(trip.driver.mobileNumber || 'NA')}>
                <Image 
                  source={require('@/assets/images/phone-call.png')} 
                  style={styles.callDriverIcon}
                  resizeMode="contain"
                />
                <Typography variant="bodyMedium" color="white" weight="600" style={styles.callDriverText}>Call</Typography>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Material Information */}
        {trip.material && (
          <Card style={styles.section}>
            <Typography variant="bodyMedium" color="textPrimary" weight="600" style={styles.sectionTitle}>Material Information</Typography>
            <View style={styles.infoRow}>
              <Typography variant="bodyMedium" color="textSecondary" weight="500" style={styles.infoLabel}>Material Type</Typography>
              <Typography variant="bodyMedium" color="textPrimary" weight="600" style={styles.infoValue}>{trip.material.materialType}</Typography>
            </View>
          </Card>
        )}

        {/* Payment Summary */}
        {trip.payment && (
          <Card style={styles.section}>
            <Typography variant="bodyMedium" color="textPrimary" weight="600" style={styles.sectionTitle}>Payment Summary</Typography>
            <View style={styles.paymentInfo}>
              <View style={styles.paymentLeft}>
                <Typography variant="h3" color="primary" weight="700" style={styles.paymentAmount}>₹{parseFloat(trip.payment.tripAmount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</Typography>
                <Typography variant="bodyMedium" color="textSecondary" weight="600" style={styles.paymentLabel}>Trip Payout</Typography>
              </View>
            </View>
          </Card>
        )}
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
    padding: spacing.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
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
  headerCard: {
    marginBottom: spacing.lg,
  },
  headerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerCardHeaderLeft: {
    flex: 1,
  },
  headerCardTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xs,
    fontSize: 18,
  },
  headerCardSubtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  orderDetailsList: {
    gap: 0,
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
    flex: 1,
  },
  orderDetailValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'right',
    flex: 1,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitleIcon: {
    width: 18,
    height: 18,
    marginRight: spacing.sm,
    tintColor: colors.textPrimary,
  },
  sectionTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  routeInfo: {
    marginBottom: spacing.md,
  },
  routeTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  routeIcon: {
    width: 16,
    height: 16,
    marginRight: spacing.xs,
    tintColor: colors.textPrimary,
  },
  routeTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  routeText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    fontSize: 15,
    fontWeight: '600',
  },
  routeArrow: {
    width: 16,
    height: 16,
    tintColor: colors.textPrimary,
  },
  distanceText: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  timeline: {
    gap: spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  timelineLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  timelineDate: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '500',
    fontSize: 15,
  },
  address: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    
    fontSize: 15,
    fontWeight: '500',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  contact: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  noContact: {
    ...typography.small,
    color: colors.textTertiary,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  callBtn: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  callIcon: {
    width: 14,
    height: 14,
    tintColor: colors.primary,
  },
  callText: {
    ...typography.smallMedium,
    color: colors.primary,
  },
  weightInfo: {
    gap: spacing.md,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  weightIcon: {
    width: 40,
    height: 40,
    tintColor: colors.textPrimary,
  },
  weightDetails: {
    flex: 1,
  },
  weightValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xs,
    fontSize: 15,
  },
  weightLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontSize: 14,
    fontWeight: '600',
  },
  assignedWeight: {
    ...typography.small,
    color: colors.warning,
  },
  vehicleInfoRow: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  vehicleInfoText: {
    ...typography.smallMedium,
    color: colors.textSecondary,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverAvatarText: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
  },
  driverDetails: {
    flex: 1,
    gap: spacing.xs,
  },
  driverName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  driverPhone: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  driverLicense: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  vehicleId: {
    ...typography.small,
    color: colors.textTertiary,
  },
  callDriverBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  callDriverIcon: {
    width: 18,
    height: 18,
    tintColor: colors.white,
  },
  callDriverText: {
    ...typography.bodyMedium,
    color: colors.white,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontWeight: '500',
    flex: 1,
    fontSize: 14,
  },
  infoValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    fontSize: 15,
  },
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  paymentLeft: {
    flex: 1,
  },
  paymentAmount: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: spacing.xs,
    fontSize: 20,
  },
  paymentLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
