import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Image} from 'native-base';

const NoDataFound = () => {
  return (
    <View style={styles.container}>
      <Image
        alt="icon"
        style={{width: '100%', height: '50%'}}
        source={require('../../../assets/images/no-data.png')}
      />
      <Text>No data</Text>
    </View>
  );
};

export default NoDataFound;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
});
