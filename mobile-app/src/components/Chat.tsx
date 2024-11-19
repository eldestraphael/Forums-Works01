import {StyleSheet, View} from 'react-native';
import React from 'react';
import {Box} from 'native-base';
import Text from './RNText';
import {theme} from '../theme/theme';
import { utcToLocal } from '../utils/helpers';

interface Chat {
  name: string;
  content: string;
  date: string;
  sentByOthers: boolean;
}

const Chat = ({name, content, date, sentByOthers}: Chat) => {
  const reverse = sentByOthers ? 'row' : 'row-reverse';
  return (
    <View style={{...styles.container, flexDirection: reverse}}>
      <Box bg="amber.400" style={styles.profileIcon}>
        <Text color="white">{name[0]}</Text>
      </Box>
      <Box style={{flex: 1}}>
        <Box style={{...styles.chatHeader, flexDirection: reverse}}>
          <Text size="md">{name}</Text>
          <Text color="gray.500">{utcToLocal(date).date}</Text>
        </Box>
        <Box
          style={{
            ...styles.chatContent,
            borderTopLeftRadius: sentByOthers ? 0 : 20,
            borderTopRightRadius: sentByOthers ? 20 : 0,
          }}>
          <Text color="white" style={{flexShrink: 1}}>
            {content}
          </Text>
        </Box>
      </Box>
    </View>
  );
};

export default Chat;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
  },
  profileIcon: {
    borderRadius: 30,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  chatContent: {
    padding: 15,
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
  },
});
