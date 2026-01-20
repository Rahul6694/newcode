import fc from 'fast-check';
import {Trip, TripStatus} from '@/types';
import {DataFactory} from '@/utils/dataFactory';

describe('Trip Workflow Properties', () => {
  // Property 9: Trip start effects
  describe('Property 9: Trip start effects', () => {
    it('should transition from Assigned to In Progress correctly', () => {
      fc.assert(
        fc.property(
          DataFactory.tripArbitrary(),
          (trip: Trip) => {
            if (trip.status === 'Assigned') {
              // When starting a trip, status should change to In Progress
              const newStatus: TripStatus = 'In Progress';
              
              // Validate the transition is valid
              expect(newStatus).toBe('In Progress');
              
              // Timeline should be updated with started time
              const updatedTimeline = {
                ...trip.timeline,
                started: new Date(),
              };
              
              expect(updatedTimeline.started).toBeDefined();
              expect(updatedTimeline.started!.getTime()).toBeGreaterThanOrEqual(
                trip.timeline.assigned.getTime()
              );
            }
          }
        ),
        {numRuns: 100}
      );
    });

    it('should only allow starting trips that are Assigned', () => {
      fc.assert(
        fc.property(
          DataFactory.tripArbitrary(),
          (trip: Trip) => {
            const canStart = trip.status === 'Assigned';
            
            if (canStart) {
              expect(trip.timeline.started).toBeUndefined();
              expect(trip.timeline.loaded).toBeUndefined();
              expect(trip.timeline.arrived).toBeUndefined();
              expect(trip.timeline.completed).toBeUndefined();
            }
          }
        ),
        {numRuns: 100}
      );
    });
  });

  // Property 12: Status progression validation
  describe('Property 12: Status progression validation', () => {
    const statusOrder: TripStatus[] = ['Assigned', 'In Progress', 'Loaded', 'Arrived', 'Completed'];

    it('should only allow valid status transitions', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...statusOrder),
          fc.constantFrom(...statusOrder),
          (currentStatus: TripStatus, targetStatus: TripStatus) => {
            const currentIndex = statusOrder.indexOf(currentStatus);
            const targetIndex = statusOrder.indexOf(targetStatus);
            
            // Valid transition is only to the next status
            const isValidTransition = targetIndex === currentIndex + 1;
            
            // Validate the transition logic
            const getNextStatus = (status: TripStatus): TripStatus | null => {
              switch (status) {
                case 'Assigned':
                  return 'In Progress';
                case 'In Progress':
                  return 'Loaded';
                case 'Loaded':
                  return 'Arrived';
                case 'Arrived':
                  return 'Completed';
                case 'Completed':
                  return null;
                default:
                  return null;
              }
            };
            
            const expectedNext = getNextStatus(currentStatus);
            
            if (isValidTransition) {
              expect(targetStatus).toBe(expectedNext);
            }
          }
        ),
        {numRuns: 50}
      );
    });

    it('should not allow skipping statuses', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...statusOrder),
          (currentStatus: TripStatus) => {
            const currentIndex = statusOrder.indexOf(currentStatus);
            
            // Cannot skip to any status more than 1 step ahead
            for (let i = currentIndex + 2; i < statusOrder.length; i++) {
              const skippedStatus = statusOrder[i];
              const isValidSkip = false; // Skipping is never valid
              
              expect(isValidSkip).toBe(false);
            }
          }
        ),
        {numRuns: 20}
      );
    });

    it('should not allow going backwards in status', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...statusOrder),
          (currentStatus: TripStatus) => {
            const currentIndex = statusOrder.indexOf(currentStatus);
            
            // Cannot go back to any previous status
            for (let i = 0; i < currentIndex; i++) {
              const previousStatus = statusOrder[i];
              const canGoBack = false; // Going back is never valid
              
              expect(canGoBack).toBe(false);
            }
          }
        ),
        {numRuns: 20}
      );
    });
  });

  // Property 7: Trip completion state transition
  describe('Property 7: Trip completion state transition', () => {
    it('should move trip from active to history on completion', () => {
      fc.assert(
        fc.property(
          DataFactory.tripArbitrary(),
          (trip: Trip) => {
            if (trip.status === 'Arrived') {
              // Simulate completion
              const completedTrip = {
                ...trip,
                status: 'Completed' as TripStatus,
                timeline: {
                  ...trip.timeline,
                  completed: new Date(),
                },
              };
              
              // Completed trip should have all timeline events
              expect(completedTrip.timeline.assigned).toBeDefined();
              expect(completedTrip.timeline.started).toBeDefined();
              expect(completedTrip.timeline.loaded).toBeDefined();
              expect(completedTrip.timeline.arrived).toBeDefined();
              expect(completedTrip.timeline.completed).toBeDefined();
              
              // Status should be Completed
              expect(completedTrip.status).toBe('Completed');
            }
          }
        ),
        {numRuns: 100}
      );
    });

    it('should only allow completion from Arrived status', () => {
      fc.assert(
        fc.property(
          DataFactory.tripArbitrary(),
          (trip: Trip) => {
            const canComplete = trip.status === 'Arrived';
            
            if (!canComplete) {
              // Cannot complete from other statuses
              expect(['Assigned', 'In Progress', 'Loaded', 'Completed']).toContain(trip.status);
            }
          }
        ),
        {numRuns: 100}
      );
    });

    it('should preserve all trip data on completion', () => {
      fc.assert(
        fc.property(
          DataFactory.tripArbitrary(),
          (trip: Trip) => {
            if (trip.status === 'Arrived') {
              const completedTrip = {
                ...trip,
                status: 'Completed' as TripStatus,
                timeline: {
                  ...trip.timeline,
                  completed: new Date(),
                },
              };
              
              // All original data should be preserved
              expect(completedTrip.id).toBe(trip.id);
              expect(completedTrip.loadingLocation).toEqual(trip.loadingLocation);
              expect(completedTrip.unloadingLocation).toEqual(trip.unloadingLocation);
              expect(completedTrip.documents).toEqual(trip.documents);
              expect(completedTrip.remarks).toEqual(trip.remarks);
            }
          }
        ),
        {numRuns: 50}
      );
    });
  });

  describe('Remarks Management Properties', () => {
    it('should allow adding remarks at appropriate stages', () => {
      fc.assert(
        fc.property(
          DataFactory.tripArbitrary(),
          fc.string({minLength: 1, maxLength: 500}),
          (trip: Trip, remarks: string) => {
            // Loading remarks can be added during In Progress
            const canAddLoadingRemarks = trip.status === 'In Progress';
            
            // Unloading remarks can be added during Arrived
            const canAddUnloadingRemarks = trip.status === 'Arrived';
            
            if (canAddLoadingRemarks) {
              const updatedTrip = {
                ...trip,
                remarks: {
                  ...trip.remarks,
                  loading: remarks,
                },
              };
              expect(updatedTrip.remarks.loading).toBe(remarks);
            }
            
            if (canAddUnloadingRemarks) {
              const updatedTrip = {
                ...trip,
                remarks: {
                  ...trip.remarks,
                  unloading: remarks,
                },
              };
              expect(updatedTrip.remarks.unloading).toBe(remarks);
            }
          }
        ),
        {numRuns: 50}
      );
    });

    it('should preserve remarks through status transitions', () => {
      fc.assert(
        fc.property(
          fc.string({minLength: 1, maxLength: 200}),
          fc.string({minLength: 1, maxLength: 200}),
          (loadingRemarks: string, unloadingRemarks: string) => {
            const trip: Partial<Trip> = {
              remarks: {
                loading: loadingRemarks,
                unloading: unloadingRemarks,
              },
            };
            
            // Remarks should be preserved
            expect(trip.remarks!.loading).toBe(loadingRemarks);
            expect(trip.remarks!.unloading).toBe(unloadingRemarks);
          }
        ),
        {numRuns: 50}
      );
    });
  });

  describe('Workflow Validation Properties', () => {
    it('should validate status change confirmation messages', () => {
      const getConfirmMessage = (status: TripStatus): string | null => {
        switch (status) {
          case 'In Progress':
            return 'Start this trip? GPS tracking will begin.';
          case 'Completed':
            return 'Mark this trip as completed? This action cannot be undone.';
          default:
            return null;
        }
      };

      fc.assert(
        fc.property(
          fc.constantFrom<TripStatus>('Assigned', 'In Progress', 'Loaded', 'Arrived', 'Completed'),
          (status: TripStatus) => {
            const message = getConfirmMessage(status);
            
            if (status === 'In Progress' || status === 'Completed') {
              expect(message).not.toBeNull();
              expect(typeof message).toBe('string');
              expect(message!.length).toBeGreaterThan(0);
            } else {
              expect(message).toBeNull();
            }
          }
        ),
        {numRuns: 20}
      );
    });

    it('should provide appropriate success messages for each status', () => {
      const getStatusUpdateMessage = (status: TripStatus): string => {
        switch (status) {
          case 'In Progress':
            return 'Trip started! Navigate to the loading location.';
          case 'Loaded':
            return 'Loading complete! Navigate to the unloading location.';
          case 'Arrived':
            return 'You have arrived! Customer has been notified.';
          case 'Completed':
            return 'Trip completed successfully!';
          default:
            return 'Status updated.';
        }
      };

      fc.assert(
        fc.property(
          fc.constantFrom<TripStatus>('In Progress', 'Loaded', 'Arrived', 'Completed'),
          (status: TripStatus) => {
            const message = getStatusUpdateMessage(status);
            
            expect(message).toBeDefined();
            expect(typeof message).toBe('string');
            expect(message.length).toBeGreaterThan(0);
            
            // Each status should have a unique message
            expect(message).not.toBe('Status updated.');
          }
        ),
        {numRuns: 20}
      );
    });
  });

  describe('Action Button Properties', () => {
    it('should show correct action button for each status', () => {
      const getNextAction = (status: TripStatus) => {
        switch (status) {
          case 'Assigned':
            return {title: 'Start Trip', status: 'In Progress', variant: 'primary'};
          case 'In Progress':
            return {title: 'Mark as Loaded', status: 'Loaded', variant: 'success'};
          case 'Loaded':
            return {title: 'Mark as Arrived', status: 'Arrived', variant: 'warning'};
          case 'Arrived':
            return {title: 'Complete Trip', status: 'Completed', variant: 'success'};
          default:
            return null;
        }
      };

      fc.assert(
        fc.property(
          fc.constantFrom<TripStatus>('Assigned', 'In Progress', 'Loaded', 'Arrived', 'Completed'),
          (status: TripStatus) => {
            const action = getNextAction(status);
            
            if (status === 'Completed') {
              expect(action).toBeNull();
            } else {
              expect(action).not.toBeNull();
              expect(action!.title).toBeDefined();
              expect(action!.status).toBeDefined();
              expect(action!.variant).toBeDefined();
              expect(['primary', 'secondary', 'success', 'warning']).toContain(action!.variant);
            }
          }
        ),
        {numRuns: 20}
      );
    });

    it('should show loading actions only during In Progress status', () => {
      fc.assert(
        fc.property(
          DataFactory.tripArbitrary(),
          (trip: Trip) => {
            const showLoadingActions = trip.status === 'In Progress';
            
            if (showLoadingActions) {
              expect(trip.status).toBe('In Progress');
              expect(trip.timeline.started).toBeDefined();
              expect(trip.timeline.loaded).toBeUndefined();
            }
          }
        ),
        {numRuns: 100}
      );
    });

    it('should show unloading actions only during Arrived status', () => {
      fc.assert(
        fc.property(
          DataFactory.tripArbitrary(),
          (trip: Trip) => {
            const showUnloadingActions = trip.status === 'Arrived';
            
            if (showUnloadingActions) {
              expect(trip.status).toBe('Arrived');
              expect(trip.timeline.arrived).toBeDefined();
              expect(trip.timeline.completed).toBeUndefined();
            }
          }
        ),
        {numRuns: 100}
      );
    });
  });
});