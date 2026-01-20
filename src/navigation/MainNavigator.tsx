import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View, StyleSheet, Platform, Image, ImageSourcePropType, Text, Animated} from 'react-native';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {TodoNavigator} from './TodoNavigator';
import {ProfileNavigator} from './ProfileNavigator';
import {HistoryNavigator} from './HistoryNavigator';
import {MainTabParamList} from '@/types';
import {colors, spacing, borderRadius, shadows} from '@/theme/colors';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Icon mapping
const iconMap = {
  trips: require('@/assets/images/journey.png'),
  history: require('@/assets/images/file.png'),
  profile: require('@/assets/images/profile.png'),
};

// Custom Icon Component with Modern Design
const TabIcon: React.FC<{
  iconSource: ImageSourcePropType;
  focused: boolean;
  label: string;
}> = ({iconSource, focused, label}) => {
  return (
    <View style={styles.iconContainer}>
      <View
        style={[
          styles.iconWrapper,
          focused && styles.iconWrapperActive,
        ]}>
        <Image
          source={iconSource}
          style={[
            styles.iconImage,
            focused ? styles.iconImageActive : styles.iconImageInactive,
          ]}
          resizeMode="contain"
        />
      </View>
      <Text
        style={[
          styles.labelText,
          focused && styles.labelTextActive,
        ]}>
        {label}
      </Text>
    </View>
  );
};

export const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}
      initialRouteName="TODO">
      <Tab.Screen
        name="TODO"
        component={TodoNavigator}
        options={({route}) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'TodoList';
          const hideTabBarScreens = ['TripDetail', 'TripInProgress', 'MarkComplete', 'LocationMark'];
          return {
            tabBarStyle: hideTabBarScreens.includes(routeName) ? {display: 'none'} : styles.tabBar,
            tabBarIcon: ({focused}) => (
              <TabIcon iconSource={iconMap.trips} focused={focused} label="Trips" />
            ),
          };
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryNavigator}
        options={({route}) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'HistoryList';
          const hideTabBarScreens = ['HistoryTripDetail'];
          return {
            tabBarStyle: hideTabBarScreens.includes(routeName) ? {display: 'none'} : styles.tabBar,
            tabBarIcon: ({focused}) => (
              <TabIcon iconSource={iconMap.history} focused={focused} label="History" />
            ),
          };
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon iconSource={iconMap.profile} focused={focused} label="Profile" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl + 8 : spacing.lg,
    paddingHorizontal: spacing.md,
    height: Platform.OS === 'ios' ? 100 : 80,
    width: '80%',
    alignSelf: 'center',
    marginBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
    borderTopLeftRadius: 90,
    borderTopRightRadius: 90,
    borderBottomLeftRadius: 90,
    borderBottomRightRadius: 90,
    overflow: 'hidden',
    ...shadows.sm,
    elevation: 15,
    position:'absolute',
  left:'10%',
  right:'10%',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',

  },
  iconWrapperActive: {
    backgroundColor: colors.primarySoft,
    ...shadows.md,
  },
  iconImage: {
    width: 24,
    height: 24,
  },
  iconImageInactive: {
    tintColor: colors.textSecondary,
  },
  iconImageActive: {
    tintColor: colors.primary,
    width: 26,
    height: 26,
  },
  labelText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  labelTextActive: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
