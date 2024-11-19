import {StyleSheet, View} from 'react-native';
import React from 'react';
import Text from '../../components/RNText';
import Chat from '../../components/Chat';
import MaterialIconsCommunity from 'react-native-vector-icons/MaterialIcons';
import {Box, ScrollView} from 'native-base';

const Stories = ({navigation}: any) => {
  // const navigation = useNavigation();

  const handleBack = () => {
    navigation.goBack('FeedScreen');
  };
  return (
    <ScrollView>
      <View style={styles.container}>
        {/* {chatItems.map(item => (
          <Chat {...item} />
        ))} */}
        <Box
          bg="emerald.200"
          style={{borderRadius: 10, paddingVertical: 20, paddingHorizontal: 30}}
          borderWidth={0.5}
          borderColor="emerald.400">
          <Text color="emerald.900" style={{textAlign: 'center'}}>
            You have completed the action step for this week
          </Text>
        </Box>
      </View>
    </ScrollView>
  );
};

export default Stories;

const styles = StyleSheet.create({
  container: {
    padding: 30,
    gap: 20,
  },
});
