import React, {useEffect, useState} from 'react';
import api from '../../utils/api';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {Momentum} from '../momentum/Momentum';
import Feed from '../feed/Feed';
import Info from '../info/Info';
import {Platform, SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import {theme} from '../../theme/theme';
import {Image} from 'native-base';
import ShareStory from '../Stories/ShareStory';
import FeedNavigator from '../feed/FeedNavigator';

function HomeScreen() {
  const Tab = createMaterialBottomTabNavigator();
  const containerHeight = Platform.OS === 'ios' ? 100 : 'auto';
  return (
    <>
      <StatusBar animated={true} backgroundColor={theme.colors.primary} />
      <Tab.Navigator
        inactiveColor="white"
        activeColor="rgb(90,113,186)"
        initialRouteName="Momentum"
        barStyle={{
          backgroundColor: theme.colors.primary,
          height: containerHeight,
        }}
        activeIndicatorStyle={styles.indicator}>
        <Tab.Screen
          options={{
            tabBarIcon: ({color}) => {
              return (
                <Image
                  style={{width: 24, height: 24, tintColor: color}}
                  color={color}
                  alt="icon"
                  source={require('../../../assets/images/momentum.png')}></Image>
              );
            },
          }}
          name="Momentum"
          component={Momentum}
        />
        <Tab.Screen
          options={{
            tabBarIcon: ({color}) => {
              return (
                <Image
                  style={{width: 24, height: 24, tintColor: color}}
                  color={color}
                  alt="icon"
                  source={require('../../../assets/images/feed.png')}></Image>
              );
            },
          }}
          name="Feed"
          component={FeedNavigator}
        />
        <Tab.Screen
          options={{
            tabBarIcon: ({color}) => {
              return (
                <Image
                  style={{width: 24, height: 24, tintColor: color}}
                  color={color}
                  alt="icon"
                  source={require('../../../assets/images/info.png')}></Image>
              );
            },
          }}
          name="Info"
          navigationKey="Info"
          component={Info}
        />
      </Tab.Navigator>
    </>
  );
}

export default function Home() {
  return Platform.OS === 'android' ? (
    <SafeAreaView style={{backgroundColor: theme.colors.primary, flex: 1}}>
      <HomeScreen />
    </SafeAreaView>
  ) : (
    <HomeScreen />
  );
}

const styles = StyleSheet.create({
  indicator: {
    backgroundColor: 'transparent',
    color: 'rgb(90,113,186)',
  },
});
