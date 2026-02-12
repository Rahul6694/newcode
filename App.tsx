// import App from './src/App';

// export default App;

import React, { useEffect } from 'react';
import { StatusBar, Platform, PermissionsAndroid } from 'react-native';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { AppNavigator } from '@/navigation/AppNavigator';
import { ToastProvider } from '@/components';
import SplashScreen from 'react-native-splash-screen';
import { Provider } from 'react-redux';

import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from '@/redux/store';
import { fcmService } from '@/pushNotifacation/FMCService';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { localNotificationService } from '@/pushNotifacation/LocalNotificationService';


const AppContent: React.FC = () => {
useEffect(() => {
  const timer = setTimeout(() => {
    SplashScreen.hide();
  }, 3000);

  return () => clearTimeout(timer);
}, []);




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
    fcmService.registerAppWithFCM();
    fcmService.register(onRegister, onNotification, onOpenNotification);

    localNotificationService.configure(onOpenNotification);

    function onRegister(token) { }

    function onNotification(notify) {
      localNotificationService.showlocalNotification(
        'channel-id',
        Platform.OS === 'ios' ? notify.message : notify.title,
        notify.body,
        notify,
      );
    }

    function onOpenNotification(notify, data) {
      console.log('[App] onOpenNotification: ', notify);
    }
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
          <Provider store={store}>
              <PersistGate loading={null} persistor={persistor}>
            <AppNavigator />
            </PersistGate>
          </Provider>
        </NavigationContainer>
      </ToastProvider>
    </>
  );
};


const App: React.FC = () => {
  return (

    <AppContent />

  );
};

export default App;