import {StyleSheet, View} from 'react-native';
import React from 'react';
import { getProgressColor } from '../utils/helpers';

const CircleIcon = ({score}: {score: number}) => {
  const circleColor = getProgressColor(score)
  return <View style={{...styles.circle, backgroundColor: circleColor}}></View>;
};

export default CircleIcon;

const styles = StyleSheet.create({
  circle: {
    width: 15,
    height: 15,
    borderRadius: 15 / 2,
  },
});
