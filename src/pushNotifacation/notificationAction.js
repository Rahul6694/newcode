import { useNavigation } from '@react-navigation/native';
import * as React from 'react';
import { Platform } from 'react-native';

export function navigate(stack, name, params) {
  setTimeout(() => {
    // navigationRef?.current?.navigate(stack, name, params);
  }, 1000);
}

export const notificationOpen = async notification => {
  console.log(notification, "notification====================>")
};
