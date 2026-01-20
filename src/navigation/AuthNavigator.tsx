import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {LoginScreen} from '@/screens/auth/LoginScreen';
import {ForgotPasswordScreen} from '@/screens/auth/ForgotPasswordScreen';
import {ResetPasswordScreen} from '@/screens/auth/ResetPasswordScreen';
import {AuthStackParamList} from '@/types';
import {colors, typography} from '@/theme/colors';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.background, elevation: 0, shadowOpacity: 0},
        headerTitleStyle: {...typography.h4, color: colors.textPrimary},
        headerTintColor: colors.primary,
        headerBackTitleVisible: false,
      }}>
      <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
      <Stack.Screen
        name="ForgotPassword"
        options={{headerShown: false}}
        component={ForgotPasswordScreen}
    
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};