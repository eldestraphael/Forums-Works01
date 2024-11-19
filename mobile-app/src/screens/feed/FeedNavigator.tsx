import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Feed from './Feed';
import ShareStory from '../Stories/ShareStory';
import PdfModal from './components/PdfModal';
import JoinOffline from '../../components/JoinOffline';
import Survey from '../survey/Survey';
import ZoomMeeting from '../zoom/ZoomMeeting';
import Webview from '../Webview/Webview';

const FeedNavigator = () => {
  const Stack = createStackNavigator();

  return (
    <Stack.Navigator
      initialRouteName="FeedScreen"
      detachInactiveScreens
      screenOptions={{
        detachPreviousScreen: true,
        freezeOnBlur: true,
      }}>
      <Stack.Screen
        name="FeedScreen"
        component={Feed}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ShareStory"
        component={ShareStory}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PdfViewer"
        component={PdfModal}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Survey"
        component={Survey}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ZoomMeeting"
        component={ZoomMeeting}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="JoinOffline"
        component={JoinOffline}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Webview"
        component={Webview}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default FeedNavigator;
