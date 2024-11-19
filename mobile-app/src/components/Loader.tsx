import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {ActivityIndicator} from 'react-native';
import {theme} from '../theme/theme';

const Loader = () => {
  return (
    <View style={styles.loader}>
      <ActivityIndicator animating={true} color={theme.colors.primary} />
    </View>
  );
};

export default Loader;

const styles = StyleSheet.create({
  loader: {
    top: '30%',
  },
});
