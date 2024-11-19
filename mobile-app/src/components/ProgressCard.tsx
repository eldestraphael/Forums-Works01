import {StyleSheet} from 'react-native';
import React from 'react';
import {Box, Image, Progress} from 'native-base';
import Text from './RNText';
import Card from './Card';
import { getProgressColor } from '../utils/helpers';

interface ProgressCard {
  title: string;
  percentage: number;
  icon?: any;
}

const ProgressCard = ({title, percentage, icon}: ProgressCard) => {

  return (
    <Card style={styles.container}>
      <Box style={styles.cardTitleStyle}>
        <Text style={styles.title}>{title}</Text>
        <Image style={styles.iconStyle} alt='icon' source={icon}></Image>
      </Box>
      <Box style={styles.cardContentStyle}>
        <Text weight={700} size={25}>
          {Math.round(percentage)}
          <Text weight={700} size={20}>
            %
          </Text>
        </Text>
        <Progress
          style={styles.progressStyle}
          value={percentage}
          _filledTrack={{
            bg: getProgressColor(percentage),
          }}
        />
      </Box>
    </Card>
  );
};

export default ProgressCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
    padding: 15,
    borderColor: '#e0e0e0',
    justifyContent: 'space-between',
  },
  cardTitleStyle: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 10,
  },
  cardContentStyle: {
    gap: 10,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  title: {
    flexShrink: 1,
    fontWeight: 600,
  },
  progressStyle: {
    height: 10,
    borderRadius: 5,
  },
});
