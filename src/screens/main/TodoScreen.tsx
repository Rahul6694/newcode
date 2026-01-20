import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

// import {getActiveTrips, refreshTrips, selectActiveTrips, selectTripLoading} from '@/store';

import {Trip, TodoStackParamList, TripStatus} from '@/types';
import {Card, StatusBadge, Typography, useToast} from '@/components';
import {colors, spacing, typography, borderRadius, shadows} from '@/theme/colors';

type TodoScreenNavigationProp = StackNavigationProp<TodoStackParamList, 'TodoList'>;

// Dummy Trip Data
const dummyTrips: Trip[] = [
  {
    id: 'trip-001',
    tripNumber: 'TRP-2024-001',
    orderNumber: 'ORD-12345',
    vehicleNumber: 'RJ-14-AB-1234',
    assignedWeight: '5000',
    deliveredWeight: null,
    status: 'Assigned',
    loadingLocation: {
      address: 'Warehouse A, Industrial Area, Jaipur, Rajasthan 302013',
      coordinates: {
        latitude: 26.9124,
        longitude: 75.7873,
        accuracy: 10,
        timestamp: new Date('2024-01-15T08:00:00'),
      },
      contactPerson: {
        name: 'Rajesh Kumar',
        phoneNumber: '+91-9876543210',
      },
    },
    unloadingLocation: {
      address: 'Distribution Center, Sector 5, Delhi, NCR 110001',
      coordinates: {
        latitude: 28.6139,
        longitude: 77.2090,
        accuracy: 10,
        timestamp: new Date('2024-01-15T08:00:00'),
      },
      contactPerson: {
        name: 'Priya Sharma',
        phoneNumber: '+91-9876543211',
      },
    },
    timeline: {
      assigned: new Date('2024-01-15T08:00:00'),
    },
    documents: {
      loading: [],
      unloading: [],
    },
    remarks: {
      loading: undefined,
      unloading: undefined,
    },
    trackingData: [],
  },
  {
    id: 'trip-002',
    tripNumber: 'TRP-2024-002',
    orderNumber: 'ORD-12346',
    vehicleNumber: 'RJ-14-CD-5678',
    assignedWeight: '7500',
    deliveredWeight: null,
    status: 'In Progress',
    loadingLocation: {
      address: 'Factory Complex, MIDC Area, Mumbai, Maharashtra 400093',
      coordinates: {
        latitude: 19.0760,
        longitude: 72.8777,
        accuracy: 10,
        timestamp: new Date('2024-01-15T10:00:00'),
      },
      contactPerson: {
        name: 'Amit Patel',
        phoneNumber: '+91-9876543212',
      },
    },
    unloadingLocation: {
      address: 'Port Warehouse, Nhava Sheva, Navi Mumbai, Maharashtra 400707',
      coordinates: {
        latitude: 18.9517,
        longitude: 72.9994,
        accuracy: 10,
        timestamp: new Date('2024-01-15T10:00:00'),
      },
      contactPerson: {
        name: 'Sunil Desai',
        phoneNumber: '+91-9876543213',
      },
    },
    timeline: {
      assigned: new Date('2024-01-15T10:00:00'),
      started: new Date('2024-01-15T10:30:00'),
    },
    documents: {
      loading: [],
      unloading: [],
    },
    remarks: {
      loading: undefined,
      unloading: undefined,
    },
    trackingData: [],
  },
  {
    id: 'trip-003',
    tripNumber: 'TRP-2024-003',
    orderNumber: 'ORD-12347',
    vehicleNumber: 'RJ-14-EF-9012',
    assignedWeight: '3000',
    deliveredWeight: null,
    status: 'Loaded',
    loadingLocation: {
      address: 'Logistics Hub, Sector 18, Noida, Uttar Pradesh 201301',
      coordinates: {
        latitude: 28.5355,
        longitude: 77.3910,
        accuracy: 10,
        timestamp: new Date('2024-01-15T12:00:00'),
      },
      contactPerson: {
        name: 'Vikram Singh',
        phoneNumber: '+91-9876543214',
      },
    },
    unloadingLocation: {
      address: 'Retail Store, Connaught Place, New Delhi, Delhi 110001',
      coordinates: {
        latitude: 28.6304,
        longitude: 77.2177,
        accuracy: 10,
        timestamp: new Date('2024-01-15T12:00:00'),
      },
      contactPerson: {
        name: 'Anjali Mehta',
        phoneNumber: '+91-9876543215',
      },
    },
    timeline: {
      assigned: new Date('2024-01-15T12:00:00'),
      started: new Date('2024-01-15T12:15:00'),
      loaded: new Date('2024-01-15T13:00:00'),
    },
    documents: {
      loading: [],
      unloading: [],
    },
    remarks: {
      loading: 'All items loaded successfully',
      unloading: undefined,
    },
    trackingData: [],
  },
  {
    id: 'trip-004',
    tripNumber: 'TRP-2024-004',
    orderNumber: 'ORD-12348',
    vehicleNumber: 'RJ-14-GH-3456',
    assignedWeight: '6000',
    deliveredWeight: null,
    status: 'Arrived',
    loadingLocation: {
      address: 'Manufacturing Unit, Peenya Industrial Area, Bangalore, Karnataka 560058',
      coordinates: {
        latitude: 13.0144,
        longitude: 77.5118,
        accuracy: 10,
        timestamp: new Date('2024-01-15T14:00:00'),
      },
      contactPerson: {
        name: 'Ramesh Iyer',
        phoneNumber: '+91-9876543216',
      },
    },
    unloadingLocation: {
      address: 'Customer Site, Electronic City, Bangalore, Karnataka 560100',
      coordinates: {
        latitude: 12.8456,
        longitude: 77.6633,
        accuracy: 10,
        timestamp: new Date('2024-01-15T14:00:00'),
      },
      contactPerson: {
        name: 'Deepak Reddy',
        phoneNumber: '+91-9876543217',
      },
    },
    timeline: {
      assigned: new Date('2024-01-15T14:00:00'),
      started: new Date('2024-01-15T14:20:00'),
      loaded: new Date('2024-01-15T15:00:00'),
      arrived: new Date('2024-01-15T16:30:00'),
    },
    documents: {
      loading: [],
      unloading: [],
    },
    remarks: {
      loading: 'Loading completed on time',
      unloading: undefined,
    },
    trackingData: [],
  },
];

export const TodoScreen: React.FC = () => {
  const navigation = useNavigation<TodoScreenNavigationProp>();
  
  const [refreshing, setRefreshing] = useState(false);
  const {showError} = useToast();
const [loading, setloading] = useState()
  // Use dummy data if active trips are empty - show only first trip
  const allTrips =  dummyTrips;
  const displayTrips = allTrips.slice(0, 1); // Show only first trip

  // useEffect(() => {
  //   loadTrips();
  // }, []);

  // const loadTrips = async () => {
  //   try {
  //     await dispatch(getActiveTrips());
  //   } catch (error) {
  //     // Silently fail and use dummy data
  //     console.log('Using dummy data for trips');
  //   }
  // };

  // const handleRefresh = async () => {
  //   setRefreshing(true);
  //   try {
  //     await dispatch(refreshTrips());
  //   } catch (error) {
  //     showError('Failed to refresh trips');
  //   } finally {
  //     setRefreshing(false);
  //   }
  // };

  const handleTripPress = (trip: Trip) => {
    navigation.navigate('TripDetail', {tripId: trip.id});
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTripCard = ({item}: {item: Trip}) => {
    const loadingCity = item.loadingLocation.address.split(',')[0];
    const unloadingCity = item.unloadingLocation.address.split(',')[0];
    const loadingAddress = item.loadingLocation.address;
    const unloadingAddress = item.unloadingLocation.address;
    
    return (
      <View style={styles.card}>
        {/* Header */}
      <View style={styles.cardHeader}>
          <Typography variant="smallMedium" color="textSecondary" weight="600" style={styles.tripId}>{item.tripNumber}</Typography>
          <StatusBadge status={item.status} />
        </View>

        <View style={styles.divider} />

        {/* Route Section */}
        <View style={styles.routeContainer}>
          <View style={styles.timelineContainer}>
            <View style={[styles.dot, {backgroundColor: colors.success}]} />
            <View style={styles.line} />
            <View style={[styles.dot, {backgroundColor: colors.error}]} />
          </View>
          
          <View style={styles.locations}>
            <View style={styles.locationItem}>
              <Typography variant="bodyMedium" color="textPrimary" weight="700" style={styles.cityText}>{loadingCity}</Typography>
              <Typography variant="small" color="textSecondary" style={styles.addressText} numberOfLines={1}>{loadingAddress}</Typography>
          </View>
            <View style={[styles.locationItem, {marginTop: 20}]}>
              <Typography variant="bodyMedium" color="textPrimary" weight="700" style={styles.cityText}>{unloadingCity}</Typography>
              <Typography variant="small" color="textSecondary" style={styles.addressText} numberOfLines={1}>{unloadingAddress}</Typography>
          </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Info Grid */}
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Image 
              source={require('@/assets/images/shipped.png')} 
              style={styles.gridIcon}
              resizeMode="contain"
            />
            <Typography variant="smallMedium" color="textSecondary" weight="500" style={styles.infoText}>{item.assignedWeight || 'N/A'} Kg</Typography>
          </View>
          <View style={styles.gridItem}>
            <Image 
              source={require('@/assets/images/calendar.png')} 
              style={styles.gridIcon}
              resizeMode="contain"
            />
            <Typography variant="smallMedium" color="textSecondary" weight="500" style={styles.infoText}>
              {new Date(item.timeline.assigned).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Typography>
          </View>
          <View style={styles.gridItem}>
            <Image 
              source={require('@/assets/images/contact-form.png')} 
              style={styles.gridIcon}
              resizeMode="contain"
            />
            <Typography variant="smallMedium" color="textSecondary" weight="500" style={styles.infoText}>Docs: Pending</Typography>
        </View>
      </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.button}
          onPress={() => handleTripPress(item)}
          activeOpacity={0.8}>
          <Typography variant="smallMedium" color="white" weight="700" style={styles.buttonText}>VIEW TRIP DETAILS</Typography>
          <Image 
            source={require('@/assets/images/next.png')} 
            style={styles.buttonArrow}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
  );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Image 
          source={require('@/assets/images/trip.png')} 
          style={styles.emptyIcon}
          resizeMode="contain"
        />
      </View>
      <Typography variant="h4" color="textPrimary" weight="700" style={styles.emptyTitle}>No Active Trips</Typography>
      <Typography variant="body" color="textSecondary" align="center" style={styles.emptySubtitle}>
        You don't have any trips assigned yet. Pull down to refresh.
      </Typography>
    </View>
  );

  // const renderHeader = () => {
  //   const currentHour = new Date().getHours();
  //   const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  //   return (
  //     <View style={styles.headerWrapper}>
  //       {/* Hero Section */}
  //       <View style={styles.heroSection}>
  //         {/* Hero Content */}
  //         <View style={styles.heroContent}>
  //           {/* Header with Greeting */}
  //           <View style={styles.heroHeader}>
  //             <View style={styles.heroHeaderLeft}>
  //               <Typography variant="caption" color="primary" weight="600" style={styles.greetingText}>{greeting}</Typography>
  //               <Typography variant="h2" color="textPrimary" weight="700" style={styles.userName}>Rahul Sharma</Typography>
  //             </View>
  //           </View>

  //           {/* Stats Cards */}
  //           <View style={styles.heroStatsRow}>
  //             <View style={styles.heroStatCard}>
  //               <View style={styles.heroStatIconBg}>
  //                 <Image 
  //                   source={require('@/assets/images/trip.png')} 
  //                   style={styles.heroStatIcon}
  //                   resizeMode="contain"
  //                 />
  //               </View>
  //               <View style={styles.heroStatTextContainer}>
  //                 <Typography variant="h4" color="primary" weight="700">1</Typography>
  //                 <Typography variant="caption" color="textSecondary" weight="600">Active Trip</Typography>
  //               </View>
  //             </View>

  //             <View style={styles.heroStatDivider} />

  //             <View style={styles.heroStatCard}>
  //               <View style={styles.heroStatIconBg}>
  //                 <Image 
  //                   source={require('@/assets/images/calendar.png')} 
  //                   style={styles.heroStatIcon}
  //                   resizeMode="contain"
  //                 />
  //               </View>
  //               <View style={styles.heroStatTextContainer}>
  //                 <Typography variant="h4" color="primary" weight="700">12</Typography>
  //                 <Typography variant="caption" color="textSecondary" weight="600">This Month</Typography>
  //               </View>
  //             </View>
  //           </View>

  //           {/* Progress Bar */}
  //           <View style={styles.heroProgressContainer}>
  //             <View style={styles.progressLabelRow}>
  //               <Typography variant="bodyMedium" color="textPrimary" weight="700" style={styles.progressLabelText}>Today's Progress</Typography>
  //               <Typography variant="caption" color="primary" weight="700">25%</Typography>
  //             </View>
  //             <View style={styles.heroProgressBar}>
  //               <View style={styles.heroProgressFill} />
  //             </View>
  //           </View>

  //           {/* Call to Action */}
  //           {/* <View style={styles.heroCtaBox}>
  //             <View style={styles.heroCtaIcon}>
  //               <Typography style={styles.heroCtaEmoji}>📍</Typography>
  //             </View>
  //             <Typography variant="bodyMedium" color="textSecondary" weight="500" style={styles.heroCtaText}>
  //               Your next trip is ready! View details to get started
  //             </Typography>
  //           </View> */}
  //         </View>
  //       </View>
  //   </View>
  // );
  // };

  const renderHeader = () => {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <View style={styles.headerWrapper}>
      <View style={styles.heroCard}>
        {/* Top Row */}
        <View style={styles.heroTopRow}>
          <View>
            <Typography style={styles.greeting}>{greeting} 👋</Typography>
            <Typography style={styles.userName}>
               Rahul Sharma
            </Typography>
          </View>

          <Image
            source={require('@/assets/images/drive.png')}
            style={styles.avatar}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Typography style={styles.statValue}>1</Typography>
            <Typography style={styles.statLabel}>Active Trip</Typography>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Typography style={styles.statValue}>12</Typography>
            <Typography style={styles.statLabel}>This Month</Typography>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Typography style={styles.progressTitle}>
              Today’s Progress
            </Typography>
            <Typography style={styles.progressPercent}>25%</Typography>
          </View>

          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
        </View>
      </View>
    </View>
  );
};

  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#F8FAFC" 
        translucent={false}
        hidden={false}
        animated={true}
      />
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Full Screen Linear Gradient Background */}
      
      
      <FlatList
        data={displayTrips}
        renderItem={renderTripCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading && displayTrips.length === 0 ? renderEmptyState : null}
        // refreshControl={
        //   <RefreshControl
        //     refreshing={refreshing}
        //     onRefresh={handleRefresh}
        //     tintColor={colors.primary}
        //     colors={[colors.primary]}
        //   />
        // }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  listContent: {
    paddingBottom: spacing.xxxl,
    zIndex: 1,
  },
  headerWrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,

  },
  heroSection: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 280,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    ...shadows.md,
  },
  heroAccent1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(37, 99, 235, 0.06)',
    top: -30,
    right: -40,
    display: 'none',
  },
  heroAccent2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    bottom: 10,
    left: -20,
    display: 'none',
  },
  heroContent: {
    padding: spacing.lg,
    position: 'relative',
    zIndex: 1,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  heroHeaderLeft: {
    flex: 1,
    marginRight: spacing.lg,
  },
  greetingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  welcomeBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    ...shadows.sm,
  },
  welcomeEmoji: {
    fontSize: 32,
  },
  heroStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  heroStatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  heroStatIconBg: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  heroStatIcon: {
    width: 20,
    height: 20,
    tintColor: colors.primary,
  },
  heroStatTextContainer: {
    gap: spacing.xs,
  },
  heroStatDivider: {
    width: 1,
    height: 45,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    marginHorizontal: spacing.md,
  },
  heroProgressContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressLabelText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  heroProgressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  heroProgressFill: {
    height: '100%',
    width: '25%',
    backgroundColor: '#10B981',
    borderRadius: borderRadius.full,
  },
  heroCtaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: spacing.sm,
  },
  heroCtaIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCtaEmoji: {
    fontSize: 20,
  },
  heroCtaText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: 16,
  },
  filterTabsContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.white,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterTabActive: {
    backgroundColor: colors.primarySoft,
    ...shadows.sm,
  },
  filterTabText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 13,
  },
  filterTabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  cardHeader: {
    backgroundColor: colors.primarySoft,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripId: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 0,
  },
  routeContainer: {
    flexDirection: 'row',
    paddingLeft: 5,
    padding: spacing.lg,
  },
  timelineContainer: {
    alignItems: 'center',
    width: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  line: {
   borderWidth:1,
   borderStyle:'dashed',
   borderColor:colors.textPrimary,
    flex: 1,
    marginVertical: spacing.sm,
  },
  locations: {
    flex: 1,
    marginLeft: spacing.md,
  },
  locationItem: {
    marginBottom: spacing.xs,
  },
  cityText: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addressText: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  gridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  gridIcon: {
    width: 18,
    height: 18,
    tintColor: colors.textSecondary,
  },
  infoText: {
    ...typography.smallMedium,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  button: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  buttonText: {
    color: colors.white,
    ...typography.smallMedium,
    fontWeight: '700',
  },
  buttonArrow: {
    width: 20,
    height: 20,
    tintColor: colors.white,
  },
  separator: {
    height: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
    paddingTop: spacing.xxxl * 2,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyIcon: {
    width: 40,
    height: 40,
    tintColor: colors.primary,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  heroCard: {
  backgroundColor: '#2563EB',
  borderRadius: 24,
  padding: 20,
  ...shadows.lg,
},

heroTopRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20,
},

greeting: {
  fontSize: 13,
  color: '#E0E7FF',
  fontWeight: '600',
  marginBottom: 4,
},

userName: {
  fontSize: 26,
  fontWeight: '800',
  color: '#FFFFFF',
},


avatar: {
  width: 50,
  height: 50,
  tintColor:'white'
},

statsRow: {
  flexDirection: 'row',
  backgroundColor: 'rgba(255,255,255,0.15)',
  borderRadius: 16,
  paddingVertical: 14,
  paddingHorizontal: 12,
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 20,
},

statBox: {
  flex: 1,
  alignItems: 'center',
},

statValue: {
  fontSize: 22,
  fontWeight: '800',
  color: '#FFFFFF',
},

statLabel: {
  fontSize: 12,
  color: '#DBEAFE',
  marginTop: 2,
},

statDivider: {
  width: 1,
  height: 40,
  backgroundColor: 'rgba(255,255,255,0.3)',
},

progressSection: {
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  padding: 14,
},

progressHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 10,
},

progressTitle: {
  fontSize: 13,
  fontWeight: '700',
  color: '#1E293B',
},

progressPercent: {
  fontSize: 13,
  fontWeight: '800',
  color: '#2563EB',
},

progressBar: {
  height: 8,
  backgroundColor: '#E5E7EB',
  borderRadius: 10,
  overflow: 'hidden',
},

progressFill: {
  height: '100%',
  width: '25%',
  backgroundColor: '#22C55E',
  borderRadius: 10,
},

});
