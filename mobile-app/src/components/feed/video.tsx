import _ from 'lodash';
import {Box, Pressable, Slider} from 'native-base';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import Video, {OnLoadData, VideoRef} from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Dropdown} from 'react-native-element-dropdown';
import {theme} from '../../theme/theme';
import {formatDuration, useInterval} from '../../utils/helpers';
import Text from '../RNText';

export type VideoOnProgressEventType = Readonly<{
  currentTime: number;
  playableDuration: number;
  seekableDuration: number;
}>;
interface VideoPlayerProps {
  waterMark: string;
  mediaUrl: string;
  totalTime: number;
  startFrom?: number;
  handleOnLoad: (metadata: {duration: any}) => void;
  navigation: any;
  onProgress?: (e: number) => void;
}

const renderItem = (item: any) => {
  return (
    <View style={{backgroundColor: 'rgba(0, 0, 0, 0.8)'}}>
      <Text style={{textAlign: 'center', color: 'white'}}>{item.label}</Text>
    </View>
  );
};

const getVolumeIconName = (volume: number) => {
  console.log('volume', volume);
  if (volume > 0.7) {
    return 'volume-high';
  } else if (volume > 0.3) {
    return 'volume-medium';
  } else if (volume > 0) {
    return 'volume-low';
  } else {
    return 'volume-off';
  }
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  waterMark,
  mediaUrl,
  totalTime,
  handleOnLoad,
  startFrom,
  onProgress,
  navigation,
}) => {
  const videoRef = useRef<VideoRef>(null);
  const [pos, setPos] = React.useState(0);
  const [maxV, setMaxV] = React.useState(1);
  const [dragging, setDragging] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [rate, setRate] = useState('1');
  const [volume, setVolume] = useState(0.6);
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);

  const handleProgress = (e: VideoOnProgressEventType) => {
    setPos(e.currentTime);
  };

  const autoHideControl = useCallback(
    _.debounce((e: boolean) => {
      console.log('is playing', e);
      if (e) {
        setShowControls(false);
      }
    }, 3000), // Delay in milliseconds
    [], // Dependencies array
  );

  const data = [
    {label: '2x', value: '2'},
    {label: '1.5x', value: '1.5'},
    {label: '1x', value: '1'},
    {label: '0.5x', value: '0.5'},
  ];

  const debouncedSetCurrentPos = useCallback(
    _.debounce((e: number) => {
      console.log('Updated=--------->', e);
      videoRef.current?.seek(e);
      setDragging(false);
    }, 500), // Delay in milliseconds
    [], // Dependencies array
  );

  useEffect(() => {
    if (dragging) {
      videoRef.current?.pause();
      return;
    }
    if (playing) {
      videoRef.current?.resume();
    }
  }, [dragging]);

  const handleChange = (e: number) => {
    setDragging(true);
    debouncedSetCurrentPos(e);
    autoHideControl(true);
    setPos(e);
  };

  useInterval(
    () => {
      if (onProgress) {
        onProgress(pos);
      }
    },
    playing ? 2000 : null,
  );

  const onLoad = (e: OnLoadData) => {
    console.log(e.duration);
    setPos(0);
    setMaxV(e.duration);
    setPlaying(false);
    setShowControls(true);
    autoHideControl(false);
    handleOnLoad(e);
    setLoading(false);
  };
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      // Do something when the screen blurs
      if (videoRef.current) {
        videoRef.current.pause();
      }
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View>
      <Video
        ref={videoRef}
        source={{
          uri: mediaUrl,
          startPosition: startFrom ? startFrom * 1000 : 0,
        }}
        onLoadStart={() => setLoading(true)}
        currentPlaybackTime={pos}
        progressUpdateInterval={100}
        onProgress={handleProgress}
        style={styles.video}
        controls={false}
        onFullscreenPlayerWillDismiss={() => setFullscreen(false)}
        fullscreen={fullscreen}
        playInBackground={false}
        paused={!playing}
        rate={Number(rate)}
        // volume={1}
        // onVolumeChange={e => {
        //   setVolume(e.volume);
        // }}
        onLoad={onLoad}
      />
      <View
        style={{
          position: 'absolute',
          top: '50%',
          right: 0,
          // zIndex: 100,
          backgroundColor: 'transparent',
        }}>
        <Text style={styles.waterMark}>{waterMark}</Text>
      </View>
      <Box
        style={{
          position: 'absolute',
          height: '100%',
          width: '100%',
          justifyContent: 'space-between',
          display: showControls ? 'flex' : 'flex',
          backgroundColor: loading ? 'rgba(0, 0, 0, 0.8)' : 'transparent',
        }}>
        <Pressable
          onPress={() => {
            setShowControls(true);
            autoHideControl(playing);
          }}
          style={{
            flex: 1,
            position: 'relative',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {loading ? (
            <ActivityIndicator animating={true} color="white" />
          ) : showControls ? (
            <Box
              style={{
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.6)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }}>
              <Icon
                size={40}
                onPress={() => {
                  setPlaying(!playing);
                  autoHideControl(!playing);
                }}
                name={playing ? 'pause' : 'play'}
                color="white"
              />
            </Box>
          ) : (
            <></>
          )}
        </Pressable>
        {/* <View style={{height: 30, backgroundColor: 'transparent'}}></View> */}
        {/* <View style={{justifyContent: 'space-around', flexDirection: 'row'}}>
          <Icon name='rewind-10' size={40}></Icon>
          <Icon name='fast-forward-10' size={40}></Icon>
          </View> */}
        {showControls ? (
          <View
            onTouchStart={() => {
              setShowControls(true);
              autoHideControl(playing);
            }}
            style={{
              flexDirection: 'row',
              // flex: 1,
              height: 50,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              alignItems: 'center',
              gap: 10,
              paddingHorizontal: 10,
              // display: showControls ? 'flex' : 'none',
            }}>
            <Text
              color="white"
              weight="bold"
              style={{width: 50, textAlign: 'center'}}>
              {formatDuration(pos)}
            </Text>
            {/* <Icon
              size={30}
              onPress={() => {
                setPlaying(!playing);
                autoHideControl(!playing);
              }}
              name={playing ? 'pause' : 'play'}
              color="white"
            /> */}
            <Icon
              name="rewind-10"
              color="white"
              onPress={() => handleChange(pos - 10)}
              size={30}></Icon>
            <Icon
              name="fast-forward-10"
              color="white"
              onPress={() => handleChange(pos + 10)}
              size={30}></Icon>
            {/* <Icon
            size={30}
            color="white"
            onPress={() => {}}
            name={getVolumeIconName(volume)}
            /> */}
            <Slider
              style={{flex: 1}}
              defaultValue={0}
              maxValue={maxV}
              value={pos}
              onChange={handleChange}
              colorScheme={theme.colors.primaryBlue}>
              <Slider.Track>
                <Slider.FilledTrack />
              </Slider.Track>
              <Slider.Thumb />
            </Slider>
            <Dropdown
              labelField="label"
              valueField="value"
              renderInputSearch={() => <></>}
              data={data}
              value={rate}
              style={styles.dropdown}
              selectedTextStyle={{color: 'white', textAlign: 'center'}}
              renderItem={renderItem}
              dropdownPosition="top"
              onChange={item => {
                setRate(item.value);
              }}
              renderRightIcon={() => <></>}
            />
            <Icon
              size={30}
              color="white"
              onPress={() => setFullscreen(!fullscreen)}
              name={!fullscreen ? 'fullscreen' : 'fullscreen-exit'}
            />
          </View>
        ) : (
          <></>
        )}
      </Box>
    </View>
  );
};

// Later on in your styles..
var styles = StyleSheet.create({
  video: {
    // top: -30,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    minHeight: 250,
    maxHeight: 300,
    borderRadius: 0,
    backgroundColor: 'black',
  },
  waterMark: {
    color: 'white',
    fontSize: 12,
    zIndex: 1000,
    // top: 150,
    // width: 200,
    // left: 150,
  },
  dropdown: {
    width: 40,
    fontSize: 10,
    color: 'white',
    backgroundColor: 'transparent',
    elevation: 2,
  },
});

export default VideoPlayer;
