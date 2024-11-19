import {StyleSheet, TextStyle} from 'react-native';
import React from 'react';
import {Text as NBText} from 'native-base';
import {
  ColorType,
  ResponsiveValue,
} from 'native-base/lib/typescript/components/types';
interface RNText {
  children: any;
  color?: ColorType;
  weight?: ResponsiveValue<
    | number
    | (string & {})
    | 'bold'
    | 'hairline'
    | 'thin'
    | 'light'
    | 'normal'
    | 'medium'
    | 'semibold'
    | 'extrabold'
    | 'black'
    | 'extraBlack'
  >;
  size?: ResponsiveValue<
    | number
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | (string & {})
    | '2xs'
    | 'xs'
    | '3xl'
    | '4xl'
    | '5xl'
    | '6xl'
    | '7xl'
    | '8xl'
    | '9xl'
  >;
  style?: TextStyle;
}

const Text = ({children, color, weight, style, size}: RNText) => {
  return (
    <NBText
      fontSize={size}
      fontWeight={weight}
      color={color}
      style={{flexShrink: 1, ...style}}>
      {children}
    </NBText>
  );
};

export default Text;

const styles = StyleSheet.create({});
