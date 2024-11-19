import React from 'react'
import { Text, TextProps, TextStyle } from 'react-native'


interface CustomTextProps {
    textStyle: TextStyle;
    value:string
  }

export default function CustomText({textStyle,value}:CustomTextProps) {
  return (
    <Text  style={{fontFamily:"AktivGrotesk-Regular",...textStyle}}>{value}</Text>
  )
}
