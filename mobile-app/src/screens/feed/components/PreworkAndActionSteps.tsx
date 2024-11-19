import {StyleSheet, View} from 'react-native';
import React from 'react';
import Text from '../../../components/RNText';
import Card from '../../../components/Card';
import {Box, Image, Pressable} from 'native-base';
import DottedProgressBar, {
  DottedProgressBarArrayValue,
} from '../../../components/DottedProgressBar';
import {useNavigation} from '@react-navigation/native';
import {ActionStepData, PreworkProps} from '../../../model/feed';
import api from '../../../utils/api';
import {retrieveData} from '../../../utils/localStorage';
import {ForumuserData} from '../../../model/user';
import {secondsToMinutes} from '../../../utils/helpers';

const Prework = ({data}: {data: PreworkProps}) => {
  const timeLeft = data.total_time - data.completed_time;

  return (
    <View style={styles.container}>
      <Pressable style={{flex: 1}}>
        <Card style={{gap: 20}}>
          <Box style={styles.cardTitleStyle}>
            <Text style={styles.title}>Pre work</Text>
            <Image
              style={styles.iconStyle}
              alt="icon"
              source={require('../../../../assets/images/Feed/006-arrows.png')}></Image>
          </Box>
          <Box style={{gap: 10}}>
            <DottedProgressBar
              count={{
                total: data.total_tasks,
                completed: data.completed_tasks,
              }}
            />
            <Box
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text color="gray.500" size={12}>
                {data?.completed_tasks}/{data?.total_tasks}
              </Text>
              {data?.completed_tasks < data?.total_tasks && (
                <Text color="gray.500" size={12}>
                  {timeLeft > 0 ? secondsToMinutes(timeLeft) + ' left' : ''}
                </Text>
              )}
            </Box>
          </Box>
        </Card>
      </Pressable>
    </View>
  );
};

const ActionSteps = ({
  data,
  actionStepData,
  navigation,
  userData,
  postActionStepMessage,
  disabled,
}: {
  data: number[];
  actionStepData: ActionStepData | null;
  navigation: any;
  disabled: boolean;
  userData: ForumuserData | null;
  postActionStepMessage: (message: string, cb: any) => void;
}) => {
  const handleClick = () => {
    navigation.navigate('ShareStory', {
      actionStepData,
      userData,
      postActionStepMessage,
    });
  };
  return disabled ? (
    <View style={styles.container}>
      <Card style={{gap: 20}}>
        <Box style={styles.cardTitleStyle}>
          <Text style={styles.title}>Action Steps</Text>
          <Image
            style={styles.iconStyle}
            alt="icon"
            source={require('../../../../assets/images/Feed/009-discussion.png')}></Image>
        </Box>
        <Box style={{gap: 10}}>
          <Text color="gray.400">No Action Steps</Text>
        </Box>
      </Card>
    </View>
  ) : (
    <View style={styles.container}>
      <Pressable style={{flex: 1}} onPress={handleClick}>
        <Card style={{gap: 20}}>
          <Box style={styles.cardTitleStyle}>
            <Text style={styles.title}>Action Steps</Text>
            <Image
              style={styles.iconStyle}
              alt="icon"
              source={require('../../../../assets/images/Feed/009-discussion.png')}></Image>
          </Box>
          <Box style={{gap: 10}}>
            <DottedProgressBar count={data as DottedProgressBarArrayValue[]} />
            <Box
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text color="gray.500" size={12}>
                {data.filter(val => val === 1).length}/{data.length}
              </Text>
              <Text color="gray.500" size={12}>
                {data.filter(val => val === 0).length} days left
              </Text>
            </Box>
          </Box>
        </Card>
      </Pressable>
    </View>
  );
};

export {Prework, ActionSteps};

const styles = StyleSheet.create({
  container: {
    gap: 15,
    flexDirection: 'row',
    flex: 1,
  },
  disabled: {
    flex: 1,
    flexDirection: 'row',
    // alignItems: 'center',
    justifyContent: 'space-between',
    // justifyContent: 'center',
    backgroundColor: 'rgb(161,161,169)',
  },
  cardTitleStyle: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 10,
    width: '100%',
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
