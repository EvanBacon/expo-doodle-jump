import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Linking } from 'expo';

const ExpoButton = () => (
  <TouchableOpacity
    onPress={() => {
      Linking.openURL(
        'https://blog.expo.io/expo-cli-and-sdk-web-support-beta-d0c588221375',
      );
    }}
    style={{ position: 'absolute', bottom: 8, left: 8 }}
  >
    <View style={{ opacity: 0.5, flexDirection: 'row', alignItems: 'center' }}>
      <Image
        style={{ width: 36, height: 36 }}
        source={{
          uri:
            'https://d30j33t1r58ioz.cloudfront.net/static/brand/logo-b-black-228x228.png',
        }}
      />
      <Text style={{ fontWeight: '600' }}>Expo</Text>
    </View>
  </TouchableOpacity>
);

export default ExpoButton;
