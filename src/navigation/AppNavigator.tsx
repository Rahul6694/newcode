import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { RootStackParamList } from '@/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  // Get token from Redux
  const tokenAuth = useSelector((state: RootState) => state.auth.token);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {tokenAuth ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};
