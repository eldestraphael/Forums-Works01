import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {default as RNWebview} from 'react-native-webview';
import MaterialIconsCommunity from 'react-native-vector-icons/MaterialIcons';

const Webview = ({navigation, route}: any) => {
  const {url} = route.params;
  return (
    <View style={{flex: 1}}>
      <SafeAreaView />
      <View style={{padding: 20}}>
        <MaterialIconsCommunity
          name="arrow-back-ios"
          size={20}
          onPress={() => navigation.goBack()}></MaterialIconsCommunity>
      </View>
      <View style={{flex: 1}}>
        <RNWebview source={{uri: url}} javaScriptEnabled={true} />
      </View>
    </View>
  );
};

export default Webview;

const styles = StyleSheet.create({});
