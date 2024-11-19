import {RefreshControl, StyleSheet, View} from 'react-native';
import React from 'react';
import {Box, Button, ScrollView} from 'native-base';
import {buildCreateSlice} from '@reduxjs/toolkit';
import Text from '../../components/RNText';
import Card from '../../components/Card';
import PieChart from 'react-native-pie-chart';
import {retrieveData} from '../../utils/localStorage';
import {ApiResponse} from '../../model/base';
import api from '../../utils/api';
import {DashboardRes} from '../../model/dashboard';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {setDashboardData} from '../../store/slices/dashboardSlice';
import {formatDate, getAgoDate} from '../../utils/helpers';

const buttonData = [
  {
    name: '1M',
    value: 1,
    isSelected: true,
  },
  {
    name: '3M',
    value: 3,
    isSelected: false,
  },
  {
    name: '6M',
    value: 6,
    isSelected: false,
  },
  {
    name: 'YTD',
    value: 1,
    isSelected: false,
  },
  {
    name: '12M',
    value: 12,
    isSelected: false,
  },
  {
    name: 'Max',
    value: 999,
    isSelected: false,
  },
];

const sliceColors = [
  'rgb(248,178,189)',
  'rgb(97,185,205)',
  'rgb(231,247,252)',
  '#f6e38c',
  '#021526',
  '#FFF1DB',
  '#73BBA3',
  '#667BC6'
]

const DateRange = ({data, setData}: any) => {
  const handleChange = (e: number) => {
    setData((prev: any) => [
      ...prev.map((p: any, index: number) => {
        return {
          ...p,
          isSelected: index === e ? true : false,
        };
      }),
    ]);
  };

  return (
    <Box style={styles.dateRangeContainer}>
      {data.map((d: any, i: number) => {
        const buttonBgColor = d.isSelected ? 'white' : 'rgb(105,134,225)';
        const buttonFontColor = d.isSelected ? 'rgb(105,134,225)' : 'white';
        return (
          <Button
            onPress={() => handleChange(i)}
            _text={{
              color: buttonFontColor,
            }}
            bgColor={buttonBgColor}
            style={styles.button}>
            {d.name}
          </Button>
        );
      })}
    </Box>
  );
};

interface DashboardCard {
  name: string;
  score: string;
}

const getRandomColor2 = () => {
  const red = Math.floor(Math.random() * 255);
  const green = Math.floor(Math.random() * 255);
  const blue = Math.floor(Math.random() * 255);
  const opacity = 0.5;
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
};

const DashboardCard = ({name, score}: DashboardCard) => {
  return (
    <Card
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
      }}>
      <Text style={{flex: 5}}>{name}</Text>
      <Text size={16} style={{flex: 2, textAlign: 'center'}} weight={700} color="rgb(105,134,225)">
        {score}
      </Text>
    </Card>
  );
};

const DashboardTab = () => {
  const [refreshing, setRefreshing] = React.useState(false);
  const dispatch = useAppDispatch();
  const [dateRange, setDateRange] = React.useState(buttonData);

  const dashboardData = useAppSelector(state => state.dashboardData.value);
  const onRefresh = async () => {
    setRefreshing(true);
    await getData();
    setRefreshing(false);
  };

  const getData = async () => {
    const forumId = await retrieveData('forum_uuid');
    const selectedDate = dateRange.find(x => x.isSelected);
    if (!selectedDate) {
      return;
    }
    const response: ApiResponse<DashboardRes> = await api.get(
      `forum/${forumId}/mobile/dashboard?from=${formatDate(
        getAgoDate(selectedDate.value),
      )}&to=${formatDate(new Date())}`,
    );
    dispatch(setDashboardData(response.data));
  };

  React.useEffect(() => {
    getData();
  }, [dateRange]);

  const widthAndHeight = 250;

  if (!dashboardData) {
    return <></>;
  }

  function chunk<T>(arr: T[], size: number) {
    return Array.from({length: Math.ceil(arr.length / size)}, (v, i) =>
      arr.slice(i * size, i * size + size),
    );
  }

  const cardData = chunk(dashboardData.metrics, 2);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      style={{flex: 1}}>
      <View>
        <Box style={{width: '100%'}}>
          <DateRange data={dateRange} setData={setDateRange} />
          <Box
            style={{
              gap: 10,
              padding: 20,
            }}>
            {cardData.map(data => {
              return (
                <Box style={styles.row}>
                  {data.map(d => {
                    return (
                      <DashboardCard
                        name={d.title}
                        score={`${Math.round(d.value)} ${d.unit}`}
                      />
                    );
                  })}
                </Box>
              );
            })}
          </Box>
        </Box>
        <Box
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}>
          {dashboardData.charts.map(chart => {
            const series = chart.data.map(ch => ch.count);
            const total = series.reduce(
              (accumulator, currentValue) => accumulator + currentValue,
              0,
            );
            if (!total || total === 0) {
              return <></>;
            }
            return (
              <Box
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  gap: 20,
                }}>
                <Text>{chart.title}</Text>
                <PieChart
                  widthAndHeight={widthAndHeight}
                  series={series}
                  sliceColor={sliceColors.slice(0, series.length)}
                  coverFill={'#FFF'}
                />
                <Box style={{gap: 10}}>
                  {chart.data.map((m, i) => {
                    return (<Box style={{flexDirection: 'row', gap: 10}}>
                      <Box style={{width: 20, height: 20, backgroundColor: sliceColors[i]}}></Box>
                      <Text>{m.name}</Text>
                    </Box>)
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>
      </View>
    </ScrollView>
  );
};

export default DashboardTab;

const styles = StyleSheet.create({
  dateRangeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgb(105,134,225)',
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {},
  row: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
  },
});
