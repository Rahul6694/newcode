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

    return { granted: permission === RESULTS.GRANTED, status: permission };
  } catch (e) {
    console.log('Permission error:', e);
    return { granted: false, status: 'error' };
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
      const { granted, status } = await requestLocationPermission();
      if (!granted) {
        setError({ code: 'PERMISSION_DENIED', message: `Location permission not granted (${status})` });
        return;
      }

      if (watchId.current !== null) {
        Geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }

      // Grab an initial fix ASAP (watchPosition can be slow on first load)
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude, heading } = position.coords;
          setLocation({ latitude, longitude, heading });
          setError(null);
        },
        err => {
          console.log('Initial location error:', err);
          setError(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );

      watchId.current = Geolocation.watchPosition(
        position => {
          const { latitude, longitude, heading } = position.coords;
          setLocation({ latitude, longitude, heading });
          setError(null);
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
          timeout: 15000,
          maximumAge: 0,
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
