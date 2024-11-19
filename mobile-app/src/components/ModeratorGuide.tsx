import {Linking, StyleSheet, useWindowDimensions, View} from 'react-native';
import React from 'react';
import {Box, Button, Center, Divider, Modal, ScrollView} from 'native-base';
import Text from './RNText';
import MaterialIconsCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import RenderHtml, {RenderHTMLProps} from 'react-native-render-html';
import api from '../utils/api';
import {
  ModeratorActionStep,
  ModeratorData,
  ModeratorDataContent,
} from '../model/moderatorData';
import {ApiResponse} from '../model/base';
import {secondsToMinutes} from '../utils/helpers';
import {theme} from '../theme/theme';
import {useAppSelector} from '../store/hooks';

const htmlRenderProps: Partial<RenderHTMLProps> = {
  tagsStyles: {
    ul: {
      paddingLeft: 10,
    },
    ol: {
      paddingLeft: 10,
    },
  },
};

const ModeratorGuideHeader = ({data}: {data: ModeratorDataContent}) => {
  const {width} = useWindowDimensions();

  if (data.type === 'logical') {
    return (
      <Box style={styles.logicalHeader}>
        <Text style={styles.h1}>{data.title}</Text>
        <RenderHtml
          contentWidth={width}
          {...htmlRenderProps}
          source={{
            html: data.description,
          }}
        />
      </Box>
    );
  }

  if (data.type === 'once') {
    return (
      <Box style={styles.onceHeader}>
        <Box style={{flexDirection: 'row', gap: 10}}>
          <Box style={{flex: 1}}>
            <Text style={styles.h2}>{data.title}</Text>
            <RenderHtml
              contentWidth={width}
              {...htmlRenderProps}
              source={{
                html: data.description,
              }}
            />
          </Box>
        </Box>
      </Box>
    );
  }
};

const ModeratorGuideBody = ({
  data,
  index,
  onLinkPress,
}: {
  data: ModeratorDataContent;
  index: number;
  onLinkPress: (url: string) => void;
}) => {
  const {width} = useWindowDimensions();
  const bgColor = index % 2 === 0 ? 'rgb(245, 244, 251)' : 'rgb(238, 243, 255)';
  const footerBgColor =
    index % 2 === 0 ? 'rgb(235, 232, 248)' : 'rgb(229, 233, 244)';
  return (
    <Box style={{backgroundColor: bgColor, gap: 10}}>
      <Box style={{flexDirection: 'row', gap: 10, padding: 10}}>
        <Box style={{alignItems: 'center', justifyContent: 'center'}}>
          <Text size="xl" weight={500} style={{padding: 10}}>
            {data.order}
          </Text>
        </Box>
        <Divider orientation="vertical"></Divider>
        <Box style={{flex: 1, gap: 5}}>
          <Text style={styles.h2}>{data.title}</Text>
          <RenderHtml
            {...htmlRenderProps}
            contentWidth={width}
            source={{
              html: data.description,
            }}
          />
        </Box>
      </Box>
      {data.link ? (
        <Box
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: footerBgColor,
            padding: 10,
          }}>
          <Box style={{flexDirection: 'row', gap: 5}}>
            <MaterialIconsCommunity name="clock-time-five" size={20} />
            {data.duration && (
              <Text style={{...styles.p}}>
                {secondsToMinutes(data.duration)}
              </Text>
            )}
            {data.duration_per_person ? (
              <>
                <Divider orientation="vertical" />
                <Text style={{...styles.p}}>
                  {secondsToMinutes(data.duration_per_person)} per person
                </Text>
              </>
            ) : (
              <></>
            )}
          </Box>
          <AntDesignIcon
            name="playcircleo"
            size={20}
            onPress={() => {
              if (data.link) onLinkPress(data.link);
            }}
          />
        </Box>
      ) : (
        <></>
      )}
    </Box>
  );
};

const ModeratorGuideActionStep = ({data}: {data: ModeratorActionStep}) => {
  const {width} = useWindowDimensions();
  return (
    <Box style={{backgroundColor: 'rgb(42, 48, 65)', padding: 15, gap: 5}}>
      <Text color="white" style={{...styles.h1, textAlign: 'center'}}>
        {data?.name}
      </Text>
      <RenderHtml
        {...htmlRenderProps}
        contentWidth={width}
        baseStyle={{color: 'white'}}
        source={{
          html: data.description,
        }}
      />
    </Box>
  );
};

const ModeratorGuideFooter = ({data}: {data: ModeratorDataContent}) => {
  return (
    <Box style={{padding: 15}}>
      <RenderHtml
        {...htmlRenderProps}
        source={{
          html: data.description,
        }}
      />
    </Box>
  );
};

const ModeratorGuide = ({navigation}: any) => {
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const chapterInfo = useAppSelector(
    state => state.courseData.value?.chapter_info,
  );

  const [moderatorData, setModeratorData] =
    React.useState<ModeratorData | null>(null);

  const getModeratorData = async () => {
    if (!chapterInfo?.uuid) {
      return;
    }
    const res = await api.get<ApiResponse<ModeratorData>>(
      `/${chapterInfo?.uuid}/moderatorguide`,
    );
    if (res.data) {
      setModeratorData(res.data);
    }
  };

  React.useEffect(() => {
    getModeratorData();
  }, [chapterInfo?.uuid]);

  if (!moderatorData) {
    return <></>;
  }

  const handleClose = () => {
    setOpen(false);
  };
  const handleLink = (url: string) => {
    navigation.navigate('Webview', {url: url});
    handleClose()
  };
  return (
    <View>
      <Button
        backgroundColor={theme.colors.primary}
        onPress={() => {
          setOpen(true);
        }}>
        Moderator Guide
      </Button>
      <Modal isOpen={open} onClose={handleClose} style={{padding: 0}}>
        <Modal.Content style={{padding: 0}}>
          {moderatorData.header
            .filter(t => t.type === 'logical')
            .map(data => {
              return <ModeratorGuideHeader data={data} />;
            })}
          <Modal.Header
            style={{
              paddingTop: 0,
              paddingLeft: 0,
              paddingRight: 0,
              paddingBottom: 0,
            }}></Modal.Header>
          <Modal.CloseButton />
          <Modal.Body
            style={{
              paddingTop: 0,
              paddingLeft: 0,
              paddingRight: 0,
              paddingBottom: 0,
            }}>
            <ScrollView>
              <Box style={styles.bodyContainer}>
                {moderatorData.header
                  .filter(t => t.type === 'once')
                  .map(data => {
                    return <ModeratorGuideHeader data={data} />;
                  })}
                {moderatorData.body.map((data, i) => {
                  return (
                    <ModeratorGuideBody
                      onLinkPress={handleLink}
                      data={data}
                      index={i}
                    />
                  );
                })}
                <ModeratorGuideActionStep data={moderatorData.action_step} />
                {moderatorData.footer.map(data => {
                  return <ModeratorGuideFooter data={data} />;
                })}
              </Box>
            </ScrollView>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </View>
  );
};

export default ModeratorGuide;

const styles = StyleSheet.create({
  h1: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  h2: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  p: {
    fontSize: 12,
  },
  bodyContainer: {
    gap: 10,
  },
  logicalHeader: {
    padding: 15,
    gap: 10,
  },

  onceHeader: {
    padding: 15,
    backgroundColor: 'rgb(238, 243, 255)',
    gap: 10,
  },
});
