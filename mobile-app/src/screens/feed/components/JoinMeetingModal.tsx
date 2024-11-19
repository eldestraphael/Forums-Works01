import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Box, Center, Image, Modal, Pressable} from 'native-base';
import Card from '../../../components/Card';
import api from '../../../utils/api';
import {retrieveData} from '../../../utils/localStorage';
import {ApiResponse} from '../../../model/base';
import {JoinMeetingRes, ZoomConfig} from '../../../model/zoom';
import {jwtDecode} from 'jwt-decode';
import Loader from '../../../components/Loader';

interface JoinMeetinModal {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  navigation: any;
  userName: string;
  userId: string;
}

type MeetingType = 'zoom' | 'bluetooth'

const JoinMeetingModal = ({
  showModal,
  setShowModal,
  navigation,
  userName,
  userId
}: JoinMeetinModal) => {
  const [loading, setLoading] = React.useState(false);

  const joinMeetingApi = async (type: MeetingType) => {
    setLoading(true);
    const forumId = await retrieveData('forum_uuid');
    console.log(forumId);
    try {
      const res: ApiResponse<JoinMeetingRes> = await api.post(
        `forumexperience/${forumId}/joinmeeting`,
        {
          type,
          device_id: type === 'bluetooth' ? userId.slice(0, 20) : undefined
        },
      );
      const token = res.data.token;
      const tokenParsedData: any = token ? jwtDecode(token) : null;
      const config = {
        token: res?.data?.token,
        sessionName: tokenParsedData?.tpc,
        userName: userName,
        userId,
        meetingUuid: res.data.meeting_uuid,
        meetingStatusUuid: res.data.meeting_status_uuid,
      };
      setLoading(false);
      return config
    } catch (err: any) {
      console.log(err.response.data);
    }
    setLoading(false);
  };

  const joinVirtually = async() => {
    const config = await joinMeetingApi('zoom')
    setShowModal(false);
    navigation.navigate('ZoomMeeting', config);
  };

  const joinOffline = async () => {
    const config = await joinMeetingApi('bluetooth')
    setShowModal(false);
    navigation.navigate('JoinOffline', config);
  };

  return (
    <Center>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        {loading ? (
          <Loader />
        ) : (
          <Modal.Content maxWidth="400px">
            <Modal.CloseButton />
            <Modal.Body>
              <Box style={styles.content}>
                <Pressable onPress={joinVirtually}>
                  <Card style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Image
                      style={{width: 50, height: 50}}
                      alt="icon"
                      source={require('../../../../assets/images/Feed/online.png')}
                    />
                    <Text>Join Virtually</Text>
                  </Card>
                </Pressable>
                <Pressable onPress={joinOffline}>
                  <Card style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Image
                      style={{width: 50, height: 50}}
                      alt="icon"
                      source={require('../../../../assets/images/Feed/offline.png')}
                    />
                    <Text>Join offline</Text>
                  </Card>
                </Pressable>
              </Box>
            </Modal.Body>
          </Modal.Content>
        )}
      </Modal>
    </Center>
  );
};

export default JoinMeetingModal;

const styles = StyleSheet.create({
  content: {
    padding: 30,
    gap: 20,
  },
});
