import {StyleSheet, View} from 'react-native';
import React from 'react';
import Card from '../../../components/Card';
import {Box, Button} from 'native-base';
import Text from '../../../components/RNText';
import JoinMeetingModal from './JoinMeetingModal';
import {getLocalTimezone, utcToLocal} from '../../../utils/helpers';
import {ForumuserData} from '../../../model/user';

interface JoinMeeting {
  nextMeeting: string;
  navigation: any;
  userData: ForumuserData | null;
  isButtonEnabled: boolean;
  setIsButtonEnabled: any
}

const JoinMeeting = ({
  nextMeeting,
  navigation,
  userData,
  isButtonEnabled,
  setIsButtonEnabled
}: JoinMeeting) => {
  const [showModal, setShowModal] = React.useState(false);
  const {day, date} = utcToLocal(nextMeeting);
  const tzName = getLocalTimezone()
  const firstName = userData?.data?.user_info?.first_name || ''
  const userId = userData?.data.user_info.uuid || ''
  //USE EFFECT TO MONITOR THE MEETING TIME
  React.useEffect(() => {
    const checkTime = () => {
      // COVERT MEETING TIME FROM UTC TO LOCAL TIME
      const meetingTimeLocal: any = new Date(nextMeeting + 'Z');
      const currentTime: any = new Date();
      const timeDifference = meetingTimeLocal - currentTime;

      // ENABLE THE BUTTON 5 MIN BEFORE THE MEETING
      if (timeDifference <= 5 * 60 * 1000 && timeDifference >= -5400000) {
        setIsButtonEnabled(true);
      } else {
        setIsButtonEnabled(false);
      }
    };

    //CHECK THE INITLIAL TIME
    checkTime();

    // SET INTREVAL TO CHECK THE TIME EVERY SECOND
    const intervalId = setInterval(checkTime, 1000);

    // CLEAN UP THE INTREVAL ON COMPONENT UNMOUT ]
    return () => clearInterval(intervalId);
  }, [nextMeeting]);

  return (
    <>
      <Card style={{flexDirection: 'row'}}>
        <Button
          bg={!isButtonEnabled ? 'gray.400' : 'blue.500'}
          style={styles.button}
          disabled={!isButtonEnabled}
          onPress={() => setShowModal(true)}>
          Join Meeting
        </Button>
        <Box style={{flex: 1}}>
          <Text>Next Meeting: {day}</Text>
          <Text style={{flexShrink: 1}} size='xs' weight="bold">{date} ({tzName})</Text>
        </Box>
      </Card>
      <JoinMeetingModal
        userName={firstName}
        userId={userId}
        navigation={navigation}
        showModal={showModal}
        setShowModal={setShowModal}
      />
    </>
  );
};

export default JoinMeeting;

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    paddingLeft: 20,
    paddingRight: 20,
  },
});
