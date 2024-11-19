/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {RefreshControl, ScrollView, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {retrieveData} from '../../utils/localStorage';
import api from '../../utils/api';
import {ActionStepData, StatusData, courseResponse} from '../../model/feed';
import Loader from '../../components/Loader';
import {ForumuserData} from '../../model/user';
// import VideoPlayer from '../../components/feed/video';
import Text from '../../components/RNText';
import {Box} from 'native-base';
import ForumMomentum from './components/ForumMomentum';
import {ActionSteps, Prework} from './components/PreworkAndActionSteps';
import JoinMeeting from './components/JoinMeeting';
import UpcomingTasks from './components/UpcomingTasks';
import {ApiResponse} from '../../model/base';
import ContentPlayer from './components/ContentPlayer';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {setStatusData} from '../../store/slices/statusDataSlice';
import {
  setCourseData,
  setCurrentIndex,
} from '../../store/slices/courseDataSlice';
import _ from 'lodash';
import NoDataFound from '../../components/NoDataFound/NoDataFound';
import {theme} from '../../theme/theme';

export default function Feed({navigation}: any) {
  const [actionStepData, setActionStepData] = useState<ActionStepData | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [currIndex, setCurrIndex] = useState<number>(0);
  const [userData, setUserData] = useState<ForumuserData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [isMeetingEnabled, setIsMeetingEnabled] = React.useState(false);
  const statusData = useAppSelector(state => state.statusData.value);
  const courseData = useAppSelector(state => state.courseData.value);
  const dispatch = useAppDispatch();

  // GET REQUESTS

  const getData = async () => {
    const forumId = await retrieveData('forum_uuid');
    const response: courseResponse = await api.get(
      `forumexperience/${forumId}/prework`,
    );
    updateIndex();
    dispatch(setCourseData(response.data));
  };

  const getStatusData = async () => {
    console.log("Trigerring status fetch...................")
    try {
      if (_.isEmpty(statusData)) {
        setLoading(true);
      }
      const key = await retrieveData('forum_uuid');
      const response: ApiResponse<StatusData> = await api.get(
        `forumexperience/${key}/status`,
      );

      if (response.data) {
        dispatch(setStatusData(response.data));
      }
    } catch (error) {
      console.log(error, 'status error');
    }
    setLoading(false);
  };

  const getUserData = async () => {
    const userData: ForumuserData = await api.get(`user/me`);
    setUserData(userData);
  };

  const getActionStepsData = async (chapterId: string) => {
    const forumId = await retrieveData('forum_uuid');
    const res: ApiResponse<ActionStepData> = await api.get(
      `forumexperience/${forumId}/actionstep/${chapterId}`,
    );
    setActionStepData(res.data);
    return res.data;
  };

  const postActionStepMessage = async (message: string, cb: any) => {
    try {
      const chapterId = courseData?.chapter_info?.uuid;
      if (chapterId) {
        const forumId = await retrieveData('forum_uuid');
        const res = await api.post(
          `forumexperience/${forumId}/actionstep/${chapterId}`,
          {
            message,
          },
        );
        const resData = await getActionStepsData(chapterId);
        await getStatusData();
        cb(resData);
      }
    } catch (error: any) {
      console.log('error..........', error.response);
    }
  };

  useEffect(() => {
    getStatusData();
  }, []);

  React.useEffect(() => {
    console.log("Trigerring data fetch...................")
    if (statusData?.status) {
      getData();
    }
  }, [statusData]);

  React.useEffect(() => {
    getUserData();
  }, []);

  React.useEffect(() => {
    console.log("Trigerring action step fetch...................")
    if (
      courseData?.chapter_info?.uuid &&
      statusData?.action_step?.completion_status?.length
    ) {
      getActionStepsData(courseData.chapter_info.uuid);
    }
  }, [courseData, statusData]);

  useEffect(() => {
    updateIndex();
  }, [courseData]);

  const updateIndex = () => {
    if (_.isEmpty(courseData)) return;
    const currentLesson = courseData.lessons.findIndex(
      item => item.is_current_lesson,
    );
    dispatch(setCurrentIndex(currentLesson === -1 ? 0 : currentLesson));
  };

  if (loading) {
    return <Loader />;
  }

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getStatusData();
      await getUserData();
    } catch (error) {}
    setRefreshing(false);
  };

  if (!statusData || !statusData.status) {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{flex: 1}}
        style={{backgroundColor: 'white'}}>
        <NoDataFound />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      style={styles.container}>
      <View style={styles.topSection}>
        <Text size="md" weight="bold">
          Tasks for this week
        </Text>
        {_.isNumber(statusData.momentum) ? (
          <ForumMomentum score={statusData.momentum} />
        ) : (
          <></>
        )}

        <Box style={{flexDirection: 'row', gap: 10}}>
          {statusData?.prework ? <Prework data={statusData?.prework} /> : <></>}
          {statusData?.action_step ? (
            <ActionSteps
              postActionStepMessage={postActionStepMessage}
              actionStepData={actionStepData}
              data={statusData?.action_step?.completion_status}
              navigation={navigation}
              userData={userData}
              disabled={
                !statusData?.action_step?.completion_status?.length ||
                isMeetingEnabled
              }
            />
          ) : (
            <></>
          )}
        </Box>
        {statusData?.forum_meeting ? (
          <JoinMeeting
            userData={userData}
            isButtonEnabled={isMeetingEnabled}
            setIsButtonEnabled={setIsMeetingEnabled}
            navigation={navigation}
            nextMeeting={statusData?.forum_meeting?.next_meeting}
          />
        ) : (
          <></>
        )}
      </View>
      {isMeetingEnabled ? (
        <View style={{height: '100%', paddingTop: 30, paddingHorizontal: 20}}>
          <Text
            weight="bold"
            style={{
              color: theme.colors.primaryBlue,
              textAlign: 'center',
            }}>
            Click on the "Join Meeting" button to participate in your forum
            meeting
          </Text>
        </View>
      ) : !!courseData ? (
        <>
          <ContentPlayer
            getStatusData={getStatusData}
            navigation={navigation}
          />
          <UpcomingTasks />
        </>
      ) : (
        <></>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    padding: 20,
    gap: 20,
    backgroundColor: 'white',
  },
  videoSection: {
    padding: 10,
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  title: {
    fontSize: 18,
    fontWeight: 'semibold',
    paddingLeft: 10,
    margin: 10,
    color: 'black',
  },
  count: {
    fontSize: 16,
    fontWeight: 'semibold',
    paddingLeft: 10,
    color: 'grey',
  },
  buttons: {
    flexDirection: 'row',
    gap: 30,
    justifyContent: 'center',
    margin: 10,
  },
  image: {
    width: '100%',
    height: 250,
  },
  card: {
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: 'grey',
    paddingBottom: 10,
  },
  pdf: {
    height: 200,
    alignSelf: 'center',
  },
});
