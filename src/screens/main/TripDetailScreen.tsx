import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking, RefreshControl, Image, Animated, PanResponder, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { navigationService } from '@/services/navigationService';
import { TripStatus, TodoStackParamList, DocumentStage } from '@/types';
import { Button, Card, Modal, Input, useToast, Typography } from '@/components';
import { Header } from '@/components/Header';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme/colors';
import { tripApi } from '@/apiservice';



type TripDetailRouteProp = RouteProp<TodoStackParamList, 'TripDetail'>;
type TripDetailNavigationProp = StackNavigationProp<TodoStackParamList, 'TripDetail'>;

export const TripDetailScreen: React.FC = () => {
  const route = useRoute<TripDetailRouteProp>();
  const navigation = useNavigation<TripDetailNavigationProp>();
  const { tripId } = route.params;
  const { showSuccess,showError } = useToast();


  const [refreshing, setRefreshing] = useState(false);
  const [remarksModal, setRemarksModal] = useState(false);
  const [remarksText, setRemarksText] = useState('');
  const [remarksStage, setRemarksStage] = useState<'loading' | 'unloading'>('loading');
  const [confirmModal, setConfirmModal] = useState(false);
  const slideProgress = useRef(new Animated.Value(0)).current;
  const [isSliding, setIsSliding] = useState(false);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // console.log()


  const [data, setData] = useState([]);



  useEffect(() => {
    getActiveTrips()
  }, []);


  const trips = Array.isArray(data) && data.length > 0 ? data[0] : null;



  const getActiveTrips = async () => {
    try {
      const res = await tripApi.getActiveTrip();
      if (res) {
        console.log('Profile data:', res);
        const data = res.data || res;
        setData(data || [])
        console.log('efefe', data);
      } else {
        const errorMsg = res?.message || 'Failed to load profile';
        console.log('Profile data:', res);
      }
    } catch (error: any) {
      console.log('Load profile error:', error);
    } finally {
    }
  };

  // const getDeatilsTrip = async () => {
  //   try {
  //     const res = await tripApi.getDeatilsTrip(tripId);
  //     if (res) {
  //       console.log('Profile data:123', res);
  //       const data = res.data || res;
  //       setTrip(data)

  //       console.log(data, 'data==============>');
  //     } else {
  //       const errorMsg = res?.message || 'Failed to load profile';
  //       console.log('Profile data:', res);
  //     }
  //   } catch (error: any) {
  //     console.log('Load profile error:', error);
  //   } finally {
  //   }
  // };
  const getDeatilsTrip = async () => {
    setLoading(true);
    try {
      const res = await tripApi.getDeatilsTrip(tripId);
      if (res) {
        const data = res.data || res;
        setTrip(data);
      } else {
        console.log('Profile data:', res);
      }
    } catch (error: any) {
      console.log('Load profile error:', error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    getDeatilsTrip()
  }, [useIsFocused()]);




  // Simple refresh handler (UI only)
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const slideButtonWidth = Dimensions.get('window').width - (spacing.lg * 2);
  const thumbSize = 57; // Match actual thumb size from styles
  const thumbPadding = 2.5; // Button height 62 - thumb height 57 = 5, divided by 2 for top/bottom
  const maxSlideDistance = slideButtonWidth - thumbSize - (thumbPadding * 2);

  const thumbLeft = slideProgress.interpolate({
    inputRange: [0, maxSlideDistance],
    outputRange: [thumbPadding, maxSlideDistance + thumbPadding],
    extrapolate: 'clamp',
  });

  const slideButtonOpacity = slideProgress.interpolate({
    inputRange: [0, maxSlideDistance * 0.7],
    outputRange: [1, 0.3],
    extrapolate: 'clamp',
  });

  const slidePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setIsSliding(true);
    },
    onPanResponderMove: (evt, gestureState) => {
      const maxWidth = slideButtonWidth - thumbSize - (thumbPadding * 2);
      const newValue = Math.max(0, Math.min(maxWidth, gestureState.dx));
      slideProgress.setValue(newValue);
    },
    onPanResponderRelease: (evt, gestureState) => {
      setIsSliding(false);
      const maxWidth = slideButtonWidth - thumbSize - (thumbPadding * 2);
      if (gestureState.dx >= maxWidth * 0.8) {
        // Complete the slide
        Animated.spring(slideProgress, {
          toValue: maxWidth,
          useNativeDriver: false,
        }).start(() => {
          handleSlideAction();
        });
      } else {
        // Reset
        Animated.spring(slideProgress, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  // UI handlers only
  // Add this inside your TripDetailScreen component

  const handleSlideAction = async () => {

  
    if (!trip) return;

    // Only start trip if status is "Assigned"
    if (trip.status !== 'ASSIGNED') {
      showSuccess('Trip cannot be started from current status');
      // Reset slider anyway
      Animated.spring(slideProgress, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
      return;
    }

    try {
      const payload = {
        latitude: 25.2048,
        longitude: 55.2708,
      };

      const res = await tripApi.startTrip(trip.id, payload);

      if (res?.data) {
        showSuccess('Trip started successfully!');
        setTrip((prev: any) => ({
          ...prev,
          status: 'In Progress',
          startTime: res.data.startTime || new Date().toISOString(),
        }));
        navigation.navigate('LocationMark', { tripId: trip.id, stage: trip });
      }
    } catch (error: any) {
      console.log('Start trip API error:', error);
    } finally {
      Animated.spring(slideProgress, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    }


  };



  // const handleCall = (phone: string) => Linking.openURL(`tel:${phone}`);

  const handleNavigate = (type: 'loading' | 'unloading') => {
    if (!trip) return;
    const loc = type === 'loading' ? trip.loadingLocation : trip.unloadingLocation;
    navigationService.navigateToLocation({
      address: trip?.order.loadingCity,
      coordinates: trip?.order.unloadingCity,
      label: type === 'loading' ? 'Pickup' : 'Delivery',
    });
  };

  // const handleCall = (phoneNumber: string) => {
  //   if (!phoneNumber) {
  //     console.log('Error', 'Phone number not available');
  //     return;
  //   }

  //   // Create a tel URL
  //   const url = `tel:${phoneNumber}`;

  //   Linking.canOpenURL(url)
  //     .then((supported) => {
  //       if (!supported) {
  //         console.log('Error', 'Cannot make a call from this device');
  //       } else {
  //         return Linking.openURL(url);
  //       }
  //     })
  //     .catch((err) => console.log('Error making call:', err));
  // };

  const getNextAction = (s: TripStatus) => {
    const map: Record<string, { title: string; status: TripStatus }> = {
      Assigned: { title: 'Start Trip', status: 'In Progress' },
      'In Progress': { title: 'Mark Loaded', status: 'Loaded' },
      Loaded: { title: 'Mark Arrived', status: 'Arrived' },
      Arrived: { title: 'Complete', status: 'Completed' },
    };
    return map[s] || null;
  };

  const formatDate = (d: Date) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(d));


  const next = getNextAction(trip?.status);




  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <Typography variant="bodyMedium" color="textPrimary">
          Loading trip details...
        </Typography>
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={styles.center}>
        <Typography variant="bodyMedium" color="textPrimary">
          No trip data available
        </Typography>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.container} edges={['top']} >
      <Header title="Trip Details" onBackPress={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }>
        {/* Header Card - Simple Design */}
        <Card style={styles.headerCard}>
          <View style={styles.headerCardHeader}>
            <View style={styles.headerCardHeaderLeft}>
              <Typography variant="h4" color="textPrimary" weight="700" style={styles.headerCardTitle}>Order Details</Typography>
              <Typography variant="bodyMedium" color="textSecondary" weight="500" style={styles.headerCardSubtitle}>{trip?.tripNumber}</Typography>
            </View>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Typography variant="caption" color="primary" weight="700" style={styles.statusText}>{trip?.status}</Typography>
            </View>
          </View>

          <View style={styles.orderDetailsList}>
            {trip?.order.orderNumber && (
              <View style={styles.orderDetailRow}>
                <Typography variant="body" color="textSecondary" weight="500" style={styles.orderDetailLabel}>Order ID</Typography>
                <Typography variant="bodyMedium" color="textPrimary" weight="600" style={styles.orderDetailValue}>{trip?.order.orderNumber}</Typography>
              </View>
            )}
            {trip?.vehicle && trip.vehicle.registrationNumber && (
              <View style={styles.orderDetailRow}>
                <Typography variant="body" color="textSecondary" weight="500" style={styles.orderDetailLabel}>Vehicle</Typography>
                <Typography variant="bodyMedium" color="textPrimary" weight="600" style={styles.orderDetailValue}>{trip?.vehicle.registrationNumber}</Typography>
              </View>
            )}
            {trip?.assignedWeight && (
              <View style={styles.orderDetailRow}>
                <Typography variant="body" color="textSecondary" weight="500" style={styles.orderDetailLabel}>Weight</Typography>
                <Typography variant="bodyMedium" color="textPrimary" weight="600" style={styles.orderDetailValue}>{trip?.assignedWeight} KG</Typography>
              </View>
            )}
          </View>

        </Card>

        {/* Route & Timeline */}
        <Card style={styles.section}>
          <Typography
            variant="bodyMedium"
            color="textPrimary"
            weight="600"
            style={styles.sectionTitle}>
            Route & Timeline
          </Typography>

          {/* ---------- ROUTE ---------- */}
          {trip?.distance && (
            <View style={styles.routeInfo}>
              <View style={styles.routeTextContainer}>
                <Image
                  source={require('@/assets/images/location.png')}
                  style={styles.routeIcon}
                  resizeMode="contain"
                />

                <View style={styles.routeTextRow}>
                  <Typography
                    variant="bodyMedium"
                    color="textPrimary"
                    weight="600"
                    style={styles.routeText}>
                    {trip?.order?.loadingCity}
                  </Typography>

                  <Image
                    source={require('@/assets/images/next.png')}
                    style={styles.routeArrow}
                    resizeMode="contain"
                  />

                  <Typography
                    variant="bodyMedium"
                    color="textPrimary"
                    weight="600"
                    style={styles.routeText}>
                    {trip?.order?.unloadingCity}
                  </Typography>
                </View>
              </View>

              <Typography
                variant="bodyMedium"
                color="primary"
                weight="700"
                style={styles.distanceText}>
                {trip.distance} km
              </Typography>
            </View>
          )}

          {/* ---------- TIMELINE ---------- */}
          <View style={styles.timeline}>
            {trip?.createdAt && (
              <View style={styles.timelineItem}>
                <Typography
                  variant="bodyMedium"
                  color="textSecondary"
                  weight="600"
                  style={styles.timelineLabel}>
                  Assigned
                </Typography>
                <Typography
                  variant="bodyMedium"
                  color="textPrimary"
                  weight="500"
                  style={styles.timelineDate}>
                  {formatDate(trip.createdAt)}
                </Typography>
              </View>
            )}

            {trip?.startTime && (
              <View style={styles.timelineItem}>
                <Typography
                  variant="bodyMedium"
                  color="textSecondary"
                  weight="600"
                  style={styles.timelineLabel}>
                  Started
                </Typography>
                <Typography
                  variant="bodyMedium"
                  color="textPrimary"
                  weight="500"
                  style={styles.timelineDate}>
                  {formatDate(trip.startTime)}
                </Typography>
              </View>
            )}

            {trip?.endTime && (
              <View style={styles.timelineItem}>
                <Typography
                  variant="bodyMedium"
                  color="textSecondary"
                  weight="600"
                  style={styles.timelineLabel}>
                  Completed
                </Typography>
                <Typography
                  variant="bodyMedium"
                  color="textPrimary"
                  weight="500"
                  style={styles.timelineDate}>
                  {formatDate(trip.endTime)}
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
            <Typography
              variant="bodyMedium"
              color="textPrimary"
              weight="600"
              style={styles.sectionTitle}>
              Pickup Location
            </Typography>
          </View>

          {/* ADDRESS */}
          <Typography
            variant="bodyMedium"
            color="textPrimary"
            weight="500"
            style={styles.address}>
            {trip?.order?.loadingCity || 'Location not specified'}
          </Typography>

          {/* DRIVER CONTACT */}
          {trip?.driver?.mobileNumber ? (
            <View style={styles.contactRow}>
              <Typography
                variant="bodyMedium"
                color="textSecondary"
                weight="600"
                style={styles.contact}>
                {trips?.order?.loadingContactName ?? 'N/A'}
              </Typography>

              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => handleCall(trips?.order?.loadingContactNumber || 'NA')}
              >
                <Image
                  source={require('@/assets/images/phone-call.png')}
                  style={styles.callIcon}
                  resizeMode="contain"
                />
                <Typography variant="smallMedium" color="primary" style={styles.callText}>
                  Call
                </Typography>
              </TouchableOpacity>
            </View>
          ) : (
            <Typography variant="small" color="textTertiary" style={styles.noContact}>
              No contact information available
            </Typography>
          )}


          <Button
            title="Navigate"
            variant="outline"
            style={styles.navBtn}
            onPress={() =>
              handleNavigate({
                latitude: Number(trip.startLatitude),
                longitude: Number(trip.startLongitude),
              })
            }
          />



        </Card>


        {/* Delivery Location */}
        <Card style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Image
              source={require('@/assets/images/location.png')}
              style={styles.sectionTitleIcon}
              resizeMode="contain"
            />
            <Typography
              variant="bodyMedium"
              color="textPrimary"
              weight="600"
              style={styles.sectionTitle}>
              Delivery Location
            </Typography>
          </View>

          {/* ADDRESS */}
          <Typography
            variant="bodyMedium"
            color="textPrimary"
            weight="500"
            style={styles.address}>
            {trip?.order?.unloadingCity || 'Location not specified'}
          </Typography>

          {/* CONTACT */}
          {trip?.driver?.mobileNumber ? (
            <View style={styles.contactRow}>
              <Typography
                variant="bodyMedium"
                color="textSecondary"
                weight="600"
                style={styles.contact}>
                {trips?.order?.unloadingContactName ?? 'N/A'}
              </Typography>

              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => handleCall(trips?.order?.unloadingContactNumber || 'NA')}
              >
                <Image
                  source={require('@/assets/images/phone-call.png')}
                  style={styles.callIcon}
                  resizeMode="contain"
                />
                <Typography variant="smallMedium" color="primary" style={styles.callText}>
                  Call
                </Typography>
              </TouchableOpacity>
            </View>
          ) : (
            <Typography variant="small" color="textTertiary" style={styles.noContact}>
              No contact information available
            </Typography>
          )}

          {/* NAVIGATE */}
          {Number(trip?.endLatitude) !== 0 && (
            <Button
              title="Navigate"
              variant="outline"
              style={styles.navBtn}
              onPress={() =>
                handleNavigate({
                  latitude: Number(trip.endLatitude),
                  longitude: Number(trip.endLongitude),
                })
              }
            />
          )}


        </Card>


        {/* Weight & Load Information */}
        {(trip?.assignedWeight || trip?.deliveredWeight || trip?.vehicle?.maxLoadCapacity) && (
          <Card style={styles.section}>
            <Typography
              variant="bodyMedium"
              color="textPrimary"
              weight="600"
              style={styles.sectionTitle}>
              Weight & Load Information
            </Typography>

            <View style={styles.weightInfo}>
              {/* DELIVERED WEIGHT */}
              {trip?.deliveredWeight && (
                <View style={styles.weightRow}>
                  <Image
                    source={require('@/assets/images/shipped.png')}
                    style={styles.weightIcon}
                    resizeMode="contain"
                  />

                  <View style={styles.weightDetails}>
                    <Typography
                      variant="bodyMedium"
                      color="textPrimary"
                      weight="700"
                      style={styles.weightValue}>
                      {trip.deliveredWeight} kg
                    </Typography>

                    <Typography
                      variant="bodyMedium"
                      color="textSecondary"
                      weight="600"
                      style={styles.weightLabel}>
                      Delivered Weight
                    </Typography>

                    {trip?.assignedWeight && (
                      <Typography
                        variant="small"
                        color="warning"
                        style={styles.assignedWeight}>
                        Assigned: {trip.assignedWeight} kg
                      </Typography>
                    )}
                  </View>
                </View>
              )}

              {/* VEHICLE INFO */}
              {trip?.vehicle?.maxLoadCapacity && (
                <View style={styles.vehicleInfoRow}>
                  <Typography
                    variant="smallMedium"
                    color="textSecondary"
                    style={styles.vehicleInfoText}>
                    Vehicle Capacity: {trip.vehicle.maxLoadCapacity} kg
                  </Typography>

                  {trip?.vehicle?.registrationNumber && (
                    <Typography
                      variant="smallMedium"
                      color="textSecondary"
                      style={styles.vehicleInfoText}>
                      Vehicle Number: {trip.vehicle.registrationNumber}
                    </Typography>
                  )}
                </View>
              )}
            </View>
          </Card>
        )}

        <View style={styles.slideContainer}>
          <Animated.View
            style={[
              styles.slideButton,
              {
                opacity: slideButtonOpacity, // always active
                backgroundColor: colors.primary, // always primary color
              }
            ]}
            {...slidePanResponder.panHandlers} // always allow sliding
          >
            <Animated.View
              style={[
                styles.slideThumb,
                {
                  left: thumbLeft,
                }
              ]}>
              <Image
                source={require('@/assets/images/next.png')}
                style={styles.slideThumbIcon}
                resizeMode="contain"
              />
            </Animated.View>

            <Typography
              variant="bodyMedium"
              color="white"
              weight="700"
              style={styles.slideButtonText}
            >
              {isSliding ? 'Sliding...' : next?.title || 'Start Trip'}
            </Typography>
          </Animated.View>
        </View>


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
    gap: spacing.sm,
  },
  orderDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
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
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    backgroundColor: colors.successLight,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  gpsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: spacing.sm,
  },
  gpsText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
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
  timeline: {
    gap: spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  navBtn: {
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  actionButtonText: {
    ...typography.smallMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  docs: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  docItem: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  docIcon: {
    width: 16,
    height: 16,
    tintColor: colors.textPrimary,
  },
  docText: {
    ...typography.small,
    color: colors.textPrimary,
  },
  actionIcon: {
    width: 16,
    height: 16,
    tintColor: colors.primary,
  },
  remark: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  remarkLabel: {
    ...typography.smallMedium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  remarkText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  actionSection: {
    marginTop: spacing.lg,
  },
  slideContainer: {
    marginTop: spacing.lg,

  },
  slideButton: {
    width: '100%',
    height: 62,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  slideThumb: {
    position: 'absolute',
    width: 57,
    height: 57,
    borderRadius: 28.5, // Fully circular: width/2 = 57/2 = 28.5
    top: 2.5, // Center vertically: (62 - 57) / 2 = 2.5
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',

  },
  slideThumbIcon: {
    width: 24,
    height: 24,
    tintColor: colors.primary,
  },
  slideButtonText: {
    ...typography.bodyMedium,
    color: colors.white,
    fontWeight: '700',
  },
  modalBody: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  modalText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
  },
  routeInfo: {
    marginBottom: spacing.md,
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
  paymentRight: {
    flex: 1,
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  paymentDetail: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '500',
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
});
