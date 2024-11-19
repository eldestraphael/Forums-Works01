import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  View,
} from 'react-native';
import React from 'react';
import Card from '../../components/Card';
import {theme} from '../../theme/theme';
import Text from '../../components/RNText';
import CircleIcon from '../../components/CircleIcon';
import api from '../../utils/api';
import {useNavigation} from '@react-navigation/native';
import {storeData, storeObject} from '../../utils/localStorage';
import Loader from '../../components/Loader';
import { Divider, Image, Pressable } from 'native-base';
import { useAppDispatch } from '../../store/hooks';
import { setForumInfo } from '../../store/slices/appDataSlice';
import { AllForums, ForumInfo } from '../../model/forums';
import { round } from '../../utils/helpers';

interface Get<T> {
  message: string;
  data: T;
}



const numColumns = 2;

const Forums = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch()
  const [data, setData] = React.useState<AllForums[]>();
  const fetchForumInfo = async () => {
    const response = await api.get<Get<AllForums[]>>(`forum?page=1&limit=100`);
    setData(response.data);
  };
  React.useEffect(() => {
    fetchForumInfo();
  }, []);

  const handleForumClick = async (forumInfo: ForumInfo) => {
    await storeData('forum_uuid', forumInfo.uuid);
    await storeObject('forum_info', forumInfo)
    dispatch({type: 'RESET' })
    dispatch(setForumInfo(forumInfo))
    navigation.reset({
      index: 0,
      routes: [{name: 'Home'}] as any,
    });
  };

  const renderItem = ({item: {forum_info}}: {item: AllForums}) => {
    return (
      <Pressable
        style={styles.item}
        onPress={() => handleForumClick(forum_info)}
        >

        <Card style={styles.item}>
          <Text color='black' weight={400}>{forum_info?.forum_name}</Text>
          <Text color='gray.600'>
            {forum_info?.company_info?.company_name}
          </Text>
          <Divider />
          <View style={{flexDirection: 'row', gap: 5}}>
            <Image
              style={{width: 20, height: 20}}
              alt='icon'
              source={require('../../../assets/images/group.png')}
            />
            <Text weight={600}>{forum_info.total_users}</Text>
          </View>
          <Text weight={400}>Forum Momentum</Text>
          <View style={{flexDirection: 'row', gap: 5,alignItems:"center"}}>
            <CircleIcon score={forum_info.health * 10} />
            <Text weight={600}>{Math.round(forum_info.health * 10)}%</Text>
          </View>
        </Card>
      </Pressable>
    );
  };

  if (!data) {
    return (
      <Loader/>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.forum_info.uuid}
        numColumns={numColumns}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

export default Forums;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.backgroundColor,
  },
  row: {
    flex: 1,
    gap: 10,
    backgroundColor: theme.colors.backgroundColor,
    paddingBottom: 10,
  },
  item: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  text: {
    color: '#000',
  },
});
