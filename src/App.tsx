import React, { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from '@/navigation/AppNavigator';
import { ToastProvider } from '@/components';
import SplashScreen from 'react-native-splash-screen';
import { Provider } from 'react-redux';
import { persistor, store } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';


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
              <PersistGate loading={null} persistor={persistor}>
            <AppNavigator />
            </PersistGate>
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