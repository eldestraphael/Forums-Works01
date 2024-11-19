import {StyleSheet, View} from 'react-native';
import React from 'react';
import Text from '../../components/RNText';
import {Box, ScrollView, TextArea} from 'native-base';
import LoadingButton from '../../components/loaderButton';
import MaterialIconsCommunity from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {ActionStepData} from '../../model/feed';
import Stories from './Stories';
import Chat from '../../components/Chat';
import {ForumuserData} from '../../model/user';
import Loader from '../../components/Loader';

interface ShareStoryNavigationProps {
  data: number[];
  actionStepData: ActionStepData | null;
  navigation: any;
  userData: ForumuserData | null;
  postActionStepMessage: (message: string, cb: any) => Promise<void>;
}

const ShareStory = ({navigation, route}: any) => {
  const {
    actionStepData,
    userData,
    postActionStepMessage,
  }: ShareStoryNavigationProps = route.params;
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState(actionStepData);

  const scrollViewRef = React.useRef<any>(null);

  if (!data || !userData) {
    return <Loader />;
  }

  const tooltipDialog = () => {
    let dialog = 'Be the first to complete the action step.';
    const userNames = data.other_user_first_names;
    if (userNames.length) {
      dialog = `${userNames[0]} ${
        userNames.length === 2
          ? `and 1 other `
          : userNames.length > 2
          ? `and ${userNames.length - 1} others `
          : ''
      }has completed this action steps.`;
    }
    return dialog;
  };

  const callback = (data: ActionStepData) => {
    setData(data);
  };

  const handleBack = () => {
    navigation.goBack();
  };
  const handleSubmit = async () => {
    try {
      if (message && message !== '') {
        setLoading(true);
        await postActionStepMessage(message, callback);
      }
    } catch (error) {
      //need to handle errors
    }
    setLoading(false);
  };
  return (
    <ScrollView
      style={{backgroundColor: 'white'}}
      ref={scrollViewRef}
      onContentSizeChange={() =>
        scrollViewRef?.current?.scrollToEnd({animated: true})
      }>
      <Box style={{flexDirection: 'row', padding: 20, gap: 20}}>
        <MaterialIconsCommunity
          name="arrow-back-ios"
          size={20}
          onPress={handleBack}
        />
        <Text weight="bold" style={styles.headerText}>
          {data.action_step_info.name}
        </Text>
      </Box>
      {data?.message.length ? (
        <View style={styles.container}>
          {data.message.map(({action_step_message}) => {
            const sentByYou =
              action_step_message.user_info.email ===
              userData.data.user_info.email;
            return (
              <Chat
                name={action_step_message.user_info.first_name}
                content={action_step_message.message}
                date={action_step_message.createdAt}
                sentByOthers={!sentByYou}
              />
            );
          })}
          <Box
            bg="emerald.200"
            style={{
              borderRadius: 10,
              paddingVertical: 20,
              paddingHorizontal: 30,
            }}
            borderWidth={0.5}
            borderColor="emerald.400">
            <Text color="emerald.900" style={{textAlign: 'center'}}>
              You have completed the action step for today
            </Text>
          </Box>
        </View>
      ) : (
        <View style={styles.container}>
          <Box style={{alignItems: 'center', gap: 20}}>
            <Text color="gray.500" style={{flexShrink: 1}}>
              {data.action_step_info.description}
            </Text>
            <Box style={styles.toolTip}>
              <Text color="white" style={{textAlign: 'center'}}>
                {tooltipDialog()}
              </Text>
              <Box style={styles.tooltiptip}></Box>
            </Box>
            <Text weight="bold" color="blue.500">
              Type yours to see their story
            </Text>
          </Box>
          <TextArea
            h={40}
            _input={{
              selectionColor: undefined,
              cursorColor: undefined,
            }}
            value={message}
            onChangeText={e => setMessage(e)}
            autoCompleteType={true}
            placeholder="Type your story here..."
          />
          <LoadingButton
            isLoading={loading}
            text="Submit"
            onPress={handleSubmit}
          />
        </View>
      )}
    </ScrollView>
  );
};

export default ShareStory;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    gap: 30,
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 30,
  },
  toolTip: {
    borderRadius: 10,
    padding: 20,
    backgroundColor: 'rgb(105,134,225)',
  },
  tooltiptip: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 0,
    borderLeftWidth: 10,
    borderTopColor: 'rgb(105,134,225)',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
  },
  headerText: {
    textAlign: 'center',
    fontSize: 16,
    flexShrink: 1,
  },
});
