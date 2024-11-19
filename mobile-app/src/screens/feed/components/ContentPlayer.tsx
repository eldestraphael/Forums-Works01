import {Dimensions, Image, StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import Loader from '../../../components/Loader';
import VideoPlayer, {
  VideoOnProgressEventType,
} from '../../../components/feed/video';
import Text from '../../../components/RNText';
import {ForumuserData} from '../../../model/user';
import api from '../../../utils/api';
import MaterialIconsCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import {retrieveData} from '../../../utils/localStorage';
import Pdf from 'react-native-pdf';
import {Box, Pressable} from 'native-base';
import LoadingButton from '../../../components/loaderButton';
import {useAppDispatch, useAppSelector} from '../../../store/hooks';
import {setCurrentIndex} from '../../../store/slices/courseDataSlice';
import {theme} from '../../../theme/theme';
import {debounce, formatDuration} from '../../../utils/helpers';
import {PngIcon} from '../../../components/feed/PngIcon';

interface SetProgressApi {
  status: number;
  statusPercentage: number;
  lessonId: string;
  currentLesson?: boolean;
}

interface ContentPlayer {
  getStatusData: () => Promise<void>;
  navigation: any;
}

export const showImage = (type: string) => {
  if (type === 'pdf')
    return require('../../../../assets/images/lessons/pdf.png');
  if (type === 'audio')
    return require('../../../../assets/images/lessons/audio.png');
  if (type === 'video')
    return require('../../../../assets/images/lessons/video.png');
  if (type === 'survey')
    return require('../../../../assets/images/lessons/survey.png');

  return require('../../../../assets/images/lessons/image.png');
};

const ContentPlayer = ({getStatusData, navigation}: ContentPlayer) => {
  const [watermark, setWaterMark] = useState<string>('');
  const forumInfo = useAppSelector(state => state.appData.value.forumInfo);

  const dispatch = useAppDispatch();
  const currIndex = useAppSelector(state => state.courseData.currIndex);
  const courseData = useAppSelector(state => state.courseData.value);

  const [status, setStatus] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [lessonsCompleted, setLessonsCompleted] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [totalPdfPages, setTotalPdfPages] = useState(0);
  const [videoTotalTime, setVideoTotalTime] = useState(0);

  const isVideoOrAudio = ['audio', 'video'].includes(
    courseData?.lessons[currIndex]?.asset_type || '',
  );

  const resetState = () => {
    setTotalPdfPages(0);
    setVideoTotalTime(0);
  };

  if (!courseData) {
    return <></>;
  }

  const currentLesson =
    courseData?.lessons[
      currIndex > courseData.lessons.length - 1 ? 0 : currIndex
    ];

  const currentLessonMetadata = currentLesson?.prework_meta_data;

  if (!currentLessonMetadata) {
    return <></>;
  }

  React.useEffect(() => {
    setStatus(currentLessonMetadata.status || 0);
    setProgressPercentage(currentLessonMetadata.status_percent || 0);
    resetState();
    setButtonLoading(false);
  }, [courseData, currIndex]);

  const nextIndex = async () => {
    const newIndex = currIndex + 1;
    if (!courseData) return;
    const isCurrentLesson = courseData.lessons[currIndex].is_current_lesson;
    if (isCurrentLesson) {
      setButtonLoading(true);
      try {
        await setProgressApi({
          status: isVideoOrAudio ? videoTotalTime : status,
          statusPercentage: 100,
          lessonId: courseData.lessons[currIndex].uuid,
          currentLesson: false,
        });
        await setProgressApi({
          status: courseData.lessons[newIndex]?.prework_meta_data.status || 0,
          statusPercentage:
            courseData?.lessons[newIndex]?.prework_meta_data?.status_percent ||
            0,
          lessonId: courseData.lessons[newIndex].uuid,
          currentLesson: true,
        });
        await getStatusData();
      } catch (error) {}
    } else {
      dispatch(setCurrentIndex(currIndex + 1));
    }
  };

  const prevIndex = () => {
    const newIndex = currIndex - 1;
    dispatch(setCurrentIndex(newIndex));
  };

  const complete = async () => {
    // setProgressPercentage(currentLessonMetadata.status_percent || 0);
    setButtonLoading(true);
    await setProgressApi({
      status: isVideoOrAudio ? videoTotalTime : status,
      statusPercentage: 100,
      lessonId: courseData.lessons[currIndex].uuid,
      currentLesson: false,
    });
    await getStatusData();
    dispatch(setCurrentIndex(0));
  };

  const createWatermark = async () => {
    const currentDate = new Date();
    // Format the time to AM/PM format
    const formattedTime = currentDate.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true, // Use 12-hour clock with AM/PM
    });
    const userData: ForumuserData = await api.get(`user/me`);
    const waterMarkText = `${userData.data.user_info.email}-${formattedTime}`;
    setWaterMark(waterMarkText);
  };

  React.useEffect(() => {
    createWatermark();
  }, []);

  const setProgress = async ({
    status,
    statusPercentage,
    lessonId,
    currentLesson = true,
  }: SetProgressApi) => {
    const payload = {
      lesson_uuid: lessonId,
      status,
      status_percent: statusPercentage,
      is_current_lesson: currentLesson,
    };
    const key = await retrieveData('forum_uuid');
    const response = await api.post(`forumexperience/${key}/prework`, payload);
    return response;
  };

  const setProgressApi = React.useMemo(() => debounce(setProgress, 250), []);

  React.useEffect(() => {
    if (courseData.lessons.length) {
      const res = courseData.lessons.every(v => v?.is_current_lesson === false);
      setLessonsCompleted(res);
    }
  }, [courseData, currIndex]);

  const handleProgress = async (currentTime: number) => {
    try {
      if (currentLessonMetadata.status_percent !== 100 && !buttonLoading) {
        const statusPercentage = (currentTime / Number(videoTotalTime)) * 100;
        setProgressApi({
          status: currentTime,
          statusPercentage,
          lessonId: courseData.lessons[currIndex].uuid,
        });
        setStatus(currentTime);
        setProgressPercentage(statusPercentage);
      }
    } catch (err: any) {
      console.log('post prework error...', err.response);
    }
  };

  const handleImageProgress = async () => {
    if (currentLessonMetadata.status_percent !== 100) {
      await setProgressApi({
        status: 1,
        statusPercentage: 100,
        lessonId: courseData.lessons[currIndex].uuid,
        currentLesson: true,
      });
      setStatus(0);
      setProgressPercentage(100);
    }
  };

  const handlePdfProgress = async (page: number, noOfPages: number) => {
    if (currentLessonMetadata.status_percent === 100) {
      return;
    }
    if (status <= page) {
      const percentage = (page / noOfPages) * 100;
      await setProgressApi({
        status: page,
        statusPercentage: percentage,
        lessonId: courseData.lessons[currIndex].uuid,
        currentLesson: true,
      });
      setStatus(page);
      setProgressPercentage(percentage);
    }
  };

  const handleSurvey = async (data: any) => {
    const surveyId = courseData.lessons[currIndex].asset_info.uuid;
    try {
      const res = await api.post(
        `forum/${forumInfo?.uuid}/survey/${surveyId}/response`,
        data.data,
      );
      if (currentLessonMetadata.status_percent !== 100) {
        await setProgressApi({
          status: data.status,
          statusPercentage: 100,
          lessonId: courseData.lessons[currIndex].uuid,
          currentLesson: true,
        });
      }
      await getStatusData();
    } catch (error: any) {
      console.log(error.data);
    }
  };

  const handleOnLoad = (metadata: {duration: any}) => {
    console.log('video loaded -------------------------------------');
    const totalSeconds = metadata.duration;
    setVideoTotalTime(totalSeconds);
  };

  return (
    <View style={styles.videoSection}>
      {courseData == null ? (
        <Loader />
      ) : (
        <View style={styles.card}>
          {courseData.lessons[currIndex]?.asset_type === 'image' ? (
            <Pressable
              onPress={() =>
                navigation.navigate('PdfViewer', {
                  uri: courseData.lessons[currIndex]?.asset_info?.url,
                  type: 'image',
                })
              }>
              <Image
                alt="image"
                key={currentLesson?.uuid}
                source={{uri: courseData.lessons[currIndex]?.asset_info?.url}}
                style={styles.image}
                resizeMode="cover"
                onLoad={handleImageProgress}
              />
            </Pressable>
          ) : courseData.lessons[currIndex]?.asset_type === 'pdf' ? (
            <Pressable
              onPress={() =>
                navigation.navigate('PdfViewer', {
                  uri: courseData.lessons[currIndex]?.asset_info?.url,
                  type: 'pdf',
                  handlePdfProgress,
                })
              }>
              <Box>
                <Pdf
                  onLoadComplete={(numberOfPages, filePath) => {
                    console.log(`Number of pages: ${numberOfPages}`);
                    setTotalPdfPages(numberOfPages);
                  }}
                  key={currentLesson?.uuid}
                  trustAllCerts={false}
                  onPageChanged={handlePdfProgress}
                  style={styles.pdf}
                  source={{
                    uri: courseData.lessons[currIndex]?.asset_info?.url,
                  }}></Pdf>
              </Box>
            </Pressable>
          ) : courseData.lessons[currIndex]?.asset_type === 'survey' ? (
            <Pressable>
              <Box
                style={{
                  width: '100%',
                  height: 200,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}>
                <Text
                  weight="bold"
                  style={{
                    color: theme.colors.primaryBlue,
                    textAlign: 'center',
                  }}>
                  Please complete the survey
                </Text>
                <LoadingButton
                  style={{
                    flexDirection: 'row',
                    borderRadius: 10,
                    backgroundColor: theme.colors.primaryBlue,
                  }}
                  onPress={() =>
                    navigation.navigate('Survey', {
                      uuid: courseData.lessons[currIndex]?.uuid,
                      type: 'survey',
                      handleSurvey,
                    })
                  }>
                  <Text style={{color: 'white', fontSize: 16}}>Open</Text>
                </LoadingButton>
              </Box>
            </Pressable>
          ) : isVideoOrAudio ? (
            <VideoPlayer
              waterMark={watermark}
              startFrom={
                currentLessonMetadata.status_percent === 100
                  ? 0
                  : currentLessonMetadata.status
              }
              key={currentLesson?.uuid}
              onProgress={handleProgress}
              mediaUrl={courseData.lessons[currIndex]?.asset_info.url}
              totalTime={20}
              handleOnLoad={handleOnLoad}
              navigation={navigation}
            />
          ) : (
            <></>
          )}
          <Text style={styles.title}>
            {courseData.lessons[currIndex]?.name}
          </Text>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: 15,
              }}>
              <View
                style={{
                  backgroundColor: 'black',
                  borderRadius: 30,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  style={{
                    width: 25,
                    height: 25,
                  }}
                  alt="icon"
                  source={require('../../../../assets/images/group.png')}
                />
              </View>
              <Text style={styles.count}>
                {
                  courseData?.lessons[currIndex]?.prework_meta_data
                    ?.completion_count
                }
              </Text>
            </View>
            <View
              style={{
                marginHorizontal: 15,
                alignContent: 'center',
                flexDirection: 'row',
              }}>
              <PngIcon
                size={20}
                source={showImage(courseData?.lessons[currIndex]?.asset_type)}
              />
              {courseData?.lessons[currIndex]?.asset_type === 'pdf' && (
                <>
                  <Text style={styles.count}>|</Text>
                  <Text style={styles.count}>
                    {totalPdfPages} {totalPdfPages > 1 ? 'pages' : 'page'}
                  </Text>
                </>
              )}
              {isVideoOrAudio && (
                <>
                  <Text style={styles.count}>|</Text>
                  <Text style={styles.count}>
                    {formatDuration(videoTotalTime)} mins
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
      )}
      {courseData == null ? (
        <></>
      ) : (
        <View style={styles.buttons}>
          <LoadingButton
            style={{flexDirection: 'row', borderRadius: 10}}
            onPress={prevIndex}
            disabled={currIndex === 0}>
            <MaterialIconsCommunity
              name="chevron-left"
              size={20}
              color={currIndex === 0 ? 'gray' : 'white'}
            />
            <Text style={{color: 'white', fontSize: 16}}>Prev</Text>
          </LoadingButton>
          {currIndex < courseData?.lessons.length - 1 ? (
            <LoadingButton
              style={{flexDirection: 'row', borderRadius: 10}}
              onPress={nextIndex}
              disabled={progressPercentage < 90}
              isLoading={buttonLoading}>
              <Text style={{color: 'white', fontSize: 16}}>Next</Text>
              <MaterialIconsCommunity
                name="chevron-right"
                size={20}
                color="white"
              />
            </LoadingButton>
          ) : (
            <LoadingButton
              style={{flexDirection: 'row', borderRadius: 10}}
              onPress={complete}
              disabled={progressPercentage < 90 || lessonsCompleted}
              isLoading={buttonLoading}>
              <Text style={{color: 'white', fontSize: 16}}>Complete</Text>
            </LoadingButton>
          )}
        </View>
      )}
    </View>
  );
};

export default ContentPlayer;

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
    backgroundColor: 'white',
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: 'grey',
    paddingBottom: 10,
  },
  pdf: {
    height: 200,
    width: Dimensions.get('window').width,
    alignSelf: 'center',
  },
});
