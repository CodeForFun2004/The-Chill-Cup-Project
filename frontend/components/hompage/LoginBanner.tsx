// components/homepage/LoginBanner.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';

const LoginBanner = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLoginPress = () => {
    navigation.navigate('Auth'); // ✅ Chuyển sang AuthNavigator, hiển thị LoginScreen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>
      <Text style={styles.description}>
        Sử dụng app để tích điểm và đổi những ưu đãi chỉ dành riêng cho thành viên bạn nhé!
      </Text>
      <Pressable style={styles.button} onPress={handleLoginPress}>
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </Pressable>
    </View>
  );
};

export default LoginBanner;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginVertical: 10,
    elevation: 2,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 6,
    textAlign: 'center',
  },
  description: {
    color: '#444',
    marginBottom: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4AA366',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
