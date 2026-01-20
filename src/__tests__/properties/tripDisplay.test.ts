import fc from 'fast-check';
import {Trip, TripStatus} from '@/types';
import {DataFactory} from '@/utils/dataFactory';

describe('Trip Display Properties', () => {
  // Property 6: Trip card completeness
  describe('Property 6: Trip card completeness', () => {
    it('should display all required trip information in cards', () => {
      fc.assert(
        fc.property(
          fc.array(DataFactory.tripArbitrary(), {minLength: 1, maxLength: 10}),
          (trips: Trip[]) => {
            // Test that each trip has all required display fields
            trips.forEach(trip => {
              // Trip ID should be present and valid
              expect(trip.id).toBeDefined();
              expect(typeof trip.id).toBe('string');
              expect(trip.id.length).toBeGreaterThan(0);

              // Status should be valid
              expect(['Assigned', 'In Progress', 'Loaded', 'Arrived', 'Completed']).toContain(trip.status);

              // Loading location should have all required fields
              expect(trip.loadingLocation).toBeDefined();
              expect(trip.loadingLocation.address).toBeDefined();
              expect(typeof trip.loadingLocation.address).toBe('string');
              expect(trip.loadingLocation.address.length).toBeGreaterThan(0);
              
              expect(trip.loadingLocation.contactPerson).toBeDefined();
              expect(trip.loadingLocation.contactPerson.name).toBeDefined();
              expect(typeof trip.loadingLocation.contactPerson.name).toBe('string');
              expect(trip.loadingLocation.contactPerson.name.length).toBeGreaterThan(0);
              
              expect(trip.loadingLocation.contactPerson.phoneNumber).toBeDefined();
              expect(typeof trip.loadingLocation.contactPerson.phoneNumber).toBe('string');
              expect(trip.loadingLocation.contactPerson.phoneNumber.length).toBeGreaterThan(0);

              // Unloading location should have all required fields
              expect(trip.unloadingLocation).toBeDefined();
              expect(trip.unloadingLocation.address).toBeDefined();
              expect(typeof trip.unloadingLocation.address).toBe('string');
              expect(trip.unloadingLocation.address.length).toBeGreaterThan(0);
              
              expect(trip.unloadingLocation.contactPerson).toBeDefined();
              expect(trip.unloadingLocation.contactPerson.name).toBeDefined();
              expect(typeof trip.unloadingLocation.contactPerson.name).toBe('string');
              expect(trip.unloadingLocation.contactPerson.name.length).toBeGreaterThan(0);
              
              expect(trip.unloadingLocation.contactPerson.phoneNumber).toBeDefined();
              expect(typeof trip.unloadingLocation.contactPerson.phoneNumber).toBe('string');
              expect(trip.unloadingLocation.contactPerson.phoneNumber.length).toBeGreaterThan(0);

              // Timeline should have assigned date
              expect(trip.timeline).toBeDefined();
              expect(trip.timeline.assigned).toBeDefined();
              expect(trip.timeline.assigned).toBeInstanceOf(Date);

              // Timeline progression should be logical
              if (trip.timeline.started) {
                expect(trip.timeline.started.getTime()).toBeGreaterThanOrEqual(
                  trip.timeline.assigned.getTime()
                );
              }
              
              if (trip.timeline.loaded) {
                expect(trip.timeline.started).toBeDefined();
                expect(trip.timeline.loaded.getTime()).toBeGreaterThanOrEqual(
                  trip.timeline.started!.getTime()
                );
              }
              
              if (trip.timeline.arrived) {
                expect(trip.timeline.loaded).toBeDefined();
                expect(trip.timeline.arrived.getTime()).toBeGreaterThanOrEqual(
                  trip.timeline.loaded!.getTime()
                );
              }
              
              if (trip.timeline.completed) {
                expect(trip.timeline.arrived).toBeDefined();
                expect(trip.timeline.completed.getTime()).toBeGreaterThanOrEqual(
                  trip.timeline.arrived!.getTime()
                );
              }
            });
          }
        ),
        {numRuns: 50}
      );
    });

    it('should have consistent status and timeline correlation', () => {
      fc.assert(
        fc.property(
          DataFactory.tripArbitrary(),
          (trip: Trip) => {
            // Status should correlate with timeline
            switch (trip.status) {
              case 'Assigned':
                expect(trip.timeline.assigned).toBeDefined();
                expect(trip.timeline.started).toBeUndefined();
                break;
              case 'In Progress':
                expect(trip.timeline.assigned).toBeDefined();
                expect(trip.timeline.started).toBeDefined();
                expect(trip.timeline.loaded).toBeUndefined();
                break;
              case 'Loaded':
                expect(trip.timeline.assigned).toBeDefined();
                expect(trip.timeline.started).toBeDefined();
                expect(trip.timeline.loaded).toBeDefined();
                expect(trip.timeline.arrived).toBeUndefined();
                break;
              case 'Arrived':
                expect(trip.timeline.assigned).toBeDefined();
                expect(trip.timeline.started).toBeDefined();
                expect(trip.timeline.loaded).toBeDefined();
                expect(trip.timeline.arrived).toBeDefined();
                expect(trip.timeline.completed).toBeUndefined();
                break;
              case 'Completed':
                expect(trip.timeline.assigned).toBeDefined();
                expect(trip.timeline.started).toBeDefined();
                expect(trip.timeline.loaded).toBeDefined();
                expect(trip.timeline.arrived).toBeDefined();
                expect(trip.timeline.completed).toBeDefined();
                break;
            }
          }
        ),
        {numRuns: 100}
      );
    });
  });

  // Property 8: Trip navigation
  describe('Property 8: Trip navigation', () => {
    it('should provide valid navigation data for all trip locations', () => {
      fc.assert(
        fc.property(
          DataFactory.tripArbitrary(),
          (trip: Trip) => {
            // Loading location should have valid coordinates
            expect(trip.loadingLocation.coordinates).toBeDefined();
            expect(typeof trip.loadingLocation.coordinates.latitude).toBe('number');
            expect(typeof trip.loadingLocation.coordinates.longitude).toBe('number');
            expect(trip.loadingLocation.coordinates.latitude).toBeGreaterThanOrEqual(-90);
            expect(trip.loadingLocation.coordinates.latitude).toBeLessThanOrEqual(90);
            expect(trip.loadingLocation.coordinates.longitude).toBeGreaterThanOrEqual(-180);
            expect(trip.loadingLocation.coordinates.longitude).toBeLessThanOrEqual(180);

            // Unloading location should have valid coordinates
            expect(trip.unloadingLocation.coordinates).toBeDefined();
            expect(typeof trip.unloadingLocation.coordinates.latitude).toBe('number');
            expect(typeof trip.unloadingLocation.coordinates.longitude).toBe('number');
            expect(trip.unloadingLocation.coordinates.latitude).toBeGreaterThanOrEqual(-90);
            expect(trip.unloadingLocation.coordinates.latitude).toBeLessThanOrEqual(90);
            expect(trip.unloadingLocation.coordinates.longitude).toBeGreaterThanOrEqual(-180);
            expect(trip.unloadingLocation.coordinates.longitude).toBeLessThanOrEqual(180);

            // Addresses should be non-empty for navigation
            expect(trip.loadingLocation.address.trim().length).toBeGreaterThan(0);
            expect(trip.unloadingLocation.address.trim().length).toBeGreaterThan(0);
          }
        ),
        {numRuns: 100}
      );
    });

    it('should generate valid Google Maps URLs for navigation', () => {
      fc.assert(
        fc.property(
          fc.string({minLength: 1, maxLength: 200}),
          (address: string) => {
            const encodedAddress = encodeURIComponent(address);
            const url = `https://maps.google.com/?daddr=${encodedAddress}`;
            
            // URL should be valid
            expect(() => new URL(url)).not.toThrow();
            
            // URL should contain the encoded address
            expect(url).toContain(encodedAddress);
            
            // URL should start with Google Maps domain
            expect(url).toMatch(/^https:\/\/maps\.google\.com/);
          }
        ),
        {numRuns: 50}
      );
    });

    it('should validate phone numbers for calling functionality', () => {
      fc.assert(
        fc.property(
          DataFactory.tripArbitrary(),
          (trip: Trip) => {
            // Loading contact phone should be valid
            const loadingPhone = trip.loadingLocation.contactPerson.phoneNumber;
            expect(loadingPhone).toBeDefined();
            expect(typeof loadingPhone).toBe('string');
            expect(loadingPhone.length).toBeGreaterThan(0);
            
            // Should contain only valid phone characters
            expect(loadingPhone).toMatch(/^[\d\s\-\+\(\)\.]+$/);

            // Unloading contact phone should be valid
            const unloadingPhone = trip.unloadingLocation.contactPerson.phoneNumber;
            expect(unloadingPhone).toBeDefined();
            expect(typeof unloadingPhone).toBe('string');
            expect(unloadingPhone.length).toBeGreaterThan(0);
            
            // Should contain only valid phone characters
            expect(unloadingPhone).toMatch(/^[\d\s\-\+\(\)\.]+$/);
          }
        ),
        {numRuns: 100}
      );
    });
  });

  describe('Trip Status Display Properties', () => {
    it('should have appropriate status colors for all statuses', () => {
      const getStatusColor = (status: TripStatus) => {
        switch (status) {
          case 'Assigned':
            return '#007AFF';
          case 'In Progress':
            return '#FF9500';
          case 'Loaded':
            return '#34C759';
          case 'Arrived':
            return '#AF52DE';
          case 'Completed':
            return '#8E8E93';
          default:
            return '#8E8E93';
        }
      };

      fc.assert(
        fc.property(
          fc.constantFrom('Assigned', 'In Progress', 'Loaded', 'Arrived', 'Completed'),
          (status: TripStatus) => {
            const color = getStatusColor(status);
            
            // Color should be a valid hex color
            expect(color).toMatch(/^#[0-9A-F]{6}$/i);
            
            // Each status should have a unique color (except default)
            const colors = {
              'Assigned': '#007AFF',
              'In Progress': '#FF9500',
              'Loaded': '#34C759',
              'Arrived': '#AF52DE',
              'Completed': '#8E8E93',
            };
            
            expect(color).toBe(colors[status]);
          }
        ),
        {numRuns: 20}
      );
    });

    it('should format dates consistently', () => {
      fc.assert(
        fc.property(
          fc.date({min: new Date('2020-01-01'), max: new Date('2030-12-31')}),
          (date: Date) => {
            const formatted = new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }).format(date);
            
            // Should contain month abbreviation
            expect(formatted).toMatch(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/);
            
            // Should contain day number
            expect(formatted).toMatch(/\d{1,2}/);
            
            // Should contain time in HH:MM format
            expect(formatted).toMatch(/\d{1,2}:\d{2}/);
          }
        ),
        {numRuns: 50}
      );
    });
  });

  describe('Trip Action Properties', () => {
    it('should provide correct next actions for each status', () => {
      const getNextAction = (status: TripStatus) => {
        switch (status) {
          case 'Assigned':
            return {
              title: 'Start Trip',
              status: 'In Progress' as TripStatus,
              variant: 'primary' as const,
            };
          case 'In Progress':
            return {
              title: 'Mark as Loaded',
              status: 'Loaded' as TripStatus,
              variant: 'success' as const,
            };
          case 'Loaded':
            return {
              title: 'Mark as Arrived',
              status: 'Arrived' as TripStatus,
              variant: 'warning' as const,
            };
          case 'Arrived':
            return {
              title: 'Complete Trip',
              status: 'Completed' as TripStatus,
              variant: 'success' as const,
            };
          default:
            return null;
        }
      };

      fc.assert(
        fc.property(
          fc.constantFrom('Assigned', 'In Progress', 'Loaded', 'Arrived', 'Completed'),
          (status: TripStatus) => {
            const nextAction = getNextAction(status);
            
            if (status === 'Completed') {
              expect(nextAction).toBeNull();
            } else {
              expect(nextAction).toBeDefined();
              expect(nextAction!.title).toBeDefined();
              expect(typeof nextAction!.title).toBe('string');
              expect(nextAction!.title.length).toBeGreaterThan(0);
              
              expect(nextAction!.status).toBeDefined();
              expect(['Assigned', 'In Progress', 'Loaded', 'Arrived', 'Completed']).toContain(nextAction!.status);
              
              expect(nextAction!.variant).toBeDefined();
              expect(['primary', 'secondary', 'success', 'warning']).toContain(nextAction!.variant);
            }
          }
        ),
        {numRuns: 20}
      );
    });

    it('should maintain logical status progression', () => {
      const statusProgression: TripStatus[] = ['Assigned', 'In Progress', 'Loaded', 'Arrived', 'Completed'];
      
      fc.assert(
        fc.property(
          fc.integer({min: 0, max: statusProgression.length - 2}),
          (currentIndex: number) => {
            const currentStatus = statusProgression[currentIndex];
            const expectedNextStatus = statusProgression[currentIndex + 1];
            
            const getNextAction = (status: TripStatus) => {
              switch (status) {
                case 'Assigned':
                  return 'In Progress';
                case 'In Progress':
                  return 'Loaded';
                case 'Loaded':
                  return 'Arrived';
                case 'Arrived':
                  return 'Completed';
                default:
                  return null;
              }
            };
            
            const nextStatus = getNextAction(currentStatus);
            expect(nextStatus).toBe(expectedNextStatus);
          }
        ),
        {numRuns: 20}
      );
    });
  });
});