import {
  Animated,
  Dimensions,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import React from 'react';
import InfoTab from './tabs/InfoTab';
import MembersTab from './tabs/MembersTab';
import api from '../../utils/api';
import {retrieveData} from '../../utils/localStorage';
import {SceneMap, TabView} from 'react-native-tab-view';
import {Box} from 'native-base';
import DashboardTab from '../dashboard/DashboardTab';
import {ForumuserData} from '../../model/user';

interface GetById<T> {
  message: string;
  data: T;
}

export interface Members {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  job_title: string;
  health: number;
}
export interface ForumInfo {
  forum_info: {
    id: number;
    uuid: string;
    forum_name: string;
    meeting_day: string;
    meeting_time: string;
    company_info: {
      uuid: string;
      company_name: string;
    };
    members: Members[];
    createdAt: string;
    updatedAt: string;
  };
}

const initialLayout = {
  width: Dimensions.get('window').width,
};

export default function Info() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [data, setData] = React.useState<ForumInfo>();
  const [userData, setUserData] = React.useState<ForumuserData>();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {
      key: 'info',
      title: 'Info',
    },
    {
      key: 'members',
      title: 'Members',
    },
    {
      key: 'dashboard',
      title: 'Dashboard',
    },
  ]);

  const renderTabBar = (props: any) => {
    const inputRange = props.navigationState.routes.map(
      (x: any, i: number) => i,
    );
    return (
      <Box flexDirection="row" style={styles.tabBar}>
        {props.navigationState.routes.map((route: any, i: number) => {
          const color = index === i ? 'rgb(105,134,225)' : 'transparent';
          const titleColor = index === i ? 'white' : 'grey';
          return (
            <Box
              style={styles.tabBarItemStyle}
              backgroundColor={color}
              flex={1}
              alignItems="center"
              p="3">
              <Pressable
                onPress={() => {
                  setIndex(i);
                }}>
                <Animated.Text
                  style={{
                    color: titleColor,
                  }}>
                  {route.title}
                </Animated.Text>
              </Pressable>
            </Box>
          );
        })}
      </Box>
    );
  };

  const fetchForumInfo = async () => {
    const uuid = await retrieveData('forum_uuid');
    const response = await api.get<GetById<ForumInfo>>(
      `admin/forum?uuid=${uuid}`,
    );
    const userData: ForumuserData = await api.get(`user/me`);
    setData(response.data);
    setUserData(userData);
    setRefreshing(false);
  };
  React.useEffect(() => {
    fetchForumInfo();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchForumInfo();
  }, []);

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <TabView
        renderScene={SceneMap({
          info: () => InfoTab({data, userData, refreshing, onRefresh}),
          members: () => MembersTab({data, refreshing, onRefresh}),
          dashboard: DashboardTab,
        })}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        style={{
          backgroundColor: 'white'
        }}
        navigationState={{index, routes}}></TabView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarItemStyle: {
    borderRadius: 30,
    margin: 5,
  },

  tabBar: {
    borderRadius: 30,
    margin: 10,
    padding: 3,
    backgroundColor: 'rgb(246,245,250)',
  },

  spacing: {
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    flex: 1,
  },
  tabBarStyle: {
    borderRadius: 30,
    margin: 10,
    paddingHorizontal: 5,
    backgroundColor: 'rgb(246,245,250)',
  },
  tabBarIndicator: {
    top: 5,
    height: 48,
    borderRadius: 30,
    width: 105,
    marginHorizontal: 5,
    backgroundColor: 'rgb(105,134,225)',
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
