import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {ProfileScreen} from '@/screens/main/ProfileScreen';

import {ProfileStackParamList} from '@/types';
import {colors, typography} from '@/theme/colors';

const Stack = createStackNavigator<ProfileStackParamList>();

export const ProfileNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.white, elevation: 0, shadowOpacity: 0},
        headerTitleStyle: {...typography.h4, color: colors.textPrimary},
        headerTintColor: colors.primaryLight,
        headerBackTitleVisible: false,
      }}>
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{headerShown: false}}
      />
     
    </Stack.Navigator>
  );
};
