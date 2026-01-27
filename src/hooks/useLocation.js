import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const requestLocationPermission = async () => {
  try {
    const permission = await request(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
    );

    return permission === RESULTS.GRANTED;
  } catch (e) {
    console.log('Permission error:', e);
    return false;
  }
};

const useLocation = (isFocused = true) => {
  const watchId = useRef(null);

  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    heading: null,
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isFocused) return;

    const startTracking = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      if (watchId.current !== null) {
        Geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }

      watchId.current = Geolocation.watchPosition(
        position => {
          const { latitude, longitude, heading } = position.coords;
          setLocation({ latitude, longitude, heading });
        },
        err => {
          console.log('Location error:', err);
          setError(err);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 1,
          interval: 5000,
          fastestInterval: 2000,
        }
      );
    };

    startTracking();

    return () => {
      if (watchId.current !== null) {
        Geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [isFocused]);

  return { ...location, error };
};

export default useLocation;
