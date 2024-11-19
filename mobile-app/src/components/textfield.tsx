import React from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';

interface CustomInputProps {
  placeholder: string;
  title: string;
  onChangeText?: (text: string) => void;
  value?: string;
  id?: string;
  error?: string;
  disabled?: boolean
}

export default function CustomTextField({
  placeholder,
  title,
  onChangeText,
  value,
  disabled,
  id,
  error
}: CustomInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{title}</Text>
      <TextInput
        id={id}
        value={value}
        editable={!disabled}
        style={{...styles.input, color: disabled ? 'grey' : '#000000'}}
        placeholder={`Enter ${placeholder}`}
        placeholderTextColor="#AAAAAA"
        secureTextEntry={title.includes('PASSWORD')}
        onChangeText={onChangeText}
      />
      <Text style={styles.error}>{error}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    marginHorizontal: 20,
  },
  label: {
    fontSize: 12,
    color: '#AAAAAA',
    marginBottom: 5,
  },
  error: {
    color: 'red',
    fontSize: 11
  },
  input: {
    height: 40,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#000000',
  },
});
