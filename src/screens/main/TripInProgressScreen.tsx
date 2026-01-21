import React, {useEffect, useState, useRef} from 'react';
import {StyleSheet, Dimensions, ActivityIndicator, View, Text, TouchableOpacity, Modal, Linking, PermissionsAndroid, Platform, Animated, PanResponder, ScrollView, Image} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {check, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {TodoStackParamList} from '@/types';
import {colors, spacing, typography, borderRadius, shadows} from '@/theme/colors';
import {Header} from '@/components/Header';
import { tripApi } from '@/apiservice';

const {height} = Dimensions.get('window');

type TripInProgressRouteProp = RouteProp<TodoStackParamList, 'TripInProgress'>;
type TripInProgressNavigationProp = StackNavigationProp<TodoStackParamList, 'TripInProgress'>;

// Sample trip data (same as TripDetailScreen) - in real app, this would come from API


export const TripInProgressScreen: React.FC = () => {
  const route = useRoute<TripInProgressRouteProp>();
  const navigation = useNavigation<TripInProgressNavigationProp>();
  const {tripId} = route.params;

  // Location from GPS (null initially, will be set when GPS location is received)
  const [location, setLocation] = useState<any>(null);
  const [hasGpsLocation, setHasGpsLocation] = useState(false); // Track if we have actual GPS location
  const [loading, setLoading] = useState(true);
  const [routeLoading, setRouteLoading] = useState(false);
  const [isNearDestination, setIsNearDestination] = useState(false);
  const [showArrivedModal, setShowArrivedModal] = useState(false);
  const mapRef = useRef<MapView>(null);

  // Bottom Sheet animation values
  const screenHeight = Dimensions.get('window').height;
  const bottomSheetHeight = screenHeight * 0.5; // 50% of screen
  const bottomSheetMinHeight = 140; // Minimum height when collapsed
  // Start collapsed (down position) by default
  const bottomSheetTranslateY = useRef(new Animated.Value(bottomSheetHeight - bottomSheetMinHeight)).current;
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  
  // Animation values for card sections
  const headerAnim = useRef(new Animated.Value(0)).current;
  const destinationAnim = useRef(new Animated.Value(0)).current;
  const detailsAnim = useRef(new Animated.Value(0)).current;
  
  // Calculate distance to destination
  const [distanceToDestination, setDistanceToDestination] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string>('');

  // Slide button animation values
  const slideButtonWidth = Dimensions.get('window').width - (spacing.md * 2);
  const thumbSize = 45;
  const thumbPadding = 2.5;
  const maxSlideDistance = slideButtonWidth - thumbSize - (thumbPadding * 2);
  const slideProgress = useRef(new Animated.Value(0)).current;
  const [isSliding, setIsSliding] = useState(false);
  const [data, setData] = useState([]);
 useEffect(() => {
  getActiveTrips();
}, []);

const trip = Array.isArray(data) && data.length > 0 ? data[0] : null;



  const getActiveTrips = async () => {
    try {
      const res = await tripApi.getActiveTrip();
      if (res) {
        console.log('Profile data:', res);
        const data = res.data || res;
        setData(data||[])
        console.log(data, 'data==============>');
      } else {
        const errorMsg = res?.message || 'Failed to load profile';
        console.log('Profile data:', res);
      }
    } catch (error: any) {
      console.log('Load profile error:', error);
    } finally {
    }
  };  

const unloadingAddress = trip?.order?.unloadingAddress ?? 'N/A';
const unloadingContactName = trip?.order?.unloadingContactName ?? 'N/A';
const unloadingContactNumber = trip?.order?.unloadingContactNumber ?? 'N/A';

const sampleTrip: any = {

  tripNumber: 'TRP-2024-001',
  // orderNumber: 'ORD-12345',
  // vehicleNumber: 'RJ-14-AB-1234',
  // assignedWeight: '5000',
  // deliveredWeight: null,
  // status: 'In Progress',
  // distance: '497',
  // loadingLocation: {
  //   address: 'Warehouse A, Industrial Area, Jaipur, Rajasthan 302013',
  //   coordinates: {
  //     latitude: 26.9124,
  //     longitude: 75.7873,
  //   },
  //   contactPerson: {
  //     name: 'Rajesh Kumar',
  //     phoneNumber: '+91-9876543210',
  //   },
  // },
  unloadingLocation: {
    address: unloadingAddress ,
    coordinates: {
      latitude: 28.6139,
      longitude: 77.209,
    },
    contactPerson: {
      name: unloadingContactName,
      phoneNumber: unloadingContactNumber,
    },
  },
};
 


  const thumbLeft = slideProgress.interpolate({
    inputRange: [0, maxSlideDistance],
    outputRange: [thumbPadding, maxSlideDistance + thumbPadding],
    extrapolate: 'clamp',
  });

  // Pan responder for slide button with improved smoothness and priority
  const slidePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true, // Capture touches first, before bottom sheet
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Prioritize horizontal movement for slide button
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        // Capture if horizontal movement is dominant
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 5;
      },
      onPanResponderTerminationRequest: () => false, // Don't allow other responders to take over
      onPanResponderGrant: () => {
        setIsSliding(true);
        // Stop any ongoing animation
        slideProgress.stopAnimation();
      },
      onPanResponderMove: (evt, gestureState) => {
        const maxWidth = slideButtonWidth - thumbSize - (thumbPadding * 2);
        // Only allow horizontal movement, ignore vertical
        const newValue = Math.max(0, Math.min(maxWidth, gestureState.dx));
        slideProgress.setValue(newValue);
      },
      onPanResponderRelease: (evt, gestureState) => {
        setIsSliding(false);
        const maxWidth = slideButtonWidth - thumbSize - (thumbPadding * 2);
        const currentValue = gestureState.dx;
        const velocity = gestureState.vx;
        
        // Lower threshold for completion (70% instead of 80%)
        // Also check velocity for quick swipes
        if (currentValue >= maxWidth * 0.7 || (currentValue >= maxWidth * 0.5 && velocity > 0.5)) {
          // Complete the slide with smooth animation
          Animated.spring(slideProgress, {
            toValue: maxWidth,
            useNativeDriver: false,
            tension: 40,
            friction: 7,
            velocity: velocity || 0,
          }).start(() => {
            handleMarkAsArrived();
            // Reset slide button after a short delay
            setTimeout(() => {
              Animated.spring(slideProgress, {
                toValue: 0,
                useNativeDriver: false,
                tension: 50,
                friction: 8,
              }).start();
            }, 500);
          });
        } else {
          // Reset with smooth spring animation
          Animated.spring(slideProgress, {
            toValue: 0,
            useNativeDriver: false,
            tension: 50,
            friction: 8,
            velocity: velocity || 0,
          }).start();
        }
      },
    })
  ).current;

  const GOOGLE_API_KEY = 'AIzaSyDKbLlbS2U7upE8jxgpIkA-RGrhqFRR8eI';

  // Destination from trip data (delivery location)
  const destination = sampleTrip.unloadingLocation.coordinates || {
    latitude: 28.6139,
    longitude: 77.209,
  };

  // Type for Geolocation coordinates
  type Coords = {
    coords: {
      accuracy?: number | null;
      altitude?: number | null;
      altitudeAccuracy?: number | null;
      heading?: number | null;
      latitude?: number | null;
      longitude?: number | null;
      speed?: number | null;
    };
    mocked?: boolean;
    provider?: string;
    timestamp?: number | null;
  };

  // Set Noida location as current location (hardcoded for testing)
  const fetchLocationFromGoogle = async () => {
    // Noida, Uttar Pradesh, India coordinates
    const noidaLocation = {
      latitude: 28.5355,
      longitude: 77.3910,
    };
    
    console.log('Current Location (Noida):');
    console.log('Latitude:', noidaLocation.latitude);
    console.log('Longitude:', noidaLocation.longitude);
    console.log('Location: Noida, Uttar Pradesh, India');
    
    setLocation(noidaLocation);
    setHasGpsLocation(true);
    setLoading(false);
    
    // Center map on Noida location
    setTimeout(() => {
      recenterMap(noidaLocation);
    }, 300);
  };


  // Get current location on mount using Google Geolocation API
  useEffect(() => {
    fetchLocationFromGoogle();

    // Cleanup
    return () => {
      // Cleanup if needed
    };
  }, []);

  // Calculate distance to destination
  useEffect(() => {
    if (location && destination) {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        destination.latitude,
        destination.longitude
      );
      setDistanceToDestination(distance);
      
      // Estimate time (assuming average speed of 40 km/h)
      const timeInHours = distance / 1000 / 40; // Convert meters to km, divide by speed
      const timeInMinutes = Math.round(timeInHours * 60);
      if (timeInMinutes < 60) {
        setEstimatedTime(`${timeInMinutes} min`);
      } else {
        const hours = Math.floor(timeInMinutes / 60);
        const minutes = timeInMinutes % 60;
        setEstimatedTime(`${hours}h ${minutes}m`);
      }
    }
  }, [location, destination]);

  // Animate sections when location is received (bottom sheet stays collapsed by default)
  useEffect(() => {
    if (hasGpsLocation && !loading) {
      // Bottom sheet remains collapsed by default
      // User can manually drag to expand
      // Animate sections sequentially
      Animated.sequence([
        Animated.timing(headerAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(destinationAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(detailsAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [hasGpsLocation, loading]);

  // Bottom Sheet Pan Responder - only responds to vertical gestures
  const bottomSheetPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to primarily vertical movements (not horizontal)
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 5;
      },
      onPanResponderTerminationRequest: () => true, // Allow slide button to take over if needed
      onPanResponderGrant: () => {
        bottomSheetTranslateY.setOffset((bottomSheetTranslateY as any)._value);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only move if vertical movement is dominant
        if (Math.abs(gestureState.dy) > Math.abs(gestureState.dx)) {
          const currentValue = (bottomSheetTranslateY as any)._value;
          const newValue = currentValue + gestureState.dy;
          // Clamp between 0 and bottomSheetHeight
          const clampedValue = Math.max(0, Math.min(bottomSheetHeight, newValue));
          bottomSheetTranslateY.setValue(clampedValue - currentValue);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        bottomSheetTranslateY.flattenOffset();
        const currentValue = (bottomSheetTranslateY as any)._value;
        const velocity = gestureState.vy;
        
        // Only process if it was a vertical gesture
        if (Math.abs(gestureState.dy) > Math.abs(gestureState.dx)) {
          // Determine if should expand or collapse
          if (velocity > 0.5 || (currentValue > bottomSheetHeight * 0.5 && velocity > -0.5)) {
            // Collapse
            Animated.spring(bottomSheetTranslateY, {
              toValue: bottomSheetHeight - bottomSheetMinHeight,
              useNativeDriver: true,
              tension: 50,
              friction: 8,
            }).start(() => {
              setIsBottomSheetExpanded(false);
            });
          } else {
            // Expand
            Animated.spring(bottomSheetTranslateY, {
              toValue: 0,
              useNativeDriver: true,
              tension: 50,
              friction: 8,
            }).start(() => {
              setIsBottomSheetExpanded(true);
            });
          }
        }
      },
    })
  ).current;

  // Calculate distance between two coordinates (in meters)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Calculate bearing from origin to destination (for map rotation)
  const calculateBearing = (origin: any, dest: any) => {
    const lat1 = (origin.latitude * Math.PI) / 180;
    const lat2 = (dest.latitude * Math.PI) / 180;
    const dLon = ((dest.longitude - origin.longitude) * Math.PI) / 180;

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    const bearing = Math.atan2(y, x);
    return ((bearing * 180) / Math.PI + 360) % 360;
  };

  // Function to center map on current location (truck location) with navigation-style rotation
  const recenterMap = (customLocation?: any) => {
    const locToUse = customLocation || location;
    if (locToUse && mapRef.current) {
      // Calculate bearing from current location to destination
      const bearing = calculateBearing(locToUse, destination);
      
      // Use setTimeout to ensure map is ready
      setTimeout(() => {
        if (mapRef.current) {
          // Center map exactly on truck location (navigation mode)
          mapRef.current.animateCamera(
            {
              center: {
                latitude: locToUse.latitude,
                longitude: locToUse.longitude,
              },
              heading: bearing, // Rotate map to show direction of travel
              pitch: 45, // Slight 3D tilt like Google Maps
              altitude: 5000, // Zoom level for navigation view
              zoom: 17, // Closer zoom for navigation mode
            },
            {duration: 1000}
          );
        }
      }, 300);
    }
  };


  // Initial map setup with navigation-style direction (only when GPS location is received)
  const hasSetInitialCamera = useRef(false);
  useEffect(() => {
    if (location && hasGpsLocation && mapRef.current && !hasSetInitialCamera.current) {
      // Wait for map to be fully rendered before animating camera
      const timer = setTimeout(() => {
        if (mapRef.current && location) {
          // Center on current GPS location to show direction
          recenterMap(location);
          hasSetInitialCamera.current = true;
        }
      }, 500);
      return () => {
        clearTimeout(timer);
      };
    }
    return undefined;
  }, [location, hasGpsLocation]);

  // Function to open Google Maps app with destination coordinates
  const openGoogleMaps = () => {
    const {latitude, longitude} = destination;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url).catch((err) => console.log('Failed to open Google Maps:', err));
  };

  // Function to handle Mark as Arrived
 const handleMarkAsArrived = async () => {
  if (!tripId) return;

  try {
    const payload = {
      arrivedLatitude: 22.3569,
      arrivedLongitude: 72.3569,
    };

    const res = await tripApi.markArrived(tripId, payload);

    if (res?.success) {
      console.log('Trip marked as arrived', res.data);
      navigation.navigate('MarkComplete', {
        tripId: tripId,
      });
    }
  } catch (error) {
    console.log('Mark arrived error:', error);
  }
};

  

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Trip In Progress" onBackPress={() => navigation.goBack()} />
      
      {/* Show loading until GPS location is received */}
      {loading || !hasGpsLocation ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Fetching current location...</Text>
        </View>
      ) : null}
      
      {/* Map Container - Hidden until GPS location is received, but rendered to get GPS */}
      <View style={[
        styles.mapContainer,
        (!hasGpsLocation || loading) && styles.mapContainerHidden
      ]}>
        <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        mapType="standard"
        initialRegion={{
          latitude: 28.6139, // Default to destination (will update when GPS location comes)
          longitude: 77.209,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={false} // Hide blue dot
        showsMyLocationButton={false} // Hide current location button
        zoomEnabled={true}
        scrollEnabled={true}
        rotateEnabled={true}
        // pitchEnabled={true}
        loadingEnabled={false}>
          
        {/* Directions Route - Only show when we have actual GPS current location */}
        {location && hasGpsLocation && (
          <MapViewDirections
            origin={location} // Start from current GPS location
            destination={destination}
            apikey={GOOGLE_API_KEY}
            strokeWidth={5}
            optimizeWaypoints={true}
            strokeColor="#2563EB"
            mode="DRIVING"
            resetOnChange={true}
            tappable={false}
            precision="high"
            onStart={(params) => {
              console.log('Route calculation started from GPS location');
              setRouteLoading(true);
            }}
            onReady={(result) => {
              console.log('Route ready:', {
                distance: result.distance,
                duration: result.duration,
                coordinates: result.coordinates?.length || 0,
              });
              setRouteLoading(false);
            }}
            onError={(errorMessage) => {
              console.log('Route error:', errorMessage);
              setRouteLoading(false);
            }}
          />
        )}

        {/* Truck Marker - Only show when we have actual GPS current location */}
        {location && hasGpsLocation && (
          <Marker
            coordinate={location}
            title="Truck"
            anchor={{x: 0.5, y: 0.5}}
            flat={true}>
            <View style={styles.truckContainer}>
              <Text style={styles.truckEmoji}>🚛</Text>
            </View>
          </Marker>
        )}
        </MapView>
        
        {/* Center Button - Center map on truck location (Top Right) */}
        {location && hasGpsLocation && (
          <TouchableOpacity
            style={styles.centerButton}
            onPress={() => recenterMap(location)}
            activeOpacity={0.7}>
            <Image 
              source={require('@/assets/images/location.png')} 
              style={styles.centerButtonIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Sheet */}
      {hasGpsLocation && !loading && (
        <Animated.View 
          style={[
            styles.bottomSheet,
            {
              transform: [{translateY: bottomSheetTranslateY}],
            }
          ]}
          {...bottomSheetPanResponder.panHandlers}>
          {/* Bottom Sheet Handle */}
          <View style={styles.bottomSheetHandle}>
            <View style={styles.handleBar} />
          </View>
          <View style={styles.cardContent}>
            {/* Arrival Time Section */}
            <View style={styles.arrivalTimeCard}>
              <View style={styles.arrivalTimeContent}>
                <View style={styles.arrivalTimeLeft}>
                  <View style={styles.arrivalTimeIconContainer}>
                    <Text style={styles.arrivalTimeIcon}>⏱️</Text>
                  </View>
                  <View style={styles.arrivalTimeTextContainer}>
                    <Text style={styles.arrivalTimeLabel}>Estimated Arrival</Text>
                    {estimatedTime && (
                      <Text style={styles.arrivalTimeValue}>
                        {estimatedTime.replace(' min', ' MINS')}
                      </Text>
                    )}
                  </View>
                </View>
                {distanceToDestination && (
                  <View style={styles.distanceContainer}>
                    <Text style={styles.distanceValue}>
                      {(distanceToDestination / 1000).toFixed(1)} km
                    </Text>
                    <Text style={styles.distanceLabel}>Distance</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Delivery Location */}
            <View style={styles.deliverySection}>
              <View style={styles.deliveryHeader}>
                <View style={styles.deliveryHeaderLeft}>
                  <View style={styles.deliveryIconWrapper}>
                    <Image 
                      source={require('@/assets/images/location.png')} 
                      style={styles.deliveryIcon}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.deliveryHeaderText}>
                    <Text style={styles.deliveryTitle}>Delivery Location</Text>
                    <Text style={styles.deliveryAddress} numberOfLines={2}>
                      {sampleTrip.unloadingLocation.address}
                    </Text>
                  </View>
                </View>
              </View>
              
              {sampleTrip.unloadingLocation.contactPerson && (
                <>
                  <View style={styles.deliveryDivider} />
                  <View style={styles.deliveryContactSection}>
                    <View style={styles.deliveryContactRow}>
                      <View style={styles.deliveryContactInfo}>
                        <View style={styles.deliveryContactIconWrapper}>
                          <Image 
                            source={require('@/assets/images/phone-call.png')} 
                            style={styles.deliveryContactIcon}
                            resizeMode="contain"
                          />
                        </View>
                        <View style={styles.deliveryContactDetails}>
                          <Text style={styles.deliveryContactLabel}>Contact Person</Text>
                          <Text style={styles.deliveryContactName} numberOfLines={1}>
                            {sampleTrip.unloadingLocation.contactPerson.name}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.deliveryActionButtonsRow}>
                        <TouchableOpacity 
                          style={styles.deliveryCallButton}
                          onPress={() => {
                            if (sampleTrip.unloadingLocation.contactPerson?.phoneNumber) {
                              Linking.openURL(`tel:${sampleTrip.unloadingLocation.contactPerson.phoneNumber}`);
                            }
                          }}
                          activeOpacity={0.7}>
                          <Image 
                            source={require('@/assets/images/phone-call.png')} 
                            style={styles.deliveryCallButtonIcon}
                            resizeMode="contain"
                          />
                       
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.deliveryNavigateButton}
                          onPress={openGoogleMaps}
                          activeOpacity={0.7}>
                          <Image 
                            source={require('@/assets/images/location.png')} 
                            style={styles.deliveryNavigateButtonIcon}
                            resizeMode="contain"
                          />
                         
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </>
              )}
            </View>

            {/* Slide to Mark as Arrived Button */}
            <View style={styles.slideContainer}>
              <Animated.View
                style={[
                  styles.slideButton,
                  {
                    opacity: slideProgress.interpolate({
                      inputRange: [0, maxSlideDistance * 0.6],
                      outputRange: [1, 0.4],
                      extrapolate: 'clamp',
                    }),
                  }
                ]}
                {...slidePanResponder.panHandlers}
                pointerEvents="box-none">
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
                <Animated.Text 
                  style={[
                    styles.slideButtonText,
                    {
                      opacity: slideProgress.interpolate({
                        inputRange: [0, maxSlideDistance * 0.5, maxSlideDistance],
                        outputRange: [1, 0.5, 0],
                        extrapolate: 'clamp',
                      }),
                    }
                  ]}>
                  {isSliding ? 'Sliding...' : 'Mark as Arrived'}
                </Animated.Text>
              </Animated.View>
            </View>
          </View>
        </Animated.View>
      )}

     
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.white,
  },
  mapContainerHidden: {
    position: 'absolute',
    opacity: 0,
    zIndex: -1,
    height: '65%',
  },
  map: {
    flex: 1,
    width: '100%',
  },
  truckContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.primary,
    ...shadows.md,
  },
  truckEmoji: {
    fontSize: 28,
  },
  centerButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 5,
    zIndex: 1000,
  },
  centerButtonIcon: {
    width: 24,
    height: 24,
    tintColor: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F3F4F6',
  },
  modalButtonConfirm: {
    backgroundColor: '#2563EB',
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  modalButtonTextConfirm: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bottomSheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 998,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl + 8,
    borderTopRightRadius: borderRadius.xl + 8,
    ...shadows.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    elevation: 10,
  },
  bottomSheetHandle: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  cardContent: {
    padding: spacing.lg,
    paddingBottom: spacing.lg,
  },
  arrivalTimeCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  arrivalTimeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  arrivalTimeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  arrivalTimeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  arrivalTimeIcon: {
    fontSize: 28,
  },
  arrivalTimeTextContainer: {
    flex: 1,
  },
  arrivalTimeLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    
  },
  arrivalTimeValue: {
    ...typography.bodySemibold,
    fontSize: 24,
    fontWeight: '800',
    color: '#3B82F6',
    letterSpacing: 0.5,
    lineHeight: 30,
  },
  distanceContainer: {
    alignItems: 'flex-end',
    paddingLeft: spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: colors.borderLight,
  },
  distanceValue: {
    ...typography.bodySemibold,
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.3,
    
    marginBottom: 2,
  },
  distanceLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.3,
    
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderTitle: {
    ...typography.h4,
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
    letterSpacing: -0.3,
    
  },
  orderNumber: {
    ...typography.bodyMedium,
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.2,
    
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
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
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  orderInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  orderDetailItem: {
    flex: 1,
    minWidth: '30%',
  },
  orderDetailLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    
  },
  orderDetailValue: {
    ...typography.bodyMedium,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.2,
    
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
    marginHorizontal: -spacing.lg,
  },
  driverStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  driverInfoSection: {
    alignItems: 'center',
    minWidth: 80,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  driverAvatarText: {
    fontSize: 24,
  },
  driverName: {
    ...typography.bodyMedium,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.2,
    
  },
  deliveryStatusSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  etaText: {
    ...typography.bodySemibold,
    fontSize: 20,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 4,
    letterSpacing: 0.8,
    
  },
  estimatedLabel: {
    ...typography.small,
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.3,
    
  },
  deliverySection: {
    marginBottom: spacing.lg,
  },
  deliveryHeader: {
marginTop: spacing.md,
  },
  deliveryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  deliveryIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  deliveryIcon: {
    width: 24,
    height: 24,
    tintColor: colors.primary,
  },
  deliveryHeaderText: {
    flex: 1,
  },
  deliveryTitle: {
    ...typography.bodyMedium,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.2,
    
    marginBottom: spacing.xs,
  },
  deliveryAddress: {
    ...typography.bodyMedium,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    
    letterSpacing: 0.1,
  },
  deliveryDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
    marginHorizontal: -spacing.lg,
  },
  deliveryContactSection: {
 
  },
  deliveryContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  deliveryContactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deliveryContactIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  deliveryContactIcon: {
    width: 20,
    height: 20,
    tintColor: colors.primary,
  },
  deliveryContactDetails: {
    flex: 1,
  },
  deliveryContactLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    
    marginBottom: spacing.xs / 2,
  },
  deliveryContactName: {
    ...typography.bodyMedium,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.2,
    
  },
  deliveryActionButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexShrink: 0,
  },
  deliveryCallButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,

    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minWidth: 50,
    ...shadows.sm,
  },
  deliveryCallButtonIcon: {
    width: 18,
    height: 18,
    tintColor: colors.white,
  },
  deliveryCallButtonText: {
    ...typography.bodyMedium,
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.3,
  },
  deliveryNavigateButton: {
    backgroundColor: '#10B981',
    paddingVertical: spacing.sm,
 
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    minWidth: 50,
    ...shadows.sm,
  },
  deliveryNavigateButtonIcon: {
    width: 18,
    height: 18,
    tintColor: colors.white,
  },
  deliveryNavigateButtonText: {
    ...typography.bodyMedium,
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.3,
  },
  slideContainer: {
    marginTop: spacing.lg,
  },
  tripNumberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tripNumberIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  tripNumberContent: {
    flex: 1,
  },
  tripLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tripValue: {
    ...typography.bodyMedium,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    
  },
  tripDetailsRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  detailItem: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  detailLabel: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    ...typography.bodyMedium,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  destinationInfo: {
    marginBottom: spacing.lg,
    flexShrink: 1,
  },
  destinationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  destinationIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  destinationAddress: {
    ...typography.bodyMedium,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    
    marginLeft: 24,
    marginTop: spacing.xs,
  },
  actionButtons: {
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  googleMapsButton: {
    backgroundColor: '#4285F4', // Google Maps blue color
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
    marginBottom: spacing.xs,
  },
  googleMapsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  googleMapsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  googleMapsIcon: {
    fontSize: 24,
  },
  googleMapsTextContainer: {
    flex: 1,
  },
  googleMapsButtonTitle: {
    ...typography.bodyMedium,
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 2,
  },
  googleMapsButtonSubtitle: {
    ...typography.small,
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  googleMapsArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleMapsArrowIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  slideButton: {
    width: '100%',
    height: 56,
bottom:10,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  slideThumb: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 70,
    top: 2.5,
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
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
    
  },
});
