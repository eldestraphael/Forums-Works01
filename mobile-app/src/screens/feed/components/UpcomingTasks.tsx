import {StyleSheet, View} from 'react-native';
import React from 'react';
import Text from '../../../components/RNText';
import Card from '../../../components/Card';
import {Box, Image} from 'native-base';
import {Lesson} from '../../../model/feed';
import { useAppSelector } from '../../../store/hooks';
import { showImage } from './ContentPlayer';
import { PngIcon } from '../../../components/feed/PngIcon';

const UpcomingTasks = () => {

  const courseData = useAppSelector(state => state.courseData.value);
  const currIndex = useAppSelector(state => state.courseData.currIndex);
  if(!courseData) {
    return <></>
  }


  const upcomingTasks = courseData.lessons.slice(currIndex + 1, courseData.lessons.length).map(lesson => {
    return {
      name: lesson.name,
      completedCount: lesson.prework_meta_data?.completion_count || 0,
      assetType: lesson.asset_type
    };
  });

  
  if (!upcomingTasks.length) {
    return <></>
    
  }

  return (
    <View style={styles.container}>
      <Text size="md" weight="bold">
        Upcoming Tasks
      </Text>
      {upcomingTasks.map((task, index) => (
        <Card style={styles.card} key={index}>
          <Box bg="blueGray.800" style={styles.cardLeft}>
              <PngIcon size={30} color='#4B70F5' source={showImage(task.assetType)}/>
          </Box>
          <Box style={styles.cardRight}>
            <Text weight="bold">{task.name}</Text>
            <Box
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Box style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
                <Image
                  style={{
                    width: 25,
                    height: 25,
                  }}
                  alt="icon"
                  source={require('../../../../assets/images/group.png')}
                />
                <Text>{task.completedCount}</Text>
              </Box>
              <PngIcon size={25} color='grey' source={showImage(task.assetType)}/>
            </Box>
          </Box>
        </Card>
      ))}
    </View>
  );
};

export default UpcomingTasks;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  card: {
    padding: 0,
    gap: 0,
    borderRadius: 15,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  cardLeft: {
    padding: 10,
    flex: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardRight: {
    flex: 8,
    padding: 20,
    gap: 20,
  },
});
