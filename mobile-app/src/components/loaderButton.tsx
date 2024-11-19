
import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { View } from 'native-base';

interface LoadingButtonProps {
  text?: string;
  onPress?: () => void | Promise<void>;
  isLoading?:boolean
  children?: any
  disabled?: boolean;
  style?: ViewStyle
}

const LoadingButton: React.FC<LoadingButtonProps> = ({ text, onPress,isLoading, children, disabled, style }) => {

  
  const handlePress = async () => {
    try {
      if(!onPress) {
        return;
      }
      await onPress();
    } catch(e) {
    }
  };
  const bgColor = disabled ? 'gray' : '#2a2f42'

  return (
    <TouchableOpacity  style={{...styles.button, backgroundColor: bgColor, ...style }} onPress={!disabled && !isLoading ? handlePress : () => {}} disabled={isLoading}>
      {isLoading ? <ActivityIndicator size="small" color="#FFF" /> : children ? children :  <Text style={styles.text}>{children || text}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2a2f42',

    width:"40%",
    marginBottom:25,
    paddingVertical:10,
    borderRadius: 2,
    alignSelf:"center",
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFF',
    fontSize: 16,
  },
});

export default LoadingButton;
