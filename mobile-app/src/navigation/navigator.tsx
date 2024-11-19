import * as React from 'react';

import {
  createNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Splash from '../screens/splash';
import Login from '../screens/auth/login';
import Home from '../screens/home/home';
import Topbar from '../components/Topbar';
import Forums from '../screens/forums/Forums';
import {
  QueryClient,
  QueryClientConfig,
  QueryClientProvider,
} from '@tanstack/react-query';
import {NativeBaseProvider} from 'native-base';
import {ZoomVideoSdkProvider} from '@zoom/react-native-videosdk';
import {Provider} from 'react-redux';
import {store} from '../store/reduxStore';
import {CONFIG} from '../config/config';
import ForgotPassword from '../screens/auth/ForgotPassword';
const config: QueryClientConfig = {};
const queryClient = new QueryClient(config);

export const navigationRef = createNavigationContainerRef();

const Index = () => {
  const Stack = createNativeStackNavigator();

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <NativeBaseProvider>
          <NavigationContainer ref={navigationRef}>
            <ZoomVideoSdkProvider
              config={{
                appGroupId: CONFIG.zoom.groupId,
                domain: CONFIG.zoom.domain,
                enableLog: true,
              }}>
              <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{
                  header: props => <Topbar {...props} />,
                }}>
                <Stack.Screen
                  name="Splash"
                  component={Splash}
                  options={{headerShown: false, animation: 'flip'}}
                />
                <Stack.Screen
                  name="Login"
                  component={Login}
                  options={{headerShown: false, animation: 'flip'}}
                />
                <Stack.Screen
                  name="ForgotPassword"
                  component={ForgotPassword}
                  options={{headerShown: false, animation: 'flip'}}
                />
                <Stack.Screen
                  name="Home"
                  component={Home}
                  options={{headerShown: true, animation: 'flip'}}
                />
                <Stack.Screen
                  name="Forums"
                  component={Forums}
                  options={{headerShown: true, animation: 'flip'}}
                />
              </Stack.Navigator>
            </ZoomVideoSdkProvider>
          </NavigationContainer>
        </NativeBaseProvider>
      </Provider>
    </QueryClientProvider>
  );
};

export default Index;
