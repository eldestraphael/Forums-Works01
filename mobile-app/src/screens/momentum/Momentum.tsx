import {View, StyleSheet, ScrollView, RefreshControl} from 'react-native';
import React from 'react';
import ProgressCard from '../../components/ProgressCard';
import {theme} from '../../theme/theme';
import RNSpeedometer from 'react-native-speedometer';
import Text from '../../components/RNText';
import {retrieveData} from '../../utils/localStorage';
import {ApiResponse} from '../../model/base';
import {DashboardRes} from '../../model/dashboard';
import api from '../../utils/api';
import {formatDate, getAgoDate, round} from '../../utils/helpers';
import {Image} from 'native-base';
import NoDataFound from '../../components/NoDataFound/NoDataFound';
import Loader from '../../components/Loader';
import {useAppSelector} from '../../store/hooks';

const labels = [
  {
    name: 'Too Slow',
    labelColor: 'transparent',
    activeBarColor: 'transparent',
  },
  {
    name: 'Very Slow',
    labelColor: '#ff5400',
    activeBarColor: 'transparent',
  },
  {
    name: 'Slow',
    labelColor: '#f4ab44',
    activeBarColor: 'transparent',
  },
  {
    name: 'Normal',
    labelColor: '#f2cf1f',
    activeBarColor: 'transparent',
  },
  {
    name: 'Fast',
    labelColor: '#14eb6e',
    activeBarColor: 'transparent',
  },
  {
    name: 'Unbelievably Fast',
    labelColor: '#00ff6b',
    activeBarColor: 'transparent',
  },
];

export const Momentum = () => {
  const [data, setData] = React.useState<DashboardRes | null>(null);
  const forumInfo = useAppSelector(state => state.appData.value.forumInfo);
  const [loading, setLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const getData = async () => {
    try {
      const forumId = await retrieveData('forum_uuid');
      const response: ApiResponse<DashboardRes> = await api.get(
        `forum/${forumId}/mobile/dashboard?from=${formatDate(
          getAgoDate(12),
        )}&to=${formatDate(new Date())}`,
      );
      setData(response.data);
    } catch (error) {}
    setLoading(false);
  };

  React.useEffect(() => {
    setLoading(true);
    getData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (!data) {
    return <NoDataFound />;
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await getData();
    setRefreshing(false);
  };

  const items = [
    {
      row: [
        {
          title: 'On Time',
          percentage: round(
            data?.metrics.find(x => x.title === 'On Time')!.value,
          ),
          icon: require('../../../assets/images/Momentum/time.png'),
        },
        {
          title: 'Successful Prework',
          percentage: round(
            data?.metrics.find(x => x.title === 'Successful Prework')!.value,
          ),
          icon: require('../../../assets/images/Momentum/prework.png'),
        },
      ],
    },
    {
      row: [
        {
          title: 'Action Steps',
          percentage: round(
            data?.metrics.find(x => x.title === 'Successful Action Steps')!
              .value,
          ),
          icon: require('../../../assets/images/Momentum/action-step.png'),
        },
        {
          title: 'Company Momentum',
          percentage: round(data?.momentum_by_company),
          icon: require('../../../assets/images/Momentum/company-a-momentum.png'),
        },
      ],
    },
  ];

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.gaugeContainer}>
        <View style={styles.gaugeWrapper}>
          <Text style={styles.text}>{forumInfo?.forum_name} Momentum</Text>
          <RNSpeedometer
            value={data.momentum || 0}
            size={300}
            minValue={0}
            needleImage={require('../../../assets/images/Momentum/needle.png')}
            maxValue={100}
            imageStyle={styles.needle}
            imageWrapperStyle={styles.needleWrapper}
            wrapperStyle={{backgroundColor: 'transparent'}}
            outerCircleStyle={styles.outerCircle}
            innerCircleStyle={styles.outerCircle}
            labels={labels}
            labelStyle={{display: 'none'}}
            labelNoteStyle={{display: 'none'}}
          />

          <View style={{position: 'absolute', bottom: 50}}>
            <Image
              style={{objectFit: 'contain', height: 175, width: 350}}
              alt="icon"
              source={require('../../../assets/images/Momentum/speedometer-main.png')}
            />
          </View>
          <View
            style={{
              position: 'absolute',
              alignItems: 'center',
              justifyContent: 'center',
              bottom: 20,
              width: 80,
              height: 80,
              borderRadius: 80,
              backgroundColor: 'white',
            }}>
            <Text weight="bold" size="3xl">
              {Math.round(data.momentum)}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.cardContainer}>
        {items.map(({row}) => (
          <View style={styles.row}>
            {row.map(props => (
              <ProgressCard {...props} />
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    padding: 10,
    gap: 10,
  },
  text: {
    color: 'white',
    fontWeight: 700,
    paddingBottom: 0,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
  },
  gaugeContainer: {
    width: '100%',
    padding: 20,
  },
  gaugeWrapper: {
    height: 300,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 50,
  },
  needleWrapper: {
    // position: 'absolute',
    // top: 0,
    // left: 0,

    width: 300,
    height: 300,
    zIndex: 10000,
  },
  needle: {
    // top: 20,
    // left: 0,
    // bottom: 20,
    left: 0,
    bottom: 60,
    transform: 'scale(0.5)',
    resizeMode: 'contain',
    tintColor: 'white',
    // backgroundColor: 'blue'
  },
  outerCircle: {
    backgroundColor: 'transparent',
  },
});
