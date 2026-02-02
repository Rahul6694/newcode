
import axios from 'axios';

export const getCoordinatesFromAddress = async (address: string) => {
  if (!address) return null;

  try {
    const apiKey = 'AIzaSyAqBEGD7SlCdvqKeL8rom-hyz46dCULdNs'; // 🔑 replace with your key
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: { address, key: apiKey },
      }
    );

    const location = response.data.results[0]?.geometry?.location;
    if (!location) return null;

    return {
      latitude: location.lat,
      longitude: location.lng,
    };
  } catch (error) {
    console.log('Geocoding error:', error);
    return null;
  }
};




import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';


export const TripMapPreview = ({ trip }: { trip: any }) => {
  const [origin, setOrigin] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoordinates = async () => {
      setLoading(true);

      const originCoords = await getCoordinatesFromAddress(trip.order?.loadingAddress || trip.loadingLocation?.address);
      const destCoords = await getCoordinatesFromAddress(trip.order?.unloadingAddress || trip.unloadingLocation?.address);

      setOrigin(originCoords);
      setDestination(destCoords);
      setLoading(false);
    };

    fetchCoordinates();
  }, [trip]);

  if (loading || !origin || !destination) {
    return <ActivityIndicator size="small" color="#03a4ed" style={{ marginVertical: 20 }} />;
  }

  const latitudeDelta = Math.abs(origin.latitude - destination.latitude) * 2.5 || 0.1;
  const longitudeDelta = Math.abs(origin.longitude - destination.longitude) * 2.5 || 0.1;

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        zoomEnabled
        mapType='terrain'
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: (origin.latitude + destination.latitude) / 2,
          longitude: (origin.longitude + destination.longitude) / 2,
          latitudeDelta,
          longitudeDelta,
        }}
        
      >
        <Marker coordinate={origin} title={trip.order?.loadingCity || 'Loading'} />
        <Marker coordinate={destination} title={trip.order?.unloadingCity || 'Unloading'} />
        <Polyline coordinates={[origin, destination]} strokeWidth={4} strokeColor="#03a4ed" />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 160,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 10,
  },
});
