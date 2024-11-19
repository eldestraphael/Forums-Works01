import React from 'react';
import {
  View,
  ViewStyle,
  Image,
  ImageStyle,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
  StyleProp,
  ColorValue,
} from 'react-native';

export interface IconProps {
  source: ImageSourcePropType;
  style?: ImageStyle | ImageStyle[];
  containerStyle?: ViewStyle;
  onPress?: () => void;
  size?: number;
  color?: ColorValue;
}

export function PngIcon(props: IconProps) {
  const {
    style: styleOverride,
    source,
    color,
    containerStyle,
    onPress,
    size,
  } = props;
  const imgSize = size ? {width: size, height: size} : {};
  const style: StyleProp<ImageStyle> = {
    ...styles.container,
    tintColor: color,
    ...styleOverride,
    ...imgSize,
  };

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={containerStyle}>
        <Image alt="icon" style={style} source={source} />
      </TouchableOpacity>
    );
  } else {
    return (
      <View style={containerStyle}>
        <Image alt="icon" style={style} source={source} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    resizeMode: 'contain',
  },
});
