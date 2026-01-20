import fc from 'fast-check';
import {Trip, TripStatus, Document, DocumentFile, DocumentStage, LocationPoint, User, LocationCoordinates} from '@/types';

/**
 * Data factory for generating mock data for development and testing
 */

export class DataFactory {
  private static tripIdCounter = 1;
  private static documentIdCounter = 1;

  // Trip ID arbitrary
  static tripIdArbitrary(): fc.Arbitrary<string> {
    return fc.string({minLength: 5, maxLength: 20}).map(s => `TRIP_${s.replace(/[^a-zA-Z0-9]/g, '')}`);
  }

  // Document file arbitrary
  static documentFileArbitrary(): fc.Arbitrary<DocumentFile> {
    return fc.record({
      uri: fc.string({minLength: 10, maxLength: 100}).map(s => `file://${s.replace(/[^a-zA-Z0-9]/g, '')}`),
      type: fc.constantFrom<'image' | 'pdf'>('image', 'pdf'),
      name: fc.tuple(
        fc.string({minLength: 3, maxLength: 20}).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
        fc.constantFrom('jpg', 'jpeg', 'png', 'pdf')
      ).map(([name, ext]) => `${name}.${ext}`),
      size: fc.integer({min: 1000, max: 10000000}),
    }).map(file => ({
      ...file,
      type: file.name.endsWith('.pdf') ? 'pdf' as const : 'image' as const,
    }));
  }

  // Fast-check arbitraries for property-based testing
  static tripArbitrary(): fc.Arbitrary<Trip> {
    return fc.record({
      id: fc.string({minLength: 5, maxLength: 20}),
      status: fc.constantFrom<TripStatus>('Assigned', 'In Progress', 'Loaded', 'Arrived', 'Completed'),
      loadingLocation: this.locationArbitrary(),
      unloadingLocation: this.locationArbitrary(),
      timeline: this.timelineArbitrary(),
      documents: fc.record({
        loading: fc.array(this.documentArbitrary(), {maxLength: 3}),
        unloading: fc.array(this.documentArbitrary(), {maxLength: 3}),
      }),
      remarks: fc.record({
        loading: fc.option(fc.string({maxLength: 200})),
        unloading: fc.option(fc.string({maxLength: 200})),
      }),
      trackingData: fc.array(this.locationPointArbitrary(), {maxLength: 10}),
    }).map(trip => {
      // Ensure timeline consistency with status
      const timeline = this.ensureTimelineConsistency(trip.timeline, trip.status as TripStatus);
      return {...trip, timeline} as Trip;
    });
  }

  static locationArbitrary() {
    return fc.record({
      address: fc.string({minLength: 10, maxLength: 100}),
      coordinates: this.coordinatesArbitrary(),
      contactPerson: fc.record({
        name: fc.string({minLength: 2, maxLength: 50}),
        phoneNumber: this.phoneNumberArbitrary(),
      }),
    });
  }

  static coordinatesArbitrary(): fc.Arbitrary<LocationCoordinates> {
    return fc.record({
      latitude: fc.float({min: -90, max: 90}),
      longitude: fc.float({min: -180, max: 180}),
      accuracy: fc.float({min: 1, max: 100}),
      timestamp: fc.date({min: new Date('2020-01-01'), max: new Date('2030-12-31')}),
    });
  }

  static phoneNumberArbitrary(): fc.Arbitrary<string> {
    return fc.oneof(
      fc.string({minLength: 10, maxLength: 15}).map(s => s.replace(/[^0-9]/g, '')).filter(s => s.length >= 10),
      fc.tuple(
        fc.constantFrom('+1', '+44', '+49', '+33'),
        fc.integer({min: 100, max: 999}),
        fc.integer({min: 100, max: 999}),
        fc.integer({min: 1000, max: 9999})
      ).map(([country, area, exchange, number]) => `${country}-${area}-${exchange}-${number}`)
    );
  }

  static timelineArbitrary() {
    const baseDate = fc.date({min: new Date('2023-01-01'), max: new Date()});
    
    return baseDate.map(assigned => {
      const timeline: any = {assigned};
      
      // Generate progressive timestamps
      let currentTime = assigned.getTime();
      
      if (Math.random() > 0.3) { // 70% chance of being started
        currentTime += Math.random() * 2 * 60 * 60 * 1000; // 0-2 hours later
        timeline.started = new Date(currentTime);
        
        if (Math.random() > 0.4) { // 60% chance of being loaded if started
          currentTime += Math.random() * 3 * 60 * 60 * 1000; // 0-3 hours later
          timeline.loaded = new Date(currentTime);
          
          if (Math.random() > 0.5) { // 50% chance of arriving if loaded
            currentTime += Math.random() * 4 * 60 * 60 * 1000; // 0-4 hours later
            timeline.arrived = new Date(currentTime);
            
            if (Math.random() > 0.6) { // 40% chance of completion if arrived
              currentTime += Math.random() * 1 * 60 * 60 * 1000; // 0-1 hour later
              timeline.completed = new Date(currentTime);
            }
          }
        }
      }
      
      return timeline;
    });
  }

  static documentArbitrary(): fc.Arbitrary<Document> {
    return fc.record({
      id: fc.string({minLength: 5, maxLength: 20}),
      tripId: fc.string({minLength: 5, maxLength: 20}),
      stage: fc.constantFrom('loading', 'unloading'),
      uri: fc.string({minLength: 10, maxLength: 100}),
      type: fc.constantFrom('image', 'pdf'),
      name: fc.string({minLength: 5, maxLength: 50}),
      size: fc.integer({min: 1000, max: 10000000}),
      uploadedAt: fc.date({min: new Date('2023-01-01'), max: new Date()}),
      uploaded: fc.boolean(),
    });
  }

  static locationPointArbitrary(): fc.Arbitrary<LocationPoint> {
    return fc.record({
      id: fc.integer({min: 1, max: 10000}),
      tripId: fc.string({minLength: 5, maxLength: 20}),
      latitude: fc.float({min: -90, max: 90}),
      longitude: fc.float({min: -180, max: 180}),
      accuracy: fc.float({min: 1, max: 100}),
      timestamp: fc.date({min: new Date('2023-01-01'), max: new Date()}),
      uploaded: fc.boolean(),
    });
  }

  private static ensureTimelineConsistency(timeline: any, status: TripStatus): any {
    const consistent = {...timeline};
    
    switch (status) {
      case 'Assigned':
        delete consistent.started;
        delete consistent.loaded;
        delete consistent.arrived;
        delete consistent.completed;
        break;
      case 'In Progress':
        if (!consistent.started) {
          consistent.started = new Date(consistent.assigned.getTime() + 60 * 60 * 1000);
        }
        delete consistent.loaded;
        delete consistent.arrived;
        delete consistent.completed;
        break;
      case 'Loaded':
        if (!consistent.started) {
          consistent.started = new Date(consistent.assigned.getTime() + 60 * 60 * 1000);
        }
        if (!consistent.loaded) {
          consistent.loaded = new Date(consistent.started.getTime() + 60 * 60 * 1000);
        }
        delete consistent.arrived;
        delete consistent.completed;
        break;
      case 'Arrived':
        if (!consistent.started) {
          consistent.started = new Date(consistent.assigned.getTime() + 60 * 60 * 1000);
        }
        if (!consistent.loaded) {
          consistent.loaded = new Date(consistent.started.getTime() + 60 * 60 * 1000);
        }
        if (!consistent.arrived) {
          consistent.arrived = new Date(consistent.loaded.getTime() + 60 * 60 * 1000);
        }
        delete consistent.completed;
        break;
      case 'Completed':
        if (!consistent.started) {
          consistent.started = new Date(consistent.assigned.getTime() + 60 * 60 * 1000);
        }
        if (!consistent.loaded) {
          consistent.loaded = new Date(consistent.started.getTime() + 60 * 60 * 1000);
        }
        if (!consistent.arrived) {
          consistent.arrived = new Date(consistent.loaded.getTime() + 60 * 60 * 1000);
        }
        if (!consistent.completed) {
          consistent.completed = new Date(consistent.arrived.getTime() + 60 * 60 * 1000);
        }
        break;
    }
    
    return consistent;
  }

  static generateMockTrip(status: TripStatus = 'Assigned'): Trip {
    const tripId = `TRIP${String(this.tripIdCounter++).padStart(4, '0')}`;
    const now = new Date();
    const assignedDate = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Random date within last week

    const mockLocations = [
      {
        address: '123 Industrial Blvd, Warehouse District, City A',
        lat: 37.7749,
        lng: -122.4194,
        contactName: 'John Smith',
        contactPhone: '+1-555-0101'
      },
      {
        address: '456 Commerce St, Business Park, City B',
        lat: 37.7849,
        lng: -122.4094,
        contactName: 'Sarah Johnson',
        contactPhone: '+1-555-0102'
      },
      {
        address: '789 Logistics Ave, Distribution Center, City C',
        lat: 37.7949,
        lng: -122.3994,
        contactName: 'Mike Wilson',
        contactPhone: '+1-555-0103'
      },
      {
        address: '321 Freight Rd, Cargo Terminal, City D',
        lat: 37.8049,
        lng: -122.3894,
        contactName: 'Lisa Brown',
        contactPhone: '+1-555-0104'
      }
    ];

    const loadingLocation = mockLocations[Math.floor(Math.random() * mockLocations.length)];
    const unloadingLocation = mockLocations[Math.floor(Math.random() * mockLocations.length)];

    const timeline: any = {
      assigned: assignedDate
    };

    // Add timeline dates based on status
    if (status !== 'Assigned') {
      timeline.started = new Date(assignedDate.getTime() + 60 * 60 * 1000); // 1 hour after assigned
    }
    if (status === 'Loaded' || status === 'Arrived' || status === 'Completed') {
      timeline.loaded = new Date(assignedDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours after assigned
    }
    if (status === 'Arrived' || status === 'Completed') {
      timeline.arrived = new Date(assignedDate.getTime() + 4 * 60 * 60 * 1000); // 4 hours after assigned
    }
    if (status === 'Completed') {
      timeline.completed = new Date(assignedDate.getTime() + 5 * 60 * 60 * 1000); // 5 hours after assigned
    }

    return {
      id: tripId,
      status,
      loadingLocation: {
        address: loadingLocation.address,
        coordinates: {
          latitude: loadingLocation.lat,
          longitude: loadingLocation.lng,
          accuracy: 10,
          timestamp: assignedDate
        },
        contactPerson: {
          name: loadingLocation.contactName,
          phoneNumber: loadingLocation.contactPhone
        }
      },
      unloadingLocation: {
        address: unloadingLocation.address,
        coordinates: {
          latitude: unloadingLocation.lat,
          longitude: unloadingLocation.lng,
          accuracy: 10,
          timestamp: assignedDate
        },
        contactPerson: {
          name: unloadingLocation.contactName,
          phoneNumber: unloadingLocation.contactPhone
        }
      },
      timeline,
      documents: {
        loading: status !== 'Assigned' ? this.generateMockDocuments(tripId, 'loading', 1) : [],
        unloading: status === 'Completed' ? this.generateMockDocuments(tripId, 'unloading', 1) : []
      },
      remarks: {
        loading: status !== 'Assigned' ? 'Loading completed successfully' : undefined,
        unloading: status === 'Completed' ? 'Delivery completed without issues' : undefined
      },
      trackingData: status !== 'Assigned' ? this.generateMockLocationPoints(tripId, 5) : []
    };
  }

  static generateMockDocuments(tripId: string, stage: 'loading' | 'unloading', count: number = 1): Document[] {
    const documents: Document[] = [];
    
    for (let i = 0; i < count; i++) {
      const docId = `DOC${String(this.documentIdCounter++).padStart(6, '0')}`;
      const isImage = Math.random() > 0.3; // 70% chance of image, 30% PDF
      
      documents.push({
        id: docId,
        tripId,
        stage,
        uri: `file://mock-${stage}-${i + 1}.${isImage ? 'jpg' : 'pdf'}`,
        type: isImage ? 'image' : 'pdf',
        name: `${stage}-document-${i + 1}.${isImage ? 'jpg' : 'pdf'}`,
        size: Math.floor(Math.random() * 5000000) + 100000, // 100KB to 5MB
        uploadedAt: new Date(),
        uploaded: Math.random() > 0.2 // 80% chance of being uploaded
      });
    }
    
    return documents;
  }

  static generateMockLocationPoints(tripId: string, count: number = 10): LocationPoint[] {
    const locationPoints: LocationPoint[] = [];
    const baseTime = new Date().getTime() - (count * 5 * 60 * 1000); // Start 5 minutes * count ago
    
    // Start from loading location and move towards unloading location
    const startLat = 37.7749;
    const startLng = -122.4194;
    const endLat = 37.7849;
    const endLng = -122.4094;
    
    for (let i = 0; i < count; i++) {
      const progress = i / (count - 1);
      const lat = startLat + (endLat - startLat) * progress;
      const lng = startLng + (endLng - startLng) * progress;
      
      locationPoints.push({
        id: i + 1,
        tripId,
        latitude: lat + (Math.random() - 0.5) * 0.001, // Add small random variation
        longitude: lng + (Math.random() - 0.5) * 0.001,
        accuracy: Math.floor(Math.random() * 20) + 5, // 5-25 meters accuracy
        timestamp: new Date(baseTime + i * 5 * 60 * 1000), // Every 5 minutes
        uploaded: Math.random() > 0.1 // 90% chance of being uploaded
      });
    }
    
    return locationPoints;
  }

  static generateMockTrips(count: number = 10): Trip[] {
    const trips: Trip[] = [];
    const statuses: TripStatus[] = ['Assigned', 'In Progress', 'Loaded', 'Arrived', 'Completed'];
    
    for (let i = 0; i < count; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      trips.push(this.generateMockTrip(status));
    }
    
    return trips;
  }

  static generateActiveTrips(count: number = 3): Trip[] {
    const activeStatuses: TripStatus[] = ['Assigned', 'In Progress'];
    const trips: Trip[] = [];
    
    for (let i = 0; i < count; i++) {
      const status = activeStatuses[Math.floor(Math.random() * activeStatuses.length)];
      trips.push(this.generateMockTrip(status));
    }
    
    return trips;
  }

  static generateCompletedTrips(count: number = 5): Trip[] {
    const trips: Trip[] = [];
    
    for (let i = 0; i < count; i++) {
      trips.push(this.generateMockTrip('Completed'));
    }
    
    return trips;
  }

  static generateMockUser(): User {
    const names = ['John Driver', 'Sarah Wilson', 'Mike Johnson', 'Lisa Brown', 'David Smith'];
    const companies = ['Atce Transport Co.', 'Swift Logistics', 'Prime Delivery', 'Express Freight'];
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: names[Math.floor(Math.random() * names.length)],
      employeeId: `EMP${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`,
      email: 'driver@atce.com',
      mobileNumber: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      transportCompany: companies[Math.floor(Math.random() * companies.length)]
    };
  }

  // Reset counters for testing
  static resetCounters(): void {
    this.tripIdCounter = 1;
    this.documentIdCounter = 1;
  }
}