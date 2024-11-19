import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Box} from 'native-base';

export type DottedProgressBarArrayValue = 0 | 1 | -1

interface DottedProgressbar {
  count: DottedProgressBarArrayValue[] | {total: number; completed: number};
}

//modify it to accept array instead
const DottedProgressBar = ({count}: DottedProgressbar) => {
  return (
    <View style={styles.container}>
      {Array.isArray(count) ? 
      count.map(k => {
        const bgColor = k === 1 ? '#66bb6a' : k === -1 ? '#f44336' : '#e0e0e0';
        return <Box style={{...styles.dot, backgroundColor: bgColor}}></Box>;
      })
      : 
      [...Array(count.total).keys()].map(k => {
        const bgColor = k < count.completed ? '#66bb6a' : '#e0e0e0';
        return <Box style={{...styles.dot, backgroundColor: bgColor}}></Box>;
      })
    }
    </View>
  );
};

export default DottedProgressBar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 3,
    flexDirection: 'row',
  },
  dot: {
    flex: 1,
    borderRadius: 10,
    height: 6,
    backgroundColor: 'red',
  },
});
