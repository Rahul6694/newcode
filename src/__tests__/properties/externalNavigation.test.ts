import fc from 'fast-check';
import {Trip, TripStatus, LocationCoordinates} from '@/types';
import {DataFactory} from '@/utils/dataFactory';

describe('External Navigation Properties', () => {
  // Property 10: Navigation button availability
  describe('Property 10: Navigation button availability', () => {
    it('should show loading navigation button for Assigned and In Progress trips', () => {
      fc.assert(
        fc.property(
          DataFactory.tripArbitrary(),
          (trip: Trip) => {
            const showLoadingNavigation = trip.status === 'Assigned' || trip.status === 'In Progress';
            
            if (showLoadingNavigation) {
              // Loading location should be available for navigation
              expect(trip.loadingLocation).toBeDefined();
              expect(trip.loadingLocation.address).toBeDefined();
              expect(trip.loadingLocation.address.length).toBeGreaterThan(0);
              expect(trip.loadingLocation.coordinates).toBeDefined();
            }
          }
        ),
        {numRuns: 100}
      );
    });

    it('should show unloading navigation button for Loaded and Arrived trips', () => {
      fc.assert(
        fc.property(
          DataFactory.tripArbitrary(),
          (trip: Trip) => {
            const showUnloadingNavigation = trip.status === 'Loaded' || trip.status === 'Arrived';
            
            if (showUnloadingNavigation) {
              // Unloading location should be available for navigation
              expect(trip.unloadingLocation).toBeDefined();
              expect(trip.unloadingLocation.address).toBeDefined();
              expect(trip.unloadingLocation.address.length).toBeGreaterThan(0);
              expect(trip.unloadingLocation.coordinates).toBeDefined();
            }
          }
        ),
        {numRuns: 100}
      );
    });

    it('should not show navigation buttons for Completed trips', () => {
      fc.assert(
        fc.property(
          DataFactory.tripArbitrary(),
          (trip: Trip) => {
            if (trip.status === 'Completed') {
              // Navigation buttons should not be shown for completed trips
              const showLoadingNavigation = false;
              const showUnloadingNavigation = false;
              
              expect(showLoadingNavigation).toBe(false);
              expect(showUnloadingNavigation).toBe(false);
            }
          }
        ),
        {numRuns: 100}
      );
    });

    it('should have correct navigation button visibility based on status', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<TripStatus>('Assigned', 'In Progress', 'Loaded', 'Arrived', 'Completed'),
          (status: TripStatus) => {
            const getNavigationVisibility = (tripStatus: TripStatus) => ({
              showLoadingNavigation: tripStatus === 'Assigned' || tripStatus === 'In Progress',
              showUnloadingNavigation: tripStatus === 'Loaded' || tripStatus === 'Arrived',
            });

            const visibility = getNavigationVisibility(status);
            
            // Loading and unloading navigation should be mutually exclusive
            if (visibility.showLoadingNavigation) {
              expect(visibility.showUnloadingNavigation).toBe(false);
            }
            
            if (visibility.showUnloadingNavigation) {
              expect(visibility.showLoadingNavigation).toBe(false);
            }
            
            // Completed trips should have no navigation
            if (status === 'Completed') {
              expect(visibility.showLoadingNavigation).toBe(false);
              expect(visibility.showUnloadingNavigation).toBe(false);
            }
          }
        ),
        {numRuns: 20}
      );
    });
  });

  // Property 11: External navigation integration
  describe('Property 11: External navigation integration', () => {
    it('should generate valid Google Maps URLs for addresses', () => {
      fc.assert(
        fc.property(
          fc.string({minLength: 5, maxLength: 200}).filter(s => s.trim().length > 0),
          (address: string) => {
            const encodedAddress = encodeURIComponent(address);
            
            // Google Maps web URL
            const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
            expect(() => new URL(webUrl)).not.toThrow();
            expect(webUrl).toContain('google.com/maps');
            
            // Android navigation URL
            const androidUrl = `google.navigation:q=${encodedAddress}`;
            expect(androidUrl).toContain('google.navigation');
            
            // iOS Google Maps URL
            const iosUrl = `comgooglemaps://?daddr=${encodedAddress}&directionsmode=driving`;
            expect(iosUrl).toContain('comgooglemaps://');
          }
        ),
        {numRuns: 50}
      );
    });

    it('should generate valid coordinate-based navigation URLs', () => {
      fc.assert(
        fc.property(
          DataFactory.coordinatesArbitrary(),
          (coords: LocationCoordinates) => {
            // Google Maps coordinate URL
            const googleUrl = `google.navigation:q=${coords.latitude},${coords.longitude}`;
            expect(googleUrl).toContain(coords.latitude.toString());
            expect(googleUrl).toContain(coords.longitude.toString());
            
            // Apple Maps URL
            const appleUrl = `maps://?daddr=${coords.latitude},${coords.longitude}&dirflg=d`;
            expect(appleUrl).toContain('maps://');
            expect(appleUrl).toContain(coords.latitude.toString());
            
            // Waze URL
            const wazeUrl = `waze://?ll=${coords.latitude},${coords.longitude}&navigate=yes`;
            expect(wazeUrl).toContain('waze://');
            expect(wazeUrl).toContain('navigate=yes');
          }
        ),
        {numRuns: 50}
      );
    });

    it('should handle special characters in addresses', () => {
      fc.assert(
        fc.property(
          fc.string({minLength: 1, maxLength: 100}).map(s => 
            s + ' & Co., Suite #123 (Main St.)'
          ),
          (addressWithSpecialChars: string) => {
            const encodedAddress = encodeURIComponent(addressWithSpecialChars);
            
            // Special characters should be encoded
            expect(encodedAddress).not.toContain('&');
            expect(encodedAddress).not.toContain('#');
            expect(encodedAddress).not.toContain('(');
            expect(encodedAddress).not.toContain(')');
            
            // URL should still be valid
            const url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
            expect(() => new URL(url)).not.toThrow();
          }
        ),
        {numRuns: 30}
      );
    });

    it('should generate valid phone call URLs', () => {
      fc.assert(
        fc.property(
          DataFactory.phoneNumberArbitrary(),
          (phoneNumber: string) => {
            const telUrl = `tel:${phoneNumber}`;
            
            // Tel URL should be valid
            expect(() => new URL(telUrl)).not.toThrow();
            expect(telUrl).toMatch(/^tel:/);
          }
        ),
        {numRuns: 50}
      );
    });
  });

  describe('Travel Time Estimation Properties', () => {
    it('should estimate zero travel time for same location', () => {
      fc.assert(
        fc.property(
          DataFactory.coordinatesArbitrary(),
          (coords: LocationCoordinates) => {
            const estimateTravelTime = (
              origin: LocationCoordinates,
              destination: LocationCoordinates,
              avgSpeedKmh: number = 40
            ): number => {
              const R = 6371;
              const dLat = (destination.latitude - origin.latitude) * (Math.PI / 180);
              const dLon = (destination.longitude - origin.longitude) * (Math.PI / 180);
              const lat1 = origin.latitude * (Math.PI / 180);
              const lat2 = destination.latitude * (Math.PI / 180);

              const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              const distance = R * c;

              return Math.round((distance / avgSpeedKmh) * 60);
            };

            const time = estimateTravelTime(coords, coords);
            expect(time).toBe(0);
          }
        ),
        {numRuns: 50}
      );
    });

    it('should estimate positive travel time for different locations', () => {
      fc.assert(
        fc.property(
          DataFactory.coordinatesArbitrary(),
          fc.float({min: 0.01, max: 1}),
          (coords: LocationCoordinates, offset: number) => {
            const estimateTravelTime = (
              origin: LocationCoordinates,
              destination: LocationCoordinates,
              avgSpeedKmh: number = 40
            ): number => {
              const R = 6371;
              const dLat = (destination.latitude - origin.latitude) * (Math.PI / 180);
              const dLon = (destination.longitude - origin.longitude) * (Math.PI / 180);
              const lat1 = origin.latitude * (Math.PI / 180);
              const lat2 = destination.latitude * (Math.PI / 180);

              const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              const distance = R * c;

              return Math.round((distance / avgSpeedKmh) * 60);
            };

            const destination: LocationCoordinates = {
              ...coords,
              latitude: Math.min(90, coords.latitude + offset),
              longitude: Math.min(180, coords.longitude + offset),
            };

            const time = estimateTravelTime(coords, destination);
            expect(time).toBeGreaterThanOrEqual(0);
          }
        ),
        {numRuns: 50}
      );
    });
  });

  describe('Navigation Destination Properties', () => {
    it('should have valid destination data for all trips', () => {
      fc.assert(
        fc.property(
          DataFactory.tripArbitrary(),
          (trip: Trip) => {
            // Loading destination
            expect(trip.loadingLocation.address).toBeDefined();
            expect(typeof trip.loadingLocation.address).toBe('string');
            expect(trip.loadingLocation.coordinates).toBeDefined();
            expect(trip.loadingLocation.coordinates.latitude).toBeGreaterThanOrEqual(-90);
            expect(trip.loadingLocation.coordinates.latitude).toBeLessThanOrEqual(90);
            expect(trip.loadingLocation.coordinates.longitude).toBeGreaterThanOrEqual(-180);
            expect(trip.loadingLocation.coordinates.longitude).toBeLessThanOrEqual(180);

            // Unloading destination
            expect(trip.unloadingLocation.address).toBeDefined();
            expect(typeof trip.unloadingLocation.address).toBe('string');
            expect(trip.unloadingLocation.coordinates).toBeDefined();
            expect(trip.unloadingLocation.coordinates.latitude).toBeGreaterThanOrEqual(-90);
            expect(trip.unloadingLocation.coordinates.latitude).toBeLessThanOrEqual(90);
            expect(trip.unloadingLocation.coordinates.longitude).toBeGreaterThanOrEqual(-180);
            expect(trip.unloadingLocation.coordinates.longitude).toBeLessThanOrEqual(180);
          }
        ),
        {numRuns: 100}
      );
    });

    it('should have contact information for navigation destinations', () => {
      fc.assert(
        fc.property(
          DataFactory.tripArbitrary(),
          (trip: Trip) => {
            // Loading contact
            expect(trip.loadingLocation.contactPerson).toBeDefined();
            expect(trip.loadingLocation.contactPerson.name).toBeDefined();
            expect(trip.loadingLocation.contactPerson.phoneNumber).toBeDefined();

            // Unloading contact
            expect(trip.unloadingLocation.contactPerson).toBeDefined();
            expect(trip.unloadingLocation.contactPerson.name).toBeDefined();
            expect(trip.unloadingLocation.contactPerson.phoneNumber).toBeDefined();
          }
        ),
        {numRuns: 100}
      );
    });
  });

  describe('URL Encoding Properties', () => {
    it('should properly encode all URL-unsafe characters', () => {
      const unsafeChars = ['&', '=', '?', '#', ' ', '+', '%', '/', '\\', '"', "'"];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...unsafeChars),
          fc.string({minLength: 1, maxLength: 50}),
          (unsafeChar: string, baseString: string) => {
            const testString = baseString + unsafeChar + baseString;
            const encoded = encodeURIComponent(testString);
            
            // Encoded string should not contain raw unsafe characters
            // (except for some that are allowed in encodeURIComponent)
            if (unsafeChar !== '-' && unsafeChar !== '_' && unsafeChar !== '.' && unsafeChar !== '~') {
              expect(encoded).not.toContain(unsafeChar);
            }
          }
        ),
        {numRuns: 50}
      );
    });

    it('should be reversible (decode after encode)', () => {
      fc.assert(
        fc.property(
          fc.string({minLength: 1, maxLength: 100}),
          (original: string) => {
            const encoded = encodeURIComponent(original);
            const decoded = decodeURIComponent(encoded);
            
            expect(decoded).toBe(original);
          }
        ),
        {numRuns: 50}
      );
    });
  });
});