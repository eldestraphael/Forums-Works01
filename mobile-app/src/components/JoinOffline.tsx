import {
  Platform,
  StyleSheet,
  View,
  NativeModules,
  ActivityIndicator,
  PermissionsAndroid,
} from 'react-native';
import {BleManager, State} from 'react-native-ble-plx';
import React, {useState} from 'react';
import {Box, Divider, ScrollView} from 'native-base';
import {
  check,
  Permission as RNPermission,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';
import Text from './RNText';
import {theme} from '../theme/theme';
import IonIcons from 'react-native-vector-icons/Ionicons';
import LoadingButton from './loaderButton';
import {
  convertUtcTimeToLocalTime,
  useInterval,
  utcToLocal,
} from '../utils/helpers';
import api from '../utils/api';
import {retrieveData} from '../utils/localStorage';
import {ApiResponse} from '../model/base';
import {ForumMembers, MeetingStatus} from '../model/meeting';
import {useAppSelector} from '../store/hooks';
import ModeratorGuide from './ModeratorGuide';

type TestType = {
  productId: number;
  productName: string;
};

const {CustomMethods, BleAdvertiser} = NativeModules;

const manager = new BleManager();

const requestBluetoothPermissions = async () => {
  if (Platform.OS === 'ios') {
    const status = await request(PERMISSIONS.IOS.BLUETOOTH);
    console.log(status);
    if (status !== RESULTS.GRANTED) {
      console.warn('Bluetooth permission denied');
    }
  }
  if (Platform.OS === 'android') {
    const status = await request(PERMISSIONS.ANDROID.BLUETOOTH_SCAN);
    console.log(status);
    if (status !== RESULTS.GRANTED) {
      console.warn('Bluetooth permission denied');
    }
  }
};

interface Member {
  name: string;
  status: true | false | null;
}

const Member = ({name, status}: Member) => {
  const icon = status === true ? 'checkmark-circle' : 'close-circle';
  const iconColor = status === true ? '#65B741' : '#FF0000';
  const joinStatus =
    status === true ? 'Joined' : status === false ? 'Pending' : 'Not Joined';
  const [formValue, setFormValue] = useState({
    productId: '',
    value: '',
    specs: 'asdjasd',
  });

  const testFn = (e: any) => {
    const name = e.target.name; //specs
    const value = e.target.value; //3

    setFormValue({...formValue, [name]: value});
  };

  return (
    <Box style={styles.member}>
      <Text size="md" weight="semibold" style={{flex: 2}}>
        {name}
      </Text>
      <Box
        style={{flexDirection: 'row', flex: 1, alignItems: 'center', gap: 5}}>
        <IonIcons color={iconColor} size={20} name={icon}></IonIcons>
        <Text size="md" color={iconColor}>
          {joinStatus}
        </Text>
      </Box>
    </Box>
  );
};

interface Config {
  token: string;
  sessionName: string;
  userName: string;
  userId: string;
  meetingUuid: string;
  meetingStatusUuid: string;
}

const JoinOffline = ({navigation, route}: any) => {
  const config: Config = route.params;

  const forumInfo = useAppSelector(state => state.appData.value.forumInfo);

  const [devices, setDevices] = React.useState<string[]>([]);
  const [delay, setDelay] = React.useState<number | null>(5000);
  const [meetingStatusInterval, setMeetingStatusInterval] = React.useState<
    number | null
  >(2000);
  const [meetingJoined, setMeetingJoined] = React.useState(false);
  const [meetingData, setMeetingData] = React.useState<MeetingStatus | null>(
    null,
  );
  const [members, setMembers] = React.useState<ForumMembers | null>(null);
  //GET MEETING MEMBERS
  const getMembersInTheMeeting = async () => {
    const forumId = await retrieveData('forum_uuid');
    try {
      const data: ApiResponse<ForumMembers | null> = await api.get(
        `/forumexperience/${forumId}/meeting/${config.meetingUuid}/members`,
      );
      if (data.data) {
        setMembers(data.data);
      }
    } catch (err: any) {
      console.log('ERROR', err.statusCode);
    }
  };

  React.useEffect(() => {
    getMembersInTheMeeting();
  }, []);

  const leaveMeeting = () => {
    navigation.goBack();
  };

  useInterval(getMembersInTheMeeting, delay);

  React.useEffect(() => {
    requestBluetoothPermissions();
    if (!manager) {
      return;
    }
    const stateChangeListener = manager.onStateChange(async state => {
      if (state === State.PoweredOn) {
        scanForDevices();
        startAdvertising();
      }
      if (state === State.PoweredOff && Platform.OS === 'android') {
        await manager.enable();
      }
    });
    return () => {
      stateChangeListener?.remove();
    };
  }, [manager]);

  const requestPermission = async (permission: RNPermission) => {
    const result = await request(permission);
    return result;
  };

  const checkPermission = async (permission: RNPermission) => {
    const result = await check(permission);
    return result;
  };

  const checkAndRequestPermission = async (permission: RNPermission) => {
    const isGranted = await checkPermission(permission);
    if (isGranted !== RESULTS.GRANTED) {
      const request = await requestPermission(permission);
      if (request !== RESULTS.GRANTED) {
        return;
      }
    }
  };

  const requestAdvertisingPermission = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      ]);
    }
    if (Platform.OS === 'ios') {
      await checkAndRequestPermission(PERMISSIONS.IOS.BLUETOOTH);
    }
  };

  const startAdvertising = async () => {
    await requestAdvertisingPermission();
    stopAdvertising();
    await new Promise((resolve, reject) =>
      setTimeout(async () => {
        await requestAdvertisingPermission();
        if (Platform.OS === 'android') {
          BleAdvertiser?.startAdvertising(config.userId.slice(0, 20));
        }
        if (Platform.OS === 'ios') {
          CustomMethods?.startAdvertising(config.userId.slice(0, 20));
        }
        setMeetingStatusInterval(2000);
        resolve(true);
      }, 7000),
    );
  };

  const stopAdvertising = () => {
    if (Platform.OS === 'android') {
      BleAdvertiser?.stopAdvertising();
    }
    if (Platform.OS === 'ios') {
      CustomMethods?.stopAdvertising();
    }
  };

  React.useEffect(() => {
    setTimeout(() => {
      setMeetingStatusInterval(null);
    }, 90 * 1000);
  }, []);

  const getMyMeetingStatus = async () => {
    const {data}: ApiResponse<MeetingStatus | null> = await api.get(
      `forumexperience/${forumInfo?.uuid}/joinmeeting/status`,
    );
    if (data) {
      setMeetingJoined(data.status || false);
      setMeetingData(data);
    }
    if (data?.status) {
      setMeetingStatusInterval(null);
      stopAdvertising();
      setMeetingStatusInterval(null);
    }
  };

  useInterval(getMyMeetingStatus, meetingStatusInterval);

  const checkBluetoothEnabled = async () => {
    const state = await manager.state();
    if (state === State.PoweredOff) {
      await manager.enable();
    }
    startAdvertising();
    scanForDevices();
  };

  React.useEffect(() => {
    checkBluetoothEnabled();
  }, []);

  const updateMeetingStatus = async () => {
    if (!devices.length) {
      return;
    }

    const payload = {
      type: 'bluetooth',
      meeting_uuid: config.meetingUuid,
      device_id: devices,
      status: true,
    };
    setDevices([]);
    const data: ApiResponse<MeetingStatus | null> = await api.put(
      `forumexperience/${forumInfo?.uuid}/joinmeeting/status`,
      payload,
    );
    // getMyMeetingStatus();
  };

  useInterval(updateMeetingStatus, 2000);

  const scanForDevices = () => {
    if (!manager) {
      return;
    }

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
        return;
      }

      console.log(device?.localName);

      const isForumMember = members?.member_status.find(
        x => x.user_info.uuid.slice(0, 20) === device?.localName,
      );

      if (
        device &&
        device.localName &&
        isForumMember &&
        isForumMember.status !== true
      ) {
        setDevices(prevDevices => {
          const deviceExists = prevDevices.some(d => d === device.localName);
          if (!deviceExists) {
            return [...prevDevices, device.localName!];
          }
          return prevDevices;
        });
      }
    });

    setTimeout(() => {
      manager.stopDeviceScan();
    }, 4000);
  };

  useInterval(scanForDevices, 6000);

  if (!meetingData || !meetingData?.status) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'white',
          gap: 20,
          paddingHorizontal: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text weight="bold" color="orange.400" style={{textAlign: 'center'}}>
          Please make sure that your device Bluetooth is turned ON
        </Text>
        <ActivityIndicator animating={true} color={theme.colors.primaryBlue} />
        <Text
          weight="bold"
          color={theme.colors.primaryBlue}
          style={{textAlign: 'center'}}>
          Please place your mobile next to another forum member's mobile.
        </Text>
        <Text
          weight="bold"
          color={theme.colors.primaryBlue}
          style={{textAlign: 'center'}}>
          If no one is present please wait till another member arrives. We'll
          check in both of you according to your individual check-in time
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'white',
        gap: 20,
        justifyContent: 'space-between',
      }}>
      <Box style={{width: '100%', flex: 1}}>
        <Box style={styles.topSection}>
          <Box
            style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Box>
              <Text size="sm" color="gray.400" weight="semibold">
                Member Name
              </Text>
              <Text size="md" weight="semibold">
                {config.userName}
              </Text>
            </Box>
            <ModeratorGuide navigation={navigation}/>
          </Box>
          <Box style={styles.row}>
            <Box style={{flex: 3}}>
              <Text size="sm" weight="semibold" color="gray.400">
                Forum
              </Text>
              <Text style={styles.highlighted} size="md" weight="semibold">
                {forumInfo?.forum_name}
              </Text>
            </Box>
            <Box style={{flex: 2}}>
              <Text size="sm" weight="semibold" color="gray.400">
                Meeting Time
              </Text>
              <Text style={styles.highlighted} size="md" weight="semibold">
                {convertUtcTimeToLocalTime(meetingData?.meeting_time)}
              </Text>
            </Box>
          </Box>
          <Box style={styles.row}>
            <Text
              size="md"
              style={{...styles.highlighted, textAlign: 'center'}}
              weight="semibold">
              Forum Meeting Started At:{' '}
              {utcToLocal(meetingData?.started_at!)?.time}
            </Text>
          </Box>
          <Box style={styles.row}>
            <Text
              size="md"
              weight="semibold"
              color="rgb(105,134,225)"
              style={{textAlign: 'center', width: '100%'}}>
              Your Check-in Time:{' '}
              {utcToLocal(meetingData?.user_checkin_time!)?.time}
            </Text>
          </Box>
        </Box>
        <ScrollView style={{width: '100%'}}>
          <Box style={styles.membersList}>
            {members &&
              members?.member_status
                .filter(x => x.user_info.uuid !== config.userId)
                .map((member, index) => {
                  return (
                    <>
                      <Member
                        name={member.user_info.first_name}
                        status={member.status}
                      />
                      {index < members.member_status.length - 1 && <Divider />}
                    </>
                  );
                })}
          </Box>
        </ScrollView>
      </Box>
      <Box>
        <LoadingButton
          onPress={leaveMeeting}
          text="Leave Meeting"></LoadingButton>
      </Box>
    </View>
  );
};

export default JoinOffline;

const styles = StyleSheet.create({
  topSection: {
    padding: 20,
    gap: 20,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  membersList: {
    flex: 1,
  },
  member: {
    paddingVertical: 20,
    paddingHorizontal: 30,
    backgroundColor: theme.colors.backgroundColor,
    flexDirection: 'row',
  },
  highlighted: {
    // flex: 1,
    width: '100%',
    padding: 10,
    backgroundColor: theme.colors.backgroundColor,
  },
  row: {
    width: '100%',
    gap: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    // backgroundColor: 'red',
  },
});
