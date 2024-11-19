import {RefreshControl, ScrollView, StyleSheet, View} from 'react-native';
import React from 'react';
import Card from '../../../components/Card';
import Text from '../../../components/RNText';
import {ForumInfo} from '../Info';
import Loader from '../../../components/Loader';
import {convertUTCToLocal, getLocalTimezone} from '../../../utils/helpers';
import {Table, Rows} from 'react-native-table-component';
import {ForumuserData} from '../../../model/user';
import {theme} from '../../../theme/theme';

function formatTime(timeString: string) {
  if (!timeString) {
    return '';
  }
  const [hourString, minute] = timeString.split(':');
  const hour = +hourString % 24;
  return (hour % 12 || 12) + ':' + minute + ' ' + (hour < 12 ? 'AM' : 'PM');
}

interface InfoTab {
  data: ForumInfo | undefined;
  refreshing: boolean;
  onRefresh: () => void;
  userData: ForumuserData | undefined;
}

const InfoTab = ({data, refreshing, userData, onRefresh}: InfoTab) => {
  if (!data || !userData) {
    return <Loader />;
  }

  const {time, day, utcDateString} = convertUTCToLocal(
    data.forum_info.meeting_day.trim(),
    data.forum_info.meeting_time.trim(),
  );

  const tzName = getLocalTimezone();

  const {first_name, last_name, job_title, company_info, email} =
    userData.data.user_info;

  const userInfoTableData = [
    [
      <Text style={{paddingVertical: 5}}>USER NAME</Text>,
      <Text style={{paddingVertical: 5}} color="gray.600">
        : {`${first_name} ${last_name}`}
      </Text>,
    ],
    [
      <Text style={{paddingVertical: 5}}>COMPANY</Text>,
      <Text style={{paddingVertical: 5}} color="gray.600">
        : {company_info.company_name}
      </Text>,
    ],
    [
      <Text style={{paddingVertical: 5}}>JOB TITLE</Text>,
      <Text style={{paddingVertical: 5}} color="gray.600">
        : {job_title}
      </Text>,
    ],
    [
      <Text style={{paddingVertical: 5}}>EMAIL</Text>,
      <Text style={{paddingVertical: 5}} color="gray.600">
        : {email}
      </Text>,
    ],
  ];

  const forumInfoData = [
    [
      <Text style={{paddingVertical: 5}}>FORUM NAME</Text>,
      <Text style={{paddingVertical: 5}} color="gray.600">
        : {data?.forum_info?.forum_name}
      </Text>,
    ],
    [
      <Text style={{paddingVertical: 5}}>MEETING DAY & TIME</Text>,
      <Text style={{paddingVertical: 5}} color="gray.600">
        : {`${day}, ${time} (${tzName})`}
      </Text>,
    ],
  ];
  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      style={styles.tabContainer}>
      <Card>
        <Table>
          <Rows
            flexArr={[1, 2]}
            textStyle={styles.rowStyle}
            data={userInfoTableData}></Rows>
        </Table>
        <Card style={{backgroundColor: theme.colors.backgroundColor}}>
          <Table>
            <Rows
              flexArr={[1, 2]}
              textStyle={styles.rowStyle}
              data={forumInfoData}></Rows>
          </Table>
        </Card>
      </Card>
    </ScrollView>
  );
};

export default InfoTab;

const styles = StyleSheet.create({
  tabContainer: {
    paddingHorizontal: 10,
    backgroundColor: 'white',
    flex: 1,
  },
  rowStyle: {
    textAlign: 'left',
    // color: 'grey',
    paddingVertical: 5,
  },
  cardStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonStyle: {
    borderRadius: 5,
  },
});
