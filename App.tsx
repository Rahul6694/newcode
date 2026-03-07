// import App from './src/App';

// export default App;

import { ToastProvider } from '@/components';
import { AppNavigator } from '@/navigation/AppNavigator';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { PermissionsAndroid, Platform, StatusBar } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import { Provider, useSelector } from 'react-redux';

import strings from '@/localization/strings';
import { fcmService } from '@/pushNotifacation/FMCService';
import { localNotificationService } from '@/pushNotifacation/LocalNotificationService';
import { persistor, RootState, store } from '@/redux/store';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { PersistGate } from 'redux-persist/integration/react';


const AppContent: React.FC = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hide();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const lang = useSelector((state: RootState) => state.auth.lang);

  useEffect(() => {
    strings.setLanguage(lang); // Apply saved language on app start
  }, [lang]);



  const requestNotificationPermissions = async () => {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.requestPermissions();
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn('Notification permission denied');
      }
    }
  };

  useEffect(() => {
    requestNotificationPermissions()
    // register FCM listeners once at app root
    fcmService.registerAppWithFCM();
    fcmService.register();

    // configure local notification callbacks (if any)
    localNotificationService.configure();
  }, []);

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1E293B"
        translucent={false}
      />
      <ToastProvider>
        <NavigationContainer>

          <AppNavigator />

        </NavigationContainer>
      </ToastProvider>
    </>
  );
};


const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>

  );
};

export default App;