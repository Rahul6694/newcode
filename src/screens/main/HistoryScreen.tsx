import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Trip, TripStatus, HistoryStackParamList} from '@/types';
import {Card, StatusBadge, Typography, useToast} from '@/components';
import {colors, spacing, typography, borderRadius, shadows} from '@/theme/colors';
import {apiService} from '@/api';
import { tripApi } from '@/apiservice';

type HistoryScreenNavigationProp = StackNavigationProp<HistoryStackParamList>;

// Convert API response to Trip format
const convertApiResponseToTrip = (apiTrip: any): Trip => {
  return {
    id: apiTrip.id,
    tripNumber: apiTrip.tripNumber,
    orderNumber: apiTrip.order?.orderNumber || '',
    vehicleNumber: apiTrip.vehicle?.registrationNumber || '',
    assignedWeight: apiTrip.assignedWeight || '0',
    deliveredWeight: apiTrip.deliveredWeight || null,
    status: (apiTrip.status === 'COMPLETED' ? 'Completed' : apiTrip.status) as TripStatus,
    loadingLocation: {
      address: apiTrip.order?.loadingCity || 'Loading Location',
      coordinates: {
        latitude: 0,
        longitude: 0,
        accuracy: 10,
        timestamp: apiTrip.startTime ? new Date(apiTrip.startTime) : new Date(apiTrip.createdAt),
      },
      contactPerson: {
        name: 'Contact Person',
        phoneNumber: '0000000000',
      },
    },
    unloadingLocation: {
      address: apiTrip.order?.unloadingCity || 'Unloading Location',
      coordinates: {
        latitude: 0,
        longitude: 0,
        accuracy: 10,
        timestamp: apiTrip.endTime ? new Date(apiTrip.endTime) : new Date(apiTrip.createdAt),
      },
      contactPerson: {
        name: 'Contact Person',
        phoneNumber: '0000000000',
      },
    },
    timeline: {
      assigned: new Date(apiTrip.createdAt),
      started: apiTrip.startTime ? new Date(apiTrip.startTime) : undefined,
      loaded: apiTrip.loadingDate ? new Date(apiTrip.loadingDate) : undefined,
      completed: apiTrip.endTime ? new Date(apiTrip.endTime) : undefined,
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
  };
};

export const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const [history, setHistory] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed'>('all');
  const {showError} = useToast();

  const handleTripPress = (trip: Trip) => {
    navigation.navigate('HistoryTripDetail', {tripId: trip.id});
  };

  useEffect(() => {
    loadHistory();
  }, []);

const loadHistory = async (page: number = 1) => {
  try {
    setLoading(true);

    const response = await tripApi.getTripHistory(page, 10);


    const trips = response?.data?.trips || [];

    const convertedTrips = trips.map(convertApiResponseToTrip);
    setHistory(convertedTrips);
  } catch (error: any) {
    console.log('Load History Error:', error);
    showError(error?.response?.data?.message || 'Failed to load trip history');
    setHistory([]);
  } finally {
    setLoading(false);
  }
};



  const handleRefresh = async () => {
  setRefreshing(true);
  try {
    await loadHistory(1); 
  } finally {
    setRefreshing(false);
  }
};

  const filteredHistory = selectedFilter === 'completed'
    ? history.filter(t => t.status === 'Completed')
    : history;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateDuration = (start: Date, end: Date) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  // Custom dashed line component
  const DashedLine = () => {
    const dashCount = 8;
    const dashArray = Array.from({length: dashCount}, (_, i) => i);
    
    return (
      <View style={styles.dashedLineContainer}>
        {dashArray.map((_, index) => (
          <View key={index} style={styles.dash} />
        ))}
      </View>
    );
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
          <Typography variant="smallMedium" color="textSecondary" weight="600" style={styles.tripId}>{item.tripNumber || `#${item.id.slice(-6).toUpperCase()}`}</Typography>
          <StatusBadge status={item.status} />
      </View>

        <View style={styles.divider} />

        {/* Route Section */}
        <View style={styles.routeContainer}>
          <View style={styles.timelineContainer}>
            <View style={[styles.dot, {backgroundColor: colors.success}]} />
            <DashedLine />
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
            <Typography variant="smallMedium" color="textSecondary" weight="500" style={styles.infoText}>Docs: {item.documents.loading.length + item.documents.unloading.length > 0 ? 'Uploaded' : 'Pending'}</Typography>
        </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.button}
          onPress={() => handleTripPress(item)}
          activeOpacity={0.8}>
          <Typography variant="smallMedium" color="white" weight="700" style={styles.buttonText}>VIEW TRIP HISTORY</Typography>
          <Image 
            source={require('@/assets/images/next.png')} 
            style={styles.buttonArrow}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
  );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Trending Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerInner}>
          <View style={styles.bannerTop}>
            <View style={styles.bannerBadge}>
              <Typography variant="caption" color="white" weight="700" style={styles.bannerBadgeText}>History</Typography>
            </View>
            <View style={styles.bannerIconWrapper}>
              <Image 
                source={require('@/assets/images/history.png')} 
                style={styles.bannerIcon}
                resizeMode="contain"
              />
            </View>
          </View>
          <View style={styles.bannerContent}>
            <Typography variant="h3" color="textPrimary" weight="700" style={styles.bannerTitle}>Your Success Journey</Typography>
            <Typography variant="body" color="textSecondary" style={styles.bannerSubtitle}>
              {filteredHistory.length} successful deliveries completed with excellence
            </Typography>
            <View style={styles.bannerHighlight}>
              <Typography variant="smallMedium" color="primary" weight="700" style={styles.bannerHighlightText}>100% On-Time Delivery Rate</Typography>
            </View>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, selectedFilter === 'all' && styles.filterTabActive]}
          onPress={() => setSelectedFilter('all')}
          activeOpacity={0.7}>
          <Typography
            variant="smallMedium"
            color={selectedFilter === 'all' ? 'white' : 'textSecondary'}
            weight={selectedFilter === 'all' ? '700' : '600'}
            style={styles.filterTabText}>
            All Trips
          </Typography>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, selectedFilter === 'completed' && styles.filterTabActive]}
          onPress={() => setSelectedFilter('completed')}
          activeOpacity={0.7}>
          <Typography
            variant="smallMedium"
            color={selectedFilter === 'completed' ? 'white' : 'textSecondary'}
            weight={selectedFilter === 'completed' ? '700' : '600'}
            style={styles.filterTabText}>
            Completed
          </Typography>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Image 
          source={require('@/assets/images/trip.png')} 
          style={styles.emptyIcon}
          resizeMode="contain"
        />
      </View>
      <Typography variant="h4" color="textPrimary" weight="700" style={styles.emptyTitle}>No Trip History</Typography>
      <Typography variant="body" color="textSecondary" align="center" style={styles.emptySubtitle}>
        Your completed trips will appear here.
      </Typography>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={filteredHistory}
        renderItem={renderTripCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  banner: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  bannerInner: {
    backgroundColor: colors.primarySoft,
    padding: spacing.xl,
    position: 'relative',
  },
  bannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',

  },
  bannerBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  bannerBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  bannerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  bannerIcon: {
    width: 28,
    height: 28,
    tintColor: colors.primary,
  },
  bannerContent: {
    marginTop: spacing.xs,
  },
  bannerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
    fontSize: 22,

  },
  bannerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,

    marginBottom: spacing.md,
  },
  bannerHighlight: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
    ...shadows.sm,
  },
  bannerHighlightText: {
    ...typography.smallMedium,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    ...shadows.sm,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    ...typography.smallMedium,
  
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripId: {
    ...typography.smallMedium,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  routeContainer: {
    flexDirection: 'row',
    paddingLeft: 5,
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
  dashedLineContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
  },
  dash: {
    width: 2,
    height: 5,
    backgroundColor: colors.border,
    marginVertical: 1.5,
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
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
