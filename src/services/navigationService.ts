import {Linking, Platform} from 'react-native';
import {LocationCoordinates} from '@/types';

export const navigationService = {
  // Direct navigation to Google Maps without showing options dialog
  navigateToLocation: (location: {coordinates: LocationCoordinates; address?: string; label?: string}) => {
    const {latitude, longitude} = location.coordinates;
    
    // Directly open Google Maps for navigation
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    
    Linking.openURL(googleMapsUrl).catch(err => {
      console.error('Failed to open Google Maps:', err);
      // Fallback to default maps if Google Maps is not available
      const fallbackUrl = Platform.select({
        ios: `maps://app?daddr=${latitude},${longitude}`,
        android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`,
      });
      if (fallbackUrl) {
        Linking.openURL(fallbackUrl).catch(console.error);
      }
    });
  },
  
  // Legacy function name for backward compatibility (directly navigates now)
  showNavigationOptions: (location: {coordinates: LocationCoordinates; address?: string; label?: string}) => {
    navigationService.navigateToLocation(location);
  },
};
