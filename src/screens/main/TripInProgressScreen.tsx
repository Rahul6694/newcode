import { tripApi } from '@/apiservice';
import { Typography } from '@/components';
import { Header } from '@/components/Header';
import useLocation from '@/hooks/useLocation';
import { useStrings } from '@/localization/useStrings';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme/colors';
import { TodoStackParamList } from '@/types';
import { fetchCurrentLocation } from '@/utils/dataFactory';
import { RouteProp, useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';


const { height: FULL_HEIGHT, width: FULL_WIDTH } = Dimensions.get('window');

type TripInProgressRouteProp = RouteProp<TodoStackParamList, 'TripInProgress'>;
type TripInProgressNavigationProp = StackNavigationProp<TodoStackParamList, 'TripInProgress'>;
type LatLng = { latitude: number; longitude: number };
type RouteInput = LatLng & { latitudeDes: number; longitudeDes: number };

// Sample trip data (same as TripDetailScreen) - in real app, this would come from API


export const TripInProgressScreen: React.FC = () => {
  const route = useRoute<TripInProgressRouteProp>();
  const navigation = useNavigation<TripInProgressNavigationProp>();
  const strings = useStrings();
  const { tripId } = route.params;
  const mapRef = useRef<MapView | null>(null);

  const [loading, setLoading] = useState(true);


  // Actual route data from Google Maps
  const [actualRouteDuration, setActualRouteDuration] = useState<number | null>(null);
  const [actualRouteDistanceKm, setActualRouteDistanceKm] = useState<number | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [routeMeta, setRouteMeta] = useState<{ source: 'none' | 'steps' | 'overview' | 'fallback'; status?: string; points: number }>({
    source: 'none',
    status: undefined,
    points: 0,
  });



  const isFocused = useIsFocused();
  const [currentLoction, setCurrentLoction] = useState<{ latitude: number; longitude: number } | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const { latitude, longitude, heading } = useLocation(isFocused);
  const latestCoordsRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const hasSentInitialLocationRef = useRef(false);
  const hasFetchedTripRef = useRef(false);

  const [isDragging, setIsDragging] = useState(false);



  // Slide button animation values
  const slideButtonWidth = Dimensions.get('window').width - (spacing.md * 2);
  const thumbSize = 45;
  const thumbPadding = 2.5;
  const maxSlideDistance = slideButtonWidth - thumbSize - (thumbPadding * 2);
  const slideProgress = useRef(new Animated.Value(0)).current;
  const [isSliding, setIsSliding] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const pushLocationToApi = async (coords: { latitude: number; longitude: number }) => {
    if (!tripId) return;
    try {
      await tripApi.updateLocation(tripId, {
        latitude: Number(coords.latitude),
        longitude: Number(coords.longitude),
      });
    } catch (e) {
      console.log('updateLocation API error:', e);
    }
  };

  const Fetchlocation = async () => {
    try {
      setLoading(true);
      const location = await fetchCurrentLocation();
      const lat = Number((location as any)?.latitude);
      const lng = Number((location as any)?.longitude);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        console.log('Invalid current location:', location);
        return;
      }

      const normalized = { latitude: lat, longitude: lng };
      console.log(normalized, 'location==========>');
      setCurrentLoction(normalized);
      latestCoordsRef.current = normalized;

      mapRef.current?.animateCamera(
        {
          center: normalized,
          pitch: 0,
          zoom: 18,
        },
        { duration: 500 }
      );

      if (
        normalized.latitude !== 0 &&
        normalized.longitude !== 0
      ) {
        await getActiveTrips(normalized);
      }
    } finally {
      setLoading(false);
    }
  }

  const GOOGLE_API_KEY = 'AIzaSyAqBEGD7SlCdvqKeL8rom-hyz46dCULdNs';

  useEffect(() => {
    if (isFocused) Fetchlocation();
  }, [isFocused]);

  useEffect(() => {
    if (!isFocused) return;

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude === 0 ||
      longitude === 0
    ) {
      console.log('⚠️ Waiting for valid GPS fix...');
      return;
    }

    const coords = { latitude, longitude };
    latestCoordsRef.current = coords;
    setCurrentLoction(coords);

    if (!hasFetchedTripRef.current) {
      hasFetchedTripRef.current = true;
      getActiveTrips(coords);
    }
  }, [isFocused, latitude, longitude]);


  useEffect(() => {
    if (!isFocused) return;
    const coords = latestCoordsRef.current;
    if (!coords) return;
    if (hasSentInitialLocationRef.current) return;
    hasSentInitialLocationRef.current = true;
    pushLocationToApi(coords);
  }, [isFocused, currentLoction?.latitude, currentLoction?.longitude]);

  useEffect(() => {
    // Hit location API every 5 minutes while screen focused
    if (!isFocused || !tripId) return;
    const interval = setInterval(() => {
      const coords = latestCoordsRef.current;
      if (!coords) return;
      pushLocationToApi(coords);
    }, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [isFocused, tripId]);

  const trip = Array.isArray(data) && data.length > 0 ? data[0] : null;


  const getLatLngFromAddress = async (address: string) => {

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    const result = await response.json();

    if (result.status !== 'OK') {
      throw new Error('Geocoding failed');
    }

    return {
      latitude: result.results[0].geometry.location.lat,
      longitude: result.results[0].geometry.location.lng,
    };
  };




  const getActiveTrips = async (location: LatLng) => {
    try {
      const res: any = await tripApi.getActiveTrip();
      if (res) {
        console.log('Profile data:', res);
        const payload = res.data || res;
        const trips = Array.isArray(payload) ? payload : payload ? [payload] : [];
        setData(trips as any);
        const firstTrip = trips?.[0];
        const unloadingAddressLocal = firstTrip?.order?.unloadingAddress ?? 'N/A';
        console.log(trips, 'data==============>', location);
        const destinationLatLng = await getLatLngFromAddress(unloadingAddressLocal);
        setDestinationLocation(destinationLatLng);

        const destination = {
          latitude: location.latitude,          // current location
          longitude: location.longitude,
          latitudeDes: destinationLatLng.latitude,
          longitudeDes: destinationLatLng.longitude,
        };

        console.log('Route destination:', destination);
        fetchRoute(destination);
      } else {
        const errorMsg = res?.message || 'Failed to load profile';
        console.log('Profile data:', res);
      }
    } catch (error: any) {
      console.log('Load profile error:', error);
    } finally {
    }
  };

  const calculateBearing = (origin: LatLng, dest: LatLng) => {
    const lat1 = (origin.latitude * Math.PI) / 180;
    const lat2 = (dest.latitude * Math.PI) / 180;
    const dLon = ((dest.longitude - origin.longitude) * Math.PI) / 180;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const brng = Math.atan2(y, x);
    return ((brng * 180) / Math.PI + 360) % 360;
  };

  function decodePolyline(encoded: string): Array<{ latitude: number; longitude: number }> {
    const points: Array<{ latitude: number; longitude: number }> = [];
    let index = 0, lat = 0, lng = 0;

    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const deltaLat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += deltaLat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const deltaLng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += deltaLng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return points;
  }



  const fetchRoute = async (locationData: RouteInput) => {


    const origin = {
      latitude: +locationData?.latitude,
      longitude: +locationData?.longitude,
    };
    if (
      origin.latitude === 0 ||
      origin.longitude === 0
    ) {
      console.log('❌ Origin is 0,0 — skipping route fetch');
      return;
    }

    const destination = {
      latitude: +locationData?.latitudeDes,
      longitude: +locationData?.longitudeDes,
    };



    if (
      Number.isFinite(origin.latitude) &&
      Number.isFinite(origin.longitude) &&
      Number.isFinite(destination.latitude) &&
      Number.isFinite(destination.longitude)
    ) {
      let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_API_KEY}&mode=driving`;

      console.log(url, "url=========>")

      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.status !== 'OK') {
          console.log('❌ Directions API failed:', data.status, data.error_message);
          setRouteMeta({
            source: 'none',
            status: data.status,
            points: 0,
          });
          return;
        }

        if (data.routes?.length > 0) {
          const decodedPoints = decodePolyline(data.routes[0].overview_polyline.points);
          console.log(data.routes[0].legs[0], "data.routes[0].legs[0]==============>");

          if (decodedPoints.length >= 2) {
            setRouteCoordinates(decodedPoints);
            setRouteMeta({ source: 'overview', status: data?.status, points: decodedPoints.length });

            const leg = data.routes[0].legs[0];
            const duration = leg?.duration;
            const distance = leg?.distance;

            // Store route ETA + distance
            if (typeof duration?.value === 'number') {
              setActualRouteDuration(duration.value / 60); // minutes
            }
            if (typeof distance?.value === 'number') {
              setActualRouteDistanceKm(distance.value / 1000); // km
            }

            // Convert distance to meters
            let distanceInMeters = 0;
            if (distance?.text?.includes("km")) {
              distanceInMeters = parseFloat(distance.text) * 1000;
            } else if (distance?.text?.includes("m")) {
              distanceInMeters = parseFloat(distance.text);
            }

            // if (distanceInMeters <= 100) {
            //   !isOtp ? setIsArrivedDestination(true) : setIsNear(true);
            // } else {
            //   setIsNear(false);
            // }

            // Fit route into map view
            mapRef.current?.fitToCoordinates(decodedPoints, {
              edgePadding: {
                right: FULL_WIDTH / 10,
                bottom: FULL_HEIGHT / 1.5,
                left: FULL_WIDTH / 10,
                top: FULL_HEIGHT / 9,
              },
              animated: true,
            });
          } else {
            console.warn("⚠️ Decoded route has fewer than 2 points.");
          }
        }
      } catch (error) {
        console.error("🚨 Failed to fetch or process route data:", error);
      }
    } else {
      console.warn("❌ Invalid origin or destination, route not fetched");
    }
  }

  const recenterMap = () => {
    if (!currentLoction?.latitude || !currentLoction?.longitude) return;
    mapRef.current?.animateCamera(
      {
        center: currentLoction,
        pitch: 0,
        zoom: 18,
      },
      { duration: 600 }
    );
  };

  const handleNavigate = (
    destination: string | { latitude: number; longitude: number } | null | undefined,
    _label: string
  ) => {
    if (!destination) return;

    // Prefer coordinates if available
    if (typeof destination !== 'string') {
      const coords = `${destination.latitude},${destination.longitude}`;
      const url = Platform.select({
        ios: `http://maps.apple.com/?daddr=${coords}`,
        android: `https://www.google.com/maps/dir/?api=1&destination=${coords}&travelmode=driving`,
      });
      if (!url) return;
      Linking.openURL(url).catch(err => console.log('Failed to open maps:', err));
      return;
    }

    if (destination === 'N/A') return;
    const cleanAddress = destination.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
    const url = Platform.select({
      ios: `http://maps.apple.com/?q=${encodeURIComponent(cleanAddress)}`,
      android: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanAddress)}`,
    });
    if (!url) return;
    Linking.openURL(url).catch(err => console.log('Failed to open maps:', err));
  };


  const unloadingAddress = trip?.order?.unloadingAddress ?? 'N/A';
  const unloadingContactName = trip?.order?.unloadingContactName ?? 'N/A';
  const unloadingContactNumber = trip?.order?.unloadingContactNumber ?? 'N/A';


  const formatDuration = (minutes: number | null) => {
    if (!minutes) return null;

    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
  };


  const sampleTrip: any = {

    tripNumber: 'TRP-2024-001',
    unloadingLocation: {
      address: unloadingAddress,
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
  // Function to handle Mark as Arrived
  const handleMarkAsArrived = async () => {
    const effectiveTripId = tripId ?? (trip as any)?.id ?? (Array.isArray(data) && data[0] ? (data[0] as any).id : undefined);
    console.log('[Arrived] handleMarkAsArrived called', { tripId, effectiveTripId, currentLoction });
    if (!effectiveTripId) return;
    if (!currentLoction?.latitude || !currentLoction?.longitude) return;

    try {
      const payload = {
        arrivedLatitude: Number(currentLoction.latitude),
        arrivedLongitude: Number(currentLoction.longitude),
      };

      const res = await tripApi.markArrived(effectiveTripId, payload);

      if (res?.success) {
        console.log('Trip marked as arrived', res.data);
        navigation.navigate('MarkComplete', {
          tripId: effectiveTripId,
        });
      }
    } catch (error) {
      console.log('Mark arrived error:', error);
    }
  };



  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header title={strings.tripInProgress.title} onBackPress={() => navigation.goBack()} />

      {/* Show loading while requesting GPS fix */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>{strings.tripInProgress.fetchingLocation}</Text>
        </View>
      ) : null}

      <View style={[
        styles.mapContainer,
        loading && styles.mapContainerHidden
      ]}>

        {
          currentLoction?.latitude && currentLoction?.longitude && (
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              mapType="standard"
              rotateEnabled={false}
              moveOnMarkerPress={true}
              showsCompass={false}
              ref={mapRef}
              initialRegion={{
                latitude: +currentLoction?.latitude,
                longitude: +currentLoction?.longitude,
                latitudeDelta: 0.0052,
                longitudeDelta: 0.00121,
              }}
              zoomEnabled={true}>

              {/* {routeCoordinates.length > 1 && ( */}
              <Polyline
                coordinates={routeCoordinates}
                strokeWidth={5}
                strokeColor="#2563EB"
              />
              {/* )} */}

              {currentLoction?.latitude && currentLoction?.longitude && (
                <Marker
                  coordinate={currentLoction}
                  title={strings.tripInProgress.truck}
                  anchor={{ x: 0.5, y: 0.5 }}
                  flat={true}>
                  <View
                    style={[
                      styles.truckContainer,
                      {
                        transform: [
                          {
                            rotate: `${Number.isFinite(Number(heading))
                              ? Number(heading)
                              : destinationLocation
                                ? calculateBearing(currentLoction, destinationLocation)
                                : 0
                              }deg`,
                          },
                        ],
                      },
                    ]}>
                    <Text style={styles.truckEmoji}>🚛</Text>
                  </View>
                </Marker>
              )}

              {destinationLocation?.latitude && destinationLocation?.longitude && (
                <Marker
                  coordinate={destinationLocation}
                  title={strings.tripInProgress.destination}
                  description={unloadingAddress}
                />
              )}

            </MapView>
          )
        }



        <View style={{
          position: 'absolute',
          left: 12,
          bottom: 12,
          backgroundColor: 'rgba(0,0,0,0.65)',
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 10,
        }}>
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
           {strings.tripInProgress.route}: {routeMeta.points || routeCoordinates.length} pts ({routeMeta.source})
          </Text>
          <Text style={{ color: '#fff', fontSize: 11, marginTop: 2, opacity: 0.9 }}>
            {strings.tripInProgress.status}: {routeMeta.status ?? 'n/a'}
          </Text>
        </View>

        {/* Center Button - Center map on current location (Top Right) */}
        {currentLoction?.latitude && currentLoction?.longitude && (
          <TouchableOpacity
            style={styles.centerButton}
            onPress={recenterMap}
            activeOpacity={0.7}>
            <Image
              source={require('@/assets/images/location.png')}
              style={styles.centerButtonIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 80,
            right: 20,
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
            ...shadows.lg,
            borderWidth: 1,
            borderColor: colors.borderLight,
            elevation: 5,
            zIndex: 1000,
          }}
          onPress={() => handleNavigate(destinationLocation ?? unloadingAddress, 'Delivery Location')}
          activeOpacity={0.7}>
          <Image
            source={require('@/assets/images/m.png')}
            style={{
              width: 20,
              height: 20,
            }}
            resizeMode="contain"
          />

        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}

      <View style={styles.bottomSheet}>
        <View style={styles.bottomSheetHandle}>
          <View style={styles.handleBar} />
        </View>
        <ScrollView
          style={styles.cardContent}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.lg, }}
          showsVerticalScrollIndicator={false}
          bounces={false}
          scrollEnabled={!isDragging}
        >
          {/* Arrival Time Section */}
          <View style={styles.arrivalTimeCard}>
            <View style={styles.arrivalTimeContent}>
              <View style={styles.arrivalTimeLeft}>
                <View style={styles.arrivalTimeIconContainer}>
                  <Text style={styles.arrivalTimeIcon}>⏱️</Text>
                </View>
                <View style={styles.arrivalTimeTextContainer}>
                  <Typography variant="bodyMedium" weight="600" style={{ color: colors.textSecondary }}>
                    {strings.tripInProgress.estimatedArrival}
                  </Typography>
                  {actualRouteDuration && (
                    <Typography variant="h3" weight="700" style={{ color: colors.primary }}>
                      {formatDuration(actualRouteDuration)}
                    </Typography>
                  )}
                </View>
              </View>
              {typeof actualRouteDistanceKm === 'number' && (
                <View style={styles.distanceContainer}>
                  <Typography variant="bodyMedium" weight="700" style={{ color: colors.textPrimary }}>
                    {actualRouteDistanceKm.toFixed(1)} km
                  </Typography>
                  <Typography variant="caption" weight="500" style={{ color: colors.textSecondary }}>
                    {strings.tripInProgress.distance}
                  </Typography>
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
                  <Typography variant="h4" weight="700" style={{ color: colors.textPrimary }}>
                    {strings.tripInProgress.deliveryLocation}
                  </Typography>
                  <Typography variant="smallMedium" weight="500" style={{ color: colors.textPrimary, marginTop: spacing.xs / 2 }} numberOfLines={2}>
                    {sampleTrip.unloadingLocation.address}
                  </Typography>
                </View>
                <TouchableOpacity
                        style={styles.deliveryNavigateButton}
                        onPress={() => handleNavigate(unloadingAddress, 'Delivery Location')}
                        activeOpacity={0.7}>
                        <Image
                          source={require('@/assets/images/location.png')}
                          style={styles.deliveryNavigateButtonIcon}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
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
                        <Typography variant="h4" weight="700" style={{ color: colors.textPrimary }}>
                         {strings.tripInProgress.contactPerson}
                        </Typography>
                        <Typography variant="smallMedium" weight="500" style={{ color: colors.textPrimary, marginTop: spacing.xs / 2 }} numberOfLines={2}>
                          {sampleTrip.unloadingLocation.contactPerson.name}
                        </Typography>
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
                      
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Slide to Mark as Arrived Button */}
          <View style={styles.slideContainer}>
            <TouchableOpacity onPress={() => { handleMarkAsArrived() }} style={{ justifyContent: "center", alignContent: "center", padding: 15, backgroundColor: colors.primary, borderRadius: 10 }}>
              <Typography variant="bodySemibold" weight="600" style={{ textAlign: "center", color: "#fff" }}>
               {strings.tripInProgress.markArrived}
              </Typography>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>



    </SafeAreaView >
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
  deliveryMarker: {
    borderColor: '#10B981', // Green border for delivery
  },
  deliveryEmoji: {
    fontSize: 24,
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
    right: 0,           // ← Yeh important hai
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
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg
    // Padding moved to ScrollView contentContainerStyle
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
    width: '100%',
    paddingLeft: 5
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
    width: 40,
    height: 40,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  arrivalTimeIcon: {
    fontSize: 18,
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
    backgroundColor: colors.primaryLight,
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
    bottom: 10,
    backgroundColor: colors.primaryLight,
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