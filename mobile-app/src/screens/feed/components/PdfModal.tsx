import {Dimensions, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Image, Modal} from 'native-base';
import MaterialIconsCommunity from 'react-native-vector-icons/MaterialIcons';
import Pdf from 'react-native-pdf';

const PdfModal = ({navigation, route}: any) => {
  const {uri, type, handlePdfProgress} = route.params;

  return (
    <View style={{flex: 1}}>
      <View style={styles.header}>
        <MaterialIconsCommunity
          name="arrow-back-ios"
          size={20}
          onPress={() => navigation.goBack()}></MaterialIconsCommunity>
      </View>
      <View style={{flex: 1}}>
        {type === 'pdf' ? (
          <Pdf
            onLoadComplete={(numberOfPages, filePath) => {
              console.log(`Number of pages: ${numberOfPages}`);
            }}
            trustAllCerts={false}
            onPageChanged={handlePdfProgress}
            style={styles.pdf}
            source={{
              uri,
            }}></Pdf>
        ) : type === 'image' ? (
            <Image style={{width: '100%', height: '100%', objectFit: 'contain' }} source={{uri}}/>
        ) : (
          <></>
        )} 
      </View>
    </View>
  );
};

export default PdfModal;

const styles = StyleSheet.create({
  pdf: {
    height: '100%',
    width: Dimensions.get('window').width,
  },
  header: {
    width: Dimensions.get('window').width,
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'gray',
  },
});
