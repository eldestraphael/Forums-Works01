import {StyleSheet, Text, View, ViewStyle} from 'react-native';
import React from 'react';
interface Card {
  children: any;
  style?: ViewStyle;
}
const Card = ({children, style}: Card) => {
  return <View style={{...styles.card, ...style}}>{children}</View>;
};

export default Card;

const styles = StyleSheet.create({
  card: {
    padding: 15,
    borderColor: '#e0e0e0',
    borderWidth: 0.5,
    borderRadius: 10,
    gap: 10,
  },
});
