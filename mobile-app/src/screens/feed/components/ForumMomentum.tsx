import {StyleSheet, View} from 'react-native';
import React from 'react';
import Card from '../../../components/Card';
import Text from '../../../components/RNText';
import {Divider, Image} from 'native-base';
import CircleIcon from '../../../components/CircleIcon';
import RNSpeedometer from 'react-native-speedometer';

interface ForumMomentum {
  score: number;
}

const labels = [
  {
    name: 'Too Slow',
    labelColor: 'transparent',
    activeBarColor: 'transparent',
  },
  {
    name: 'Very Slow',
    labelColor: '#ff5400',
    activeBarColor: 'transparent',
  },
  {
    name: 'Slow',
    labelColor: '#f4ab44',
    activeBarColor: 'transparent',
  },
  {
    name: 'Normal',
    labelColor: '#f2cf1f',
    activeBarColor: 'transparent',
  },
  {
    name: 'Fast',
    labelColor: '#14eb6e',
    activeBarColor: 'transparent',
  },
  {
    name: 'Unbelievably Fast',
    labelColor: '#00ff6b',
    activeBarColor: 'transparent',
  },
];

const ForumMomentum = ({score}: ForumMomentum) => {
  return (
    <Card style={styles.forumMomentum}>
      <View style={{flex: 1}}>
        <View style={{position: 'relative'}}>
          <View style={{zIndex: 100, backgroundColor: 'transparent'}}>
            <RNSpeedometer
              size={100}
              value={score}
              wrapperStyle={styles.outerCircle}
              outerCircleStyle={styles.outerCircle}
              innerCircleStyle={styles.outerCircle}
              labelStyle={{display: 'none'}}
              labelNoteStyle={{display: 'none'}}
              labels={labels}
              labelWrapperStyle={{height: 0, width: 0}}
              maxValue={100}
            />
          </View>
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}>
            <Image
              style={{
                objectFit: 'contain',
                width: '100%',
                height: '100%',
                transform: 'rotateY(180deg)',
              }}
              alt="icon"
              source={require('../../../../assets/images/Momentum/speedometer.png')}
            />
          </View>
        </View>
      </View>
      <Divider orientation="vertical" />
      <View style={{alignItems: 'center', flex: 1}}>
        <Text size="md" weight="bold">
          Forum Momentum
        </Text>
        <View style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
          <CircleIcon score={score} />
          <Text size="2xl" weight={600}>
            {score}
            <Text size="md">%</Text>
          </Text>
        </View>
      </View>
    </Card>
  );
};

export default ForumMomentum;

const styles = StyleSheet.create({
  forumMomentum: {
    flexDirection: 'row',
    paddingVertical: 30,
    justifyContent: 'center',
  },
  outerCircle: {
    backgroundColor: 'transparent',
  },
});
