import {RefreshControl, ScrollView, StyleSheet, View} from 'react-native';
import React from 'react';
import Card from '../../../components/Card';
import Text from '../../../components/RNText';
import { ForumInfo } from '../Info';
import CircleIcon from '../../../components/CircleIcon';
import Loader from '../../../components/Loader';

interface MemberCard {
  name: string;
  companyName: string;
  score: number;
}

const MemberCard = ({name, companyName, score}: MemberCard) => {

  return (
    <Card style={styles.memberCardStyle}>
      <View style={{gap: 10, flex: 7}}>
        <Text weight="400">{name}</Text>
        <Text color='gray.700'>{companyName}</Text>
      </View>
      <View style={{gap: 10, flex: 3}}>
        <Text weight="400">Momentum</Text>
        <View style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
          <CircleIcon score={score}/>
          <Text weight="bold">{score}%</Text>
        </View>
      </View>
    </Card>
  );
};

interface MembersTab {
  data: ForumInfo | undefined;
  refreshing: boolean;
  onRefresh: () => void
}

const MembersTab = ({data, refreshing, onRefresh}: MembersTab) => {
  
  if(!data) {
    return <Loader/>
  }

  return (
    <ScrollView refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
    } style={styles.tabContainer}>
      <Text weight="600" style={{alignSelf: 'center', paddingBottom: 20}}>
        Forum : {data.forum_info.forum_name}
      </Text>
      <View style={{gap: 20,paddingBottom:20}}>
        {data.forum_info.members.map(item => {
          const name = (item.first_name || '')+ " " + (item.last_name || '')
          return <MemberCard score={item.health * 10} name={name} companyName={item.email}></MemberCard>;
        })}
      </View>
    </ScrollView>
  );
};

export default MembersTab;

const styles = StyleSheet.create({
  tabContainer: {
    display: 'flex',
    // paddingTop: 20,
    backgroundColor: 'white',
    flex: 1,
    gap: 20,
  },
  memberCardStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 30,
    paddingVertical: 20,
    paddingBottom:10
  }
});
