import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import WebView from 'react-native-webview';
import MaterialIconsCommunity from 'react-native-vector-icons/MaterialIcons';
import {useAppSelector} from '../../store/hooks';
import Loader from '../../components/Loader';
import { CONFIG } from '../../config/config';

const Survey = ({route, navigation}: any) => {
  const [loading, setLoading] = React.useState(true);
  const handleMessage = async (e: any) => {
    const res = JSON.parse(e.nativeEvent.data);
    if (res.error) {
      navigation.goBack();
    }
    if (res.loading) {
      setLoading(res.loading.value)
    }
    if (res.data) {
      setLoading(true);
      await handleSurvey(res.data);
      setLoading(false);
      navigation.goBack();
    }
  };

  const forumId = useAppSelector(state => state.appData.value.forumInfo?.uuid);
  const {uuid, type, handleSurvey} = route.params;

  return (
    <View style={{flex: 1}}>
      <SafeAreaView />
      <View style={styles.header}>
        <MaterialIconsCommunity
          name="arrow-back-ios"
          size={20}
          onPress={() => navigation.goBack()}></MaterialIconsCommunity>
      </View>
      <View style={{flex: 1}}>
        <WebView
          source={{
            uri: `${CONFIG.api.callback}/forum_experience/${forumId}/lesson/${uuid}/survey-mobile`,
          }}
          sharedCookiesEnabled={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={handleMessage}
        />
        {loading ? (
          <View style={{position: 'absolute', height: '100%', width: '100%', backgroundColor: 'white'}}>
            <Loader />
          </View>
        ) : (
          <></>
        )}
      </View>
    </View>
  );
};

export default Survey;

const styles = StyleSheet.create({
  header: {
    padding: 20,
  },
});
