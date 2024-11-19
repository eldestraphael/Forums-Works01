import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Image, StatusBar, StyleSheet} from 'react-native';
import {
  clearCookie,
  getForumInfo,
  getSessionToken,
} from '../utils/localStorage';
import {useAppDispatch} from '../store/hooks';
import {setForumInfo} from '../store/slices/appDataSlice';
import api from '../utils/api';
import {ForumInfo} from '../model/forums';
import _ from 'lodash';

const splashImage = require('../../assets/images/splash.png');

type RootStackParamList = {
  Login: undefined; // Define the parameter types for your routes here
  Home: undefined;
  // Add other routes as needed
};

export default function Splash() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  type HomeScreenNavigationProp = NavigationProp<
    RootStackParamList,
    'Login',
    'Home'
  >;
  const dispatch = useAppDispatch();

  const getNavigateTo = async () => {
    const {token} = await getSessionToken();
    if (_.isEmpty(token)) {
      await clearCookie();
      return 'Login';
    }
    try {
      await api.get('auth/session');
      const forumInfo = await getForumInfo();
      if (forumInfo?.uuid) {
        const response: any = await api.get(
          `admin/forum?uuid=${forumInfo.uuid}`,
        );
        if (response.data) {
          dispatch(setForumInfo(response.data.forum_info));
          return 'Home';
        }
      }
    } catch (error) {
      console.log(error);
    }
    return 'Forums';
  };

  const navigateTo = async () => {
    const key = await getNavigateTo();
    navigation.reset({
      index: 0,
      routes: [{name: key as any}],
    });
  };

  useEffect(() => {
    navigateTo();
  }, []);

  return (
    <>
      <StatusBar animated={true} backgroundColor="#fff" />
      <Image alt="icon" source={splashImage} style={splashscreenStyle.image} />
    </>
  );
}

const splashscreenStyle = StyleSheet.create({
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
