import React from 'react';
import Splash from './src/screens/splash';
import Index from './src/navigation/navigator';
import {Appearance, Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {
  check,
  Permission,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';

function App(): React.JSX.Element {
  React.useEffect(() => Appearance.setColorScheme('light'), []);

  const requestNotificationPermission = async (permission: Permission) => {
    const result = await request(permission);
    return result;
  };

  const checkNotificationPermission = async (permission: Permission) => {
    const result = await check(permission);
    return result;
  };

  async function requestUserPermission() {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (enabled) {
        console.log('Authorization status:', authStatus);
      }
    }
    if (Platform.OS === 'android') {
      const checkPermission = await checkNotificationPermission(
        PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
      );
      if (checkPermission !== RESULTS.GRANTED) {
        const request = await requestNotificationPermission(
          PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
        );
        if (request !== RESULTS.GRANTED) {
          return;
        }
      }
    }
  }

  const getToken = async () => {
    try {
      const token = await messaging().getToken();
      
      console.log('Firebase Token= ', token);
    } catch (error) {
      console.log(error)
    }
  };

  React.useEffect(() => {
    requestUserPermission();
    getToken();
  }, []);

  return <Index />;
}

export default App;
