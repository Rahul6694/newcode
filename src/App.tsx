import React, {useEffect} from 'react';
import {StatusBar, Platform} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';


import {AppNavigator} from '@/navigation/AppNavigator';
import {ToastProvider} from '@/components';
import {colors} from '@/theme/colors';


import SplashScreen from 'react-native-splash-screen';
import { MainNavigator } from './navigation/MainNavigator';
import { AuthNavigator } from './navigation/AuthNavigator';
import { Provider } from 'react-redux';
import { store } from './redux/store';

// Inner App Component with Redux hooks
const AppContent: React.FC = () => {


  useEffect(() => {
    SplashScreen.hide();

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
          <AppNavigator/>
          </Provider>
        </NavigationContainer>
      </ToastProvider>
    </>
  );
};

// Main App Component with Redux Provider
const App: React.FC = () => {
  return (
   
        <AppContent />
     
  );
};

export default App;