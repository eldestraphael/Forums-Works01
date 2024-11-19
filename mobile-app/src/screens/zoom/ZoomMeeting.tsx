import {
  ActionSheetIOS,
  Alert,
  Easing,
  EmitterSubscription,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import React, {useRef, useState} from 'react';

import {
  EventType,
  LiveTranscriptionStatus,
  ShareStatus,
  useZoom,
  VideoAspect,
  ZoomVideoSdkChatMessage,
  ZoomVideoSdkChatMessageType,
  ZoomVideoSDKChatPrivilegeType,
  ZoomVideoSdkUser,
  ZoomVideoSdkUserType,
  ZoomView,
} from '@zoom/react-native-videosdk';
import {
  Button,
  ScrollView,
  Modal,
  Input,
  FormControl,
  Center,
  Select,
  FlatList,
} from 'native-base';
import {VideoView} from './VideoView';
import {Icon} from './icon';
import Loader from '../../components/Loader';
import {retrieveData} from '../../utils/localStorage';
import {ApiResponse} from '../../model/base';
import api from '../../utils/api';

import IonIcons from 'react-native-vector-icons/Ionicons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  Permission,
} from 'react-native-permissions';
import ModeratorGuide from '../../components/ModeratorGuide';
import {CONFIG} from '../../config/config';
import Text from '../../components/RNText';

const ZoomMeeting = ({navigation, route}: any) => {
  const [loading, setLoading] = React.useState(false);
  const config = route.params;
  const zoom = useZoom();

  const [users, setUsersInSession] = React.useState<ZoomVideoSdkUser[]>([]);
  const [currentUser, setCurrentUser] = React.useState<ZoomVideoSdkUser | null>(
    null,
  );
  const [isInSession, setIsInSession] = React.useState(false);
  const listeners = React.useRef<EmitterSubscription[]>([]);

  const [isMuted, setIsMuted] = React.useState(true);
  const [isVideoOn, setIsVideoOn] = React.useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = React.useState(false);
  const [fullScreenUser, setFullScreenUser] =
    React.useState<ZoomVideoSdkUser>();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUserForChat, setSelectedUserForChat] = useState('');
  const [onMoreOptions, setOnMoreOptions] = useState<
    {
      disabled?: boolean;
      text: string;
      onPress: () => Promise<void>;
    }[]
  >([]);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatVisible, setChatVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState<ZoomVideoSdkChatMessage[]>(
    [],
  );
  const [contentHeight, setContentHeight] = useState<string | number>('100%');
  const [isSharing, setIsSharing] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(true);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [isLongTouch, setIsLongTouch] = useState(false);
  const [isRecordingStarted, setIsRecordingStarted] = useState(false);
  const [isMicOriginalOn, setIsMicOriginalOn] = useState(false);
  const isLongTouchRef = useRef(isLongTouch);
  const chatInputRef = useRef<TextInput>(null);
  const videoInfoTimer = useRef<number>(0);
  // react-native-reanimated issue: https://github.com/software-mansion/react-native-reanimated/issues/920
  // Not able to reuse animated style in multiple views.
  // const uiOpacity = useSharedValue(0);
  // const inputOpacity = useSharedValue(0);
  // const chatSendButtonScale = useSharedValue(0);
  // const isMounted = useIsMounted();
  // const zoom = useZoom();
  const windowHeight = useWindowDimensions().height;

  let touchTimer: NodeJS.Timeout;

  React.useEffect(() => {
    const listener = navigation.addListener('beforeRemove', (e: any) => {
      if (!isInSession) {
        return;
      }
      e.preventDefault();
      Alert.alert(
        'Meeting in-progress',
        'Are you sure you want to leave the meeting?',
        [
          {text: "Don't leave", style: 'cancel', onPress: () => {}},
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => leaveSession(),
          },
        ],
      );
    });
    return () => {
      listener() // to remove the old listeners when dependencies updates
    }
  }, [navigation, isInSession]);

  const leaveMeetingApi = async () => {
    setLoading(true);
    const forumId = await retrieveData('forum_uuid');
    try {
      const payload = {
        type: 'zoom', // Type of meeting. Can we either "zoom" or "bluetooth"
        meeting_uuid: config.meetingUuid, // Unique per meeting
        meeting_status_uuid: config.meetingStatusUuid, // Unique per check-in, a single user can have many check-ins
      };
      const res: ApiResponse<null> = await api.post(
        `forumexperience/${forumId}/leavemeeting`,
        payload,
      );
    } catch (err: any) {
      console.log(err.response.data);
    }
    setLoading(false);
  };

  const updateSpeakerStatus = async () => {
    const speakerStatus = await zoom.audioHelper.getSpeakerStatus();
    setIsSpeakerOn(!!speakerStatus);
  };

  React.useEffect(() => {
    updateSpeakerStatus();
    const sessionJoin = zoom.addListener(EventType.onSessionJoin, async () => {
      const mySelf = new ZoomVideoSdkUser(await zoom.session.getMySelf());
      const remoteUsers = await zoom.session.getRemoteUsers();
      setUsersInSession([mySelf, ...remoteUsers]);
      setIsInSession(true);
    });
    listeners.current.push(sessionJoin);

    const userJoin = zoom.addListener(EventType.onUserJoin, async event => {
      const {remoteUsers} = event;
      const mySelf = await zoom.session.getMySelf();
      const remote = remoteUsers.map((user: any) => new ZoomVideoSdkUser(user));
      setUsersInSession([mySelf, ...remote]);
    });
    listeners.current.push(userJoin);

    const userLeave = zoom.addListener(EventType.onUserLeave, async event => {
      const {remoteUsers} = event;
      const mySelf = await zoom.session.getMySelf();
      const remote = remoteUsers.map((user: any) => new ZoomVideoSdkUser(user));
      setUsersInSession([mySelf, ...remote]);
    });
    listeners.current.push(userLeave);

    const sessionLeave = zoom.addListener(
      EventType.onSessionLeave,
      async () => {
        setIsInSession(false);
        setUsersInSession([]);
        await leaveMeetingApi();
        navigation.goBack();
        sessionLeave.remove();
      },
    );

    const userAudioStatusChangedListener = zoom.addListener(
      EventType.onUserAudioStatusChanged,
      async ({changedUsers}: {changedUsers: ZoomVideoSdkUserType[]}) => {
        const mySelf: ZoomVideoSdkUser = new ZoomVideoSdkUser(
          await zoom.session.getMySelf(),
        );
        changedUsers.map((u: ZoomVideoSdkUserType) => {
          if (mySelf.userId === u.userId) {
            mySelf.audioStatus.isMuted().then(muted => setIsMuted(muted));
          }
        });
      },
    );
    listeners.current.push(userAudioStatusChangedListener);

    const userVideoStatusChangedListener = zoom.addListener(
      EventType.onUserVideoStatusChanged,
      async ({changedUsers}: {changedUsers: ZoomVideoSdkUserType[]}) => {
        const mySelf: ZoomVideoSdkUser = new ZoomVideoSdkUser(
          await zoom.session.getMySelf(),
        );
        changedUsers.map((u: ZoomVideoSdkUserType) => {
          if (mySelf.userId === u.userId) {
            mySelf.videoStatus.isOn().then(on => setIsVideoOn(on));
          }
        });
      },
    );

    listeners.current.push(userVideoStatusChangedListener);
  }, []);

  function joinFields(name: string, dateTime: any) {
    const transformedName = name.replace(/\s+/g, '_');
    const date = dateTime.split(' ')[0];
    const transformedDate = date.replace(/-/g, '_');
    const result = `${transformedName}-${transformedDate}`;
    return result;
  }

  const joinSession = async () => {
    try {
      if (await zoom.isInSession()) {
        const mySelf = new ZoomVideoSdkUser(await zoom.session.getMySelf());
        const remoteUsers = await zoom.session.getRemoteUsers();
        setCurrentUser(mySelf);
        setUsersInSession([mySelf, ...remoteUsers]);
        setIsInSession(true);
        return;
      }
      await zoom
        .joinSession({
          sessionName: config.sessionName,
          sessionPassword: CONFIG.zoom.sessionPassword,
          userName: config.userName,
          sessionIdleTimeoutMins: 10,
          token: config.token,
          audioOptions: {
            connect: true,
            mute: true,
            autoAdjustSpeakerVolume: false,
          },
          videoOptions: {localVideoOn: false},
        })
        .then(async v => {})
        .catch(e => {
          Alert.alert('Failed to join meeting');
          console.log(e.message);
          navigation.goBack();
        });
    } catch (error: any) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    joinSession();
  }, []);

  React.useEffect(() => {
    const chatNewMessageNotify = zoom.addListener(
      EventType.onChatNewMessageNotify,
      (newMessage: ZoomVideoSdkChatMessageType) => {
        setChatMessages([
          new ZoomVideoSdkChatMessage(newMessage),
          ...chatMessages,
        ]);
      },
    );
    return () => {
      chatNewMessageNotify.remove();
    };
  }, [zoom, users, route, chatMessages]);

  const requestNotificationPermission = async (permission: Permission) => {
    const result = await request(permission);
    return result;
  };

  const checkNotificationPermission = async (permission: Permission) => {
    const result = await check(permission);
    return result;
  };

  const checkAndRequestPermission = async (
    fn: () => Promise<void>,
    permission: Permission,
  ) => {
    const checkPermission = await checkNotificationPermission(permission);
    if (checkPermission !== RESULTS.GRANTED) {
      const request = await requestNotificationPermission(permission);
      if (request !== RESULTS.GRANTED) {
        return;
      }
    }
    await fn();
  };

  const leaveSession = () => {
    zoom.leaveSession(false);
    setIsInSession(false);
    listeners.current.forEach(listener => listener.remove());
    listeners.current = [];
  };

  const onPressAudio = async () => {
    const mySelf = await zoom.session.getMySelf();
    const muted = await mySelf.audioStatus.isMuted();
    muted
      ? await zoom.audioHelper.unmuteAudio(mySelf.userId)
      : await zoom.audioHelper.muteAudio(mySelf.userId);
  };

  const onPressVideo = async () => {
    const mySelf = await zoom.session.getMySelf();
    const videoOn = await mySelf.videoStatus.isOn();
    videoOn
      ? await zoom.videoHelper.stopVideo()
      : await zoom.videoHelper.startVideo();
  };

  const onPressShare = async () => {
    const isOtherSharing = await zoom.shareHelper.isOtherSharing();
    const isShareLocked = await zoom.shareHelper.isShareLocked();

    if (isOtherSharing) {
      Alert.alert('Other is sharing');
    } else if (isShareLocked) {
      Alert.alert('Share is locked by host');
    } else {
      zoom.shareHelper.shareScreen();
    }
  };

  const toggleUI = () => {
    const easeIn = Easing.in(Easing.exp);
    const easeOut = Easing.out(Easing.exp);
    // uiOpacity.value = withTiming(uiOpacity.value === 0 ? 100 : 0, {
    //   duration: 300,
    //   easing: uiOpacity.value === 0 ? easeIn : easeOut,
    // });
    // inputOpacity.value = withTiming(inputOpacity.value === 0 ? 100 : 0, {
    //   duration: 300,
    //   easing: inputOpacity.value === 0 ? easeIn : easeOut,
    // });
  };

  // onPress event for FlatList since RN doesn't provide container-on-press event
  const onListTouchStart = () => {
    touchTimer = setTimeout(() => {
      setIsLongTouch(true);
    }, 200);
  };

  // onPress event for FlatList since RN doesn't provide container-on-press event
  const onListTouchEnd = (event: any) => {
    // Toggle UI behavior
    // - Toggle only when user list or chat list is tapped
    // - Block toggling when tapping on a list item
    // - Block toggling when keyboard is shown
    if (event._targetInst.elementType.includes('Scroll') && isKeyboardOpen) {
      !isLongTouchRef.current && toggleUI();
    }
    clearTimeout(touchTimer);
    setIsLongTouch(false);
  };

  const sendChatMessage = async () => {
    if (selectedUserForChat === '') {
      await zoom.chatHelper.sendChatToAll(chatMessage);
    } else {
      await zoom.chatHelper.sendChatToUser(selectedUserForChat, chatMessage);
    }
    setChatMessage('');
    // send the chat as a command
    await zoom.cmdChannel.sendCommand('', chatMessage);
  };

  const onPressMore = async () => {
    const mySelf = await zoom.session.getMySelf();
    const isShareLocked = await zoom.shareHelper.isShareLocked();
    const isFullScreenUserManager = await fullScreenUser?.getIsManager();
    const canSwitchSpeaker = await zoom.audioHelper.canSwitchSpeaker();
    const canStartRecording = await zoom.recordingHelper.canStartRecording();
    const isSupportPhoneFeature =
      await zoom.phoneHelper.isSupportPhoneFeature();
    const startLiveTranscription =
      (await zoom.liveTranscriptionHelper.getLiveTranscriptionStatus()) ===
      LiveTranscriptionStatus.Start;
    const canCallOutToCRC = await zoom.CRCHelper.isCRCEnabled();
    const isSupportVirtualBackground =
      await zoom.virtualBackgroundHelper.isSupportVirtualBackground();
    const isMyselfSharing = await mySelf.getShareStatus();
    let options: typeof onMoreOptions = [
      // {
      //   text: `Mirror the video`,
      //   onPress: async () => {
      //     await zoom.videoHelper.mirrorMyVideo(!isVideoMirrored);
      //     setIsVideoMirrored(await zoom.videoHelper.isMyVideoMirrored());
      //   },
      // },
      // {
      //   text: `${canPlayMicTest ? 'Play' : 'Start'} Mic Test`,
      //   onPress: async () => {
      //     if (canPlayMicTest) {
      //       await zoom.testAudioDeviceHelper.playMicTest();
      //     } else {
      //       await zoom.testAudioDeviceHelper.startMicTest();
      //     }
      //   },
      // },
      // {
      //   text: `Stop Mic Test`,
      //   onPress: async () => {
      //     await zoom.testAudioDeviceHelper.stopMicTest();
      //   },
      // },
      // {
      //   text: `${startLiveTranscription ? 'Stop' : 'Start'} Live Transcription`,
      //   onPress: async () => {
      //     const canStartLiveTranscription =
      //       await zoom.liveTranscriptionHelper.canStartLiveTranscription();
      //     if (canStartLiveTranscription === true) {
      //       if (startLiveTranscription) {
      //         const error =
      //           await zoom.liveTranscriptionHelper.stopLiveTranscription();
      //         console.log('stopLiveTranscription= ' + error);
      //       } else {
      //         const error =
      //           await zoom.liveTranscriptionHelper.startLiveTranscription();
      //         console.log('startLiveTranscription= ' + error);
      //       }
      //     } else {
      //       Alert.alert('Live transcription not supported');
      //     }
      //   },
      // },
      // {
      //   text: `${
      //     isReceiveSpokenLanguageContentEnabled ? 'Disable' : 'Enable'
      //   } receiving original caption`,
      //   onPress: async () => {
      //     await zoom.liveTranscriptionHelper.enableReceiveSpokenLanguageContent(
      //       !isReceiveSpokenLanguageContentEnabled,
      //     );
      //     setIsReceiveSpokenLanguageContentEnabled(
      //       await zoom.liveTranscriptionHelper.isReceiveSpokenLanguageContentEnabled(),
      //     );
      //     console.log(
      //       'isReceiveSpokenLanguageContentEnabled = ' +
      //         isReceiveSpokenLanguageContentEnabled,
      //     );
      //   },
      // },
      {text: 'Switch Camera', onPress: () => zoom.videoHelper.switchCamera()},
      // {
      //   text: `${
      //     isOriginalAspectRatio ? 'Enable' : 'Disable'
      //   } original aspect ratio`,
      //   onPress: async () => {
      //     await zoom.videoHelper.enableOriginalAspectRatio(
      //       !isOriginalAspectRatio,
      //     );
      //     setIsOriginalAspectRatio(
      //       await zoom.videoHelper.isOriginalAspectRatioEnabled(),
      //     );
      //     console.log('isOriginalAspectRatio= ' + isOriginalAspectRatio);
      //   },
      // },
      // {
      //   text: `Get Session Dial-in Number infos`,
      //   onPress: async () => {
      //     console.log(
      //       'session number= ' + (await zoom.session.getSessionNumber()),
      //     );
      //   },
      // },
      {
        text: `${isMicOriginalOn ? 'Disable' : 'Enable'} Original Sound`,
        onPress: async () => {
          await zoom.audioSettingHelper.enableMicOriginalInput(
            !isMicOriginalOn,
          );
          console.log(
            `Original sound ${isMicOriginalOn ? 'Disabled' : 'Enabled'}`,
          );
          setIsMicOriginalOn(!isMicOriginalOn);
        },
      },
      // {
      //   text: 'Change chat privilege',
      //   onPress: async () => {
      //     await zoom.chatHelper.changeChatPrivilege(
      //       ZoomVideoSDKChatPrivilegeType.ZoomVideoSDKChatPrivilege_Publicly,
      //     );
      //   },
      // },
    ];

    // if (Platform.OS === 'android') {
    //   const isSupportFlashLight = await zoom.videoHelper.isSupportFlashlight();
    //   if (isSupportFlashLight) {
    //     options = [
    //       {
    //         text: `Enable flashlight`,
    //         onPress: async () => {
    //           const isFlahslightOn = await zoom.videoHelper.isFlashlightOn();
    //           if (isFlahslightOn) {
    //             console.log(
    //               await zoom.videoHelper.turnOnOrOffFlashlight(false),
    //             );
    //           } else {
    //             console.log(await zoom.videoHelper.turnOnOrOffFlashlight(true));
    //           }
    //         },
    //       },
    //       ...options,
    //     ];
    //   }
    // }

    // if (isSupportVirtualBackground) {
    //   options = [
    //     {
    //       text: `Select virtual background`,
    //       onPress: () => {
    //         selectVirtualBackgroundImage();
    //       },
    //     },
    //     {
    //       text: `Add virtual background`,
    //       onPress: () => {
    //         addVirtualBackgroundImage();
    //       },
    //     },
    //     ...options,
    //   ]
    // }

    // if (isSharing) {
    //     options = [
    //         {
    //           text: `${isShareDeviceAudio ? 'Disable' : 'Enable'} share device audio when sharing screen.`,
    //           onPress: async () => {
    //             const result = zoom.shareHelper.enableShareDeviceAudio(!isShareDeviceAudio);
    //             setIsShareDeviceAudio(!isShareDeviceAudio);
    //           },
    //         },
    //         ...options,
    //       ]
    // }

    // if (isMyselfSharing === ShareStatus.Pause) {
    //   options = [
    //     {
    //       text: `Resume share screen`,
    //       onPress: async () => {
    //         const res = await zoom.shareHelper.resumeShare();
    //       },
    //     },
    //     ...options,
    //   ];
    // } else if (isMyselfSharing === ShareStatus.Start) {
    //   options = [
    //     {
    //       text: `Pause share screen`,
    //       onPress: async () => {
    //         const res = await zoom.shareHelper.pauseShare();
    //       },
    //     },
    //     ...options,
    //   ];
    // }

    // if (canCallOutToCRC) {
    // options = [
    //     {
    //       text: `Call-out to CRC devices`,
    //       onPress: async () => {
    //         const result = await zoom.CRCHelper.callCRCDevice("bjn.vc", ZoomVideoSdkCRCProtocolType.ZoomVideoSDKCRCProtocol_H323);
    //         console.log('CRC result= ' + result);
    //       },
    //     },
    //     {
    //       text: `Cancel call-out to CRC devices`,
    //       onPress: async () => {
    //         const result = await zoom.CRCHelper.cancelCallCRCDevice();
    //         console.log('cancel result= ' + result);
    //       },
    //     },
    //     ...options,
    //   ]
    // }

    // if (isSupportPhoneFeature) {
    //   options = [
    //     ...options,
    //     {
    //       text: `Invite By Phone`,
    //       onPress: async () => {
    //         console.log(await zoom.phoneHelper.getSupportCountryInfo());
    //         zoom.phoneHelper.inviteByPhone(
    //           '<Country Code>',
    //           '<Phone Number>',
    //           '<Display Name>'
    //         );
    //       },
    //     },
    //   ];
    // }

    if (canSwitchSpeaker) {
      options = [
        ...options,
        {
          disabled: !isVideoOn,
          text: `Turn ${isSpeakerOn ? 'off' : 'on'} Speaker`,
          onPress: async () => {
            try {
              await zoom.audioHelper.setSpeaker(!isSpeakerOn);
              setIsSpeakerOn(!isSpeakerOn);
            } catch (err: any) {
              console.log(err);
            }
          },
        },
      ];
    }

    setOnMoreOptions(options);

    if (Platform.OS === 'android') {
      setModalVisible(true);
    }

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', ...options.map(option => option.text)],
          cancelButtonIndex: 0,
        },
        buttonIndex => {
          // eslint-disable-next-line eqeqeq
          if (buttonIndex != 0) {
            options[buttonIndex - 1].onPress();
          }
        },
      );
    }
  };

  const onClickChat = () => {
    setChatVisible(true);
  };

  return isInSession ? (
    <View style={{flex: 1, padding: 5}}>
      <Modal isOpen={modalVisible}>
        <View style={styles.moreListWrapper}>
          <View style={styles.moreList}>
            {onMoreOptions.map((option, index) => (
              <View key={index} style={styles.moreItemWrapper}>
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    option.onPress();
                    setModalVisible(false);
                  }}>
                  <Text style={styles.moreItemText}>{option.text}</Text>
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.cancelButton}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ModeratorGuide navigation={navigation} />
      <ScrollView style={styles.zoomContainer}>
        {users.map(user => (
          <VideoView
            user={user}
            focused={user.userId === user?.userId}
            //   onPress={selectedUser => setFullScreenUser(selectedUser)}
            //   onLongPress={selectedUser => onSelectedUser(selectedUser)}
            key={user.userId}
          />
        ))}
      </ScrollView>

      <View style={styles.controls}>
        <IonIcons
          size={30}
          color="white"
          onPress={() =>
            checkAndRequestPermission(
              onPressAudio,
              Platform.OS === 'ios'
                ? PERMISSIONS.IOS.MICROPHONE
                : PERMISSIONS.ANDROID.RECORD_AUDIO,
            )
          }
          name={isMuted ? 'mic-off-outline' : 'mic-outline'}
        />
        <IonIcons
          size={30}
          color="white"
          name={isVideoOn ? 'videocam-outline' : 'videocam-off-outline'}
          onPress={() =>
            checkAndRequestPermission(
              onPressVideo,
              Platform.OS === 'ios'
                ? PERMISSIONS.IOS.CAMERA
                : PERMISSIONS.ANDROID.CAMERA,
            )
          }
        />
        <IonIcons
          size={30}
          color="white"
          name={'options-outline'}
          onPress={onPressMore}
        />
        <IonIcons
          size={30}
          color="white"
          name={'chatbox-outline'}
          onPress={onClickChat}
        />
        <IonIcons
          color="red"
          onPress={leaveSession}
          name="call-outline"
          size={30}></IonIcons>
      </View>
      <Modal
        isOpen={chatVisible}
        onClose={() => setChatVisible(false)}
        size="full">
        <Modal.Content
          style={{
            padding: 0,
          }}
          size="full">
          <Modal.Header
            style={{
              paddingTop: 0,
              paddingLeft: 0,
              paddingRight: 0,
              paddingBottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
              height: 60,
            }}>
            <Text size="lg" weight="bold" color="gray.700">
              Chat
            </Text>
            <Modal.CloseButton />
          </Modal.Header>
          <FlatList
            contentContainerStyle={styles.chatList}
            // onTouchStart={onListTouchStart}
            // onTouchEnd={onListTouchEnd}
            data={chatMessages}
            // extraData={refreshFlatlist}
            renderItem={({item}) => {
              return (
                <View>
                  <View
                    style={{
                      ...styles.chatMessage,
                      alignSelf: item.isSelfSend ? 'flex-end' : 'flex-start',
                    }}>
                    {(!item.isSelfSend || item.receiverUser) && (
                      <Text style={styles.chatUser}>
                        {item.isChatToAll
                          ? `${item.senderUser.userName}:`
                          : item.receiverUser
                          ? `To ${item.receiverUser.userName}:`
                          : `${item.senderUser.userName} To Me:`}
                      </Text>
                    )}
                    <Text style={styles.chatContent}> {item.content}</Text>
                  </View>
                </View>
              );
            }}
            keyExtractor={(item, index) => `${String(item.timestamp)}${index}`}
            showsVerticalScrollIndicator={false}
            fadingEdgeLength={50}
            inverted
          />
          <View>
            <Select
              defaultValue=""
              selectedValue={selectedUserForChat}
              onValueChange={v => setSelectedUserForChat(v)}>
              <Select.Item label="Everyone" value="" />
              {users
                .filter(u => u.userId !== currentUser?.userId)
                .map(user => (
                  <Select.Item label={user.userName} value={user.userId} />
                ))}
            </Select>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
            }}>
            <TextInput
              style={styles.chatInput}
              value={chatMessage}
              placeholder="Type comment"
              placeholderTextColor="#AAA"
              onChangeText={text => {
                setChatMessage(text);
              }}
            />
            <View
              style={{
                height: 40,
                width: 40,
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: 6,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <IonIcons
                color="rgba(0,0,0,0.6)"
                onPress={sendChatMessage}
                name="send"
                size={30}></IonIcons>
            </View>
          </View>
        </Modal.Content>
      </Modal>
    </View>
  ) : (
    <View>
      <Loader />
    </View>
  );
};

export default ZoomMeeting;

const styles = StyleSheet.create({
  userList: {
    width: '100%',
  },
  userListContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  controls: {
    alignSelf: 'center',
    flexDirection: 'row',
    width: '100%',
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: 'rgb(40,40,40)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  controlButton: {
    marginBottom: 12,
  },
  zoomContainer: {
    padding: 20,
    gap: 10,
    backgroundColor: 'rgb(40,40,40)',
  },
  moreListWrapper: {
    marginHorizontal: 40,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 10,
    position: 'absolute',
    bottom: 0,
  },
  moreList: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  moreItemText: {
    textAlign: 'center',
    color: 'black',
  },
  moreItemWrapper: {
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    paddingHorizontal: 30,
    padding: 5,
    textAlign: 'center',
    fontSize: 90,
  },
  cancelButton: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    paddingTop: 20,
    paddingBottom: 20,
  },
  cancelButtonText: {
    color: 'blue',
    fontSize: 20,
  },
  chatList: {
    // paddingRight: 16,
  },
  chatMessage: {
    flexDirection: 'row',
    padding: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  chatUser: {
    fontSize: 14,
    color: '#CCC',
  },
  chatContent: {
    fontSize: 14,
    color: '#FFF',
  },
  chatInput: {
    height: 40,
    flex: 1,
    marginVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    // borderWidth: 1,
    // borderColor: '#666',
    color: 'black',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
});
