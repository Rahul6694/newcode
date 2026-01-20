import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {StatusBar} from 'react-native';
import {HistoryScreen} from '@/screens/main/HistoryScreen';
import {HistoryTripDetailScreen} from '@/screens/main/HistoryTripDetailScreen';
import {HistoryStackParamList} from '@/types';
import {colors, typography} from '@/theme/colors';

const Stack = createStackNavigator<HistoryStackParamList>();

export const HistoryNavigator: React.FC = () => {
  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#F8FAFC" 
        translucent={false}
        hidden={false}
        animated={true}
      />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: colors.background, elevation: 0, shadowOpacity: 0},
          headerTitleStyle: {...typography.h4, color: colors.textPrimary},
          headerTintColor: colors.primary,
          headerBackTitleVisible: false,
        }}>
        <Stack.Screen
          name="HistoryList"
          component={HistoryScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="HistoryTripDetail"
          component={HistoryTripDetailScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </>
  );
};
