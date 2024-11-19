import React, {useCallback, useState} from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  Linking,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import CustomTextField from '../../components/textfield';
import LoadingButton from '../../components/loaderButton';
import api from '../../utils/api';
import Toast from 'react-native-simple-toast';
import HyperlinkText from '../../components/hypertext';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useMutation, useQuery} from '@tanstack/react-query';
import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
import {staticLinks} from '../../constants/app';
import {CONFIG} from '../../config/config';

const loginBackground = require('../../../assets/images/background.png');
const icon = require('../../../assets/images/appicon.png');

type RootStackParamList = {
  Home: undefined;
  Forums: undefined;
  ForgotPassword: undefined;
};

type HomeScreenNavigationProp = NavigationProp<RootStackParamList, 'Home'>;

export default function Login() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [queryEnabled, setQueryEnabled] = useState(false);

  const getToken = async () => {
    const token = await messaging().getToken();
    console.log('Firebase Token= ', token);
    return token;
  };

  const storeFcm = async () => {
    try {
      const fcm_token = await getToken();
      const device_id = await DeviceInfo.getUniqueId();
      const deviceName = DeviceInfo.getSystemName();
      const deviceModel = DeviceInfo.getModel();
      const payload = {
        fcm_token,
        device_id,
        device_meta: {
          name: deviceName,
          model: deviceModel,
        },
      };
      const res = await api.post('user/fcm', payload);
      console.log(res);
    } catch (error: any) {
      console.log(error?.response?.data);
    }
  };

  const loginCheck = async () => {
    const data = await api.fetchCSRFToken({
      email: username,
      password: password,
    });
    return data;
  };

  const {mutate, isPending: isLoading} = useMutation({
    mutationFn: loginCheck,
    onSuccess: async data => {
      if (!data) {
        Toast.show('Email or Password was incorrect', 5);
        return;
      }
      navigation.reset({
        index: 0,
        routes: [{name: 'Forums'}],
      });
      try {
        if (CONFIG.enabled.storeFcm) {
          await storeFcm();
        }
      } catch (error) {
        console.warn('Failed to store FCM token');
      }
    },
    onError: data => {
      Toast.show('Email or Password was incorrect', 5);
    },
  });

  const validateEmail = () => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(username);
  };

  const onLoginClick = useCallback(async () => {
    if (username.length === 0) {
      Toast.show('Please enter a email', 5);
      return;
    }
    if (!validateEmail()) {
      Toast.show('Please enter a valid email', 5);
      return;
    }

    if (password.length === 0) {
      Toast.show('Please enter a password', 5);
      return;
    }
    mutate();
  }, [username, password]);

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const openLinks = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView>
      <StatusBar animated={true} backgroundColor="#2a2f42" />
      <ImageBackground
        source={loginBackground}
        style={loginStyle.imageBackground}>
        <View style={loginStyle.view}>
          <View style={loginStyle.headerTitle}>
            <Text style={loginStyle.headerTitleText}>forums@work</Text>
            <Image alt="icon" style={loginStyle.headerIcon} source={icon} />
          </View>
          <View style={loginStyle.box}>
            <View style={loginStyle.loginContent}>
              <Text style={loginStyle.loginText}>Log In</Text>
              <View style={loginStyle.border}></View>
            </View>
            <CustomTextField
              title="USERNAME / EMAIL"
              placeholder="your email address"
              onChangeText={text => setUsername(text)}
            />
            <CustomTextField
              title="PASSWORD"
              placeholder="a Password"
              onChangeText={text => setPassword(text)}
            />
            <HyperlinkText onPress={handleForgotPassword}>
              Reset Password
            </HyperlinkText>
            <View style={{paddingTop: 20}}>
              <LoadingButton
                text="Sign In"
                disabled={username === '' || password === ''}
                onPress={onLoginClick}
                isLoading={isLoading}
              />
            </View>
            <View style={{paddingHorizontal: 20, paddingBottom: 20}}>
              <Text style={loginStyle.tnc}>
                By signing into this application you agree to the{' '}
                <Text
                  onPress={() => openLinks(staticLinks.PRIVACY_POLICY)}
                  style={{color: '#7b93cc', textDecorationLine: 'underline'}}>
                  privacy policy
                </Text>{' '}
                and the{' '}
                <Text
                  onPress={() => openLinks(staticLinks.TnC)}
                  style={{color: '#7b93cc', textDecorationLine: 'underline'}}>
                  terms and conditions
                </Text>{' '}
                of Forums@Work
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const loginStyle = StyleSheet.create({
  tnc: {
    fontSize: 12,
    color: '#AAAAAA',
  },
  view: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    height: '100%',
    alignContent: 'center',
    justifyContent: 'center',
  },
  imageBackground: {
    width: '100%',
    height: '100%',
  },
  box: {
    width: '90%',
    backgroundColor: 'white',
    // height: 350,
    borderRadius: 10,
    elevation: 5,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerTitle: {flexDirection: 'row', alignItems: 'center', marginBottom: 12},
  headerTitleText: {fontSize: 30, color: 'white'},
  headerIcon: {width: 65, height: 65},
  loginContent: {alignItems: 'center', marginTop: 12},
  loginText: {fontSize: 22, color: '#2c303b'},
  border: {
    width: 30,
    height: 5,
    backgroundColor: '#6688db',
    borderRadius: 2,
    marginTop: 5,
    marginBottom: 10,
  },
});
