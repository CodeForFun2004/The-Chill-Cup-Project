import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

const SplashScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }, 1850); // Thay đổi thời gian nếu cần

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/splash.gif')} // 🎯 dùng ảnh gif bạn tải
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAFBF2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});
