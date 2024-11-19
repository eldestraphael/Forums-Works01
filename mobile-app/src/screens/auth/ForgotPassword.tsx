import {
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import React from 'react';
import Text from '../../components/RNText';
import {StatusBar} from 'native-base';
import CustomTextField from '../../components/textfield';
import LoadingButton from '../../components/loaderButton';
import HyperlinkText from '../../components/hypertext';
import api from '../../utils/api';
import _ from 'lodash';
import {ApiResponse} from '../../model/base';
import {RequestReset} from '../../model/resetPassword';
import Toast from 'react-native-simple-toast';
import {
  doesObjectContainsEmptyValues,
  isNestedObjectEmpty,
  validateEmail,
} from '../../utils/helpers';

const loginBackground = require('../../../assets/images/background.png');
const icon = require('../../../assets/images/appicon.png');

const ForgotPassword = ({navigation}: any) => {
  const [toggle, setToggle] = React.useState<'request' | 'reset' | 'success'>(
    'request',
  );

  const [loading, setLoading] = React.useState(false);

  const [errors, setErrors] = React.useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
  });

  const [resetRequestData, setResetRequestData] = React.useState({
    email: '',
  });

  const [resetData, setResetData] = React.useState({
    email: '',
    uuid: '',
    otp: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (name: string, text: string) => {
    setErrors(prev => ({
      ...prev,
      [name]: '',
    }));
    if (toggle === 'request') {
      setResetRequestData({
        email: text,
      });
    } else {
      setResetData(prev => {
        return {
          ...prev,
          [name]: text,
        };
      });
    }
  };

  const validateFields = (name: string, value: string) => {
    let error = '';
    if (name === 'otp') {
      if (value.trim() === '') {
        error = 'OTP is required';
      } else if (value.length < 6) {
        error = 'Please enter a valid 6-digit OTP';
      }
    } else if (name === 'email') {
      if (value.trim() === '') {
        error = 'Email is required';
      } else {
        const isValidEmail = validateEmail(value);
        error = !isValidEmail ? 'Please enter a valid email' : '';
      }
    } else if (name === 'confirmPassword') {
      if (value.trim() === '') {
        error = 'Confirm password is required';
      } else {
        const isValid = value === resetData.password;
        error = !isValid ? 'Password doesnt match' : '';
      }
    } else {
      const formattedName = name
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .toLowerCase()
        .replace(/^./, (str: any) => str.toUpperCase());
      error = value.trim() === '' ? `${formattedName} is required` : '';
    }
    setErrors({...errors, [name]: error});
    console.log(error);
    return error;
  };

  const handleResetRequest = async () => {
    const error = validateFields('email', resetRequestData.email);
    if (!_.isEmpty(error)) {
      return;
    }
    try {
      setLoading(true);
      const {data} = await api.post<ApiResponse<RequestReset>>(
        `auth/request-reset-password`,
        resetRequestData,
      );
      if (data.reset_info) {
        setResetData({
          uuid: data.reset_info.uuid,
          email: data.reset_info.email,
          otp: '',
          password: '',
          confirmPassword: '',
        });
        setToggle('reset');
      }
    } catch (error: any) {
      Toast.show(error?.response?.data?.message || 'Something went wrong!', 5);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    let isError = false;
    const fieldErrors = _.mapValues(
      _.omit(resetData, ['uuid']),
      (value, key) => {
        const isValid = validateFields(key, value);
        return isValid;
      },
    );
    setErrors(fieldErrors);
    if (!isNestedObjectEmpty(fieldErrors)) {
      return;
    }
    const payload = _.omit(resetData, ['confirmPassword']);
    try {
      setLoading(true);
      const {data, message} = await api.post<ApiResponse<RequestReset>>(
        `auth/set-new-password`,
        payload,
      );
      if (data.reset_info) {
        Toast.show('Password reset successfully', 5);
        navigation.goBack('Login');
      }
    } catch (error: any) {
      Toast.show(error?.response?.data?.message || 'Something went wrong!', 5);
      console.log(error.response.data);
    } finally {
      setLoading(false);
    }
  };

  const backToLogin = () => {
    console.log('Go back to Login');
    navigation.goBack('Login');
  };

  return (
    <SafeAreaView>
      <StatusBar animated={true} backgroundColor="#2a2f42" />
      <ImageBackground source={loginBackground} style={styles.imageBackground}>
        <View style={styles.view}>
          {toggle === 'request' ? (
            <View style={styles.box}>
              <View style={styles.loginContent}>
                <Text style={styles.loginText}>Request Password Reset</Text>
                <View style={styles.border}></View>
              </View>
              <View style={{paddingHorizontal: 20}}>
                <Text color="gray.500">
                  Please enter your email address below and we'll send you
                  instructions to reset your password.
                </Text>
              </View>
              <CustomTextField
                id="email"
                value={resetRequestData.email}
                title="USERNAME / EMAIL"
                placeholder="your email address"
                error={errors.email}
                onChangeText={text => handleChange('email', text)}
              />
              <HyperlinkText onPress={backToLogin}>Back to Login</HyperlinkText>
              <View style={{paddingTop: 20}}>
                <LoadingButton
                  text="Send Request"
                  onPress={handleResetRequest}
                  isLoading={loading}
                  disabled={doesObjectContainsEmptyValues(resetRequestData)}
                />
              </View>
            </View>
          ) : toggle === 'reset' ? (
            <View style={styles.box}>
              <View style={styles.loginContent}>
                <Text style={styles.loginText}>Reset Password</Text>
                <View style={styles.border}></View>
              </View>
              <CustomTextField
                title="USERNAME / EMAIL"
                placeholder="your email address"
                value={resetData.email}
                disabled
                error={errors.email}
              />
              <CustomTextField
                title="OTP"
                placeholder="your OTP"
                value={resetData.otp}
                onChangeText={text => handleChange('otp', text)}
                error={errors.otp}
              />
              <CustomTextField
                title="NEW PASSWORD"
                placeholder="your new password"
                value={resetData.password}
                onChangeText={text => handleChange('password', text)}
                error={errors.password}
              />
              <CustomTextField
                title="CONFIRM PASSWORD"
                placeholder="your confirm password"
                value={resetData.confirmPassword}
                onChangeText={text => handleChange('confirmPassword', text)}
                error={errors.confirmPassword}
              />
              <HyperlinkText onPress={backToLogin}>Back to Login</HyperlinkText>
              <View style={{paddingTop: 20}}>
                <LoadingButton
                  text="Reset"
                  onPress={handleReset}
                  isLoading={loading}
                  disabled={doesObjectContainsEmptyValues(resetData)}
                />
              </View>
            </View>
          ) : (
            <View style={styles.box}>
              <Text>Success</Text>
              <HyperlinkText onPress={backToLogin}>Back to Login</HyperlinkText>
            </View>
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
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
