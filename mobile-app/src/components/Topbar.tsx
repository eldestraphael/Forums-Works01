import {Platform, Pressable, StatusBar, StyleSheet, View} from 'react-native';
import React from 'react';
import {theme} from '../theme/theme';

import {useNavigation} from '@react-navigation/native';
import {clearCookie, clearStorage, removeData} from '../utils/localStorage';
import {Box, HStack, Image, Menu} from 'native-base';
import Text from './RNText';
import DeviceInfo from 'react-native-device-info';
import api from '../utils/api';
import {CONFIG} from '../config/config';

const Topbar = ({_, route, options, back, navigation}: any) => {
  const handleChangeForums = () => {
    navigation.navigate('Forums');
  };

  const deleteFcmToken = async () => {
    try {
      const device_id = await DeviceInfo.getUniqueId();
      const payload = {
        device_id,
      };
      const res = await api.delete('user/fcm', payload);
      console.log(res);
    } catch (error: any) {
      console.log(error?.response?.data);
    }
  };

  const logout = async () => {
    if (CONFIG.enabled.storeFcm) {
      await deleteFcmToken();
    }
    navigation.reset({
      index: 0,
      routes: [{name: 'Login'}] as any,
    });
    await Promise.all([
      removeData('authToken'),
      removeData('expiryDate'),
      clearStorage(),
      clearCookie(),
    ]);
  };

  return (
    <Box style={{backgroundColor: theme.colors.primary}} safeAreaTop={true}>
      <HStack style={styles.header}>
        <HStack alignItems="center">
          <Text style={styles.headerText}>forums@work</Text>
          <Image
            alt="icon"
            style={{width: 50, height: 50}}
            source={require('../../assets/images/appicon.png')}
          />
        </HStack>
        <HStack alignItems="center">
          <Menu
            w="190"
            style={styles.actionMenu}
            trigger={triggerProps => {
              return (
                <Pressable
                  accessibilityLabel="More options menu"
                  {...triggerProps}>
                  <Image
                    style={{width: 30, height: 30}}
                    alt="icon"
                    source={require('../../assets/images/three-dots.png')}
                  />
                </Pressable>
              );
            }}>
            <Menu.Item
              // style={styles.actionMenu}
              onPress={handleChangeForums}>
              <Text color="white">Change Forum</Text>
            </Menu.Item>
            <Menu.Item
              // style={styles.actionMenu}
              onPress={logout}>
              <Text color="white">Logout</Text>
            </Menu.Item>
          </Menu>
        </HStack>
      </HStack>
    </Box>
  );
};

export default Topbar;

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.primary,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 600,
    color: 'white',
  },
  content: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionMenu: {
    backgroundColor: theme.colors.primary,
    color: 'white',
  },
  menuItem: {
    color: 'white',
    fontSize: 15,
    fontWeight: 600,
  },
});
