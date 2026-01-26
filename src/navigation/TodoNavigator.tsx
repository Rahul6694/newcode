import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {StatusBar} from 'react-native';
import {TodoScreen} from '@/screens/main/TodoScreen';
import {TripDetailScreen} from '@/screens/main/TripDetailScreen';
// import {DocumentUploadScreen} from '@/screens/main/DocumentUploadScreen';
import {LocationMarkScreen} from '@/screens/main/LocationMarkScreen';
import {TripInProgressScreen} from '@/screens/main/TripInProgressScreen';
import {MarkCompleteScreen} from '@/screens/main/MarkCompleteScreen';
import {TodoStackParamList} from '@/types';
import {colors, typography} from '@/theme/colors';

const Stack = createStackNavigator<TodoStackParamList>();

export const TodoNavigator: React.FC = () => {
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
        headerTintColor: colors.primaryLight,
        headerBackTitleVisible: false,
      }}>
      <Stack.Screen
        name="TodoList"
        component={TodoScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="TripDetail"
        component={TripDetailScreen}
        options={{headerShown: false}}
      />
      {/* <Stack.Screen
        name="DocumentUpload"
        component={DocumentUploadScreen}
        options={{headerShown: false}}
      /> */}
      <Stack.Screen
        name="LocationMark"
        options={{headerShown: false}}
        component={LocationMarkScreen}
      
      />
      <Stack.Screen
        name="TripInProgress"
        component={TripInProgressScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="MarkComplete"
        component={MarkCompleteScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
    </>
  );
};