import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';

const WelcomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const goToLogin = () => {
    navigation.navigate('Auth', { screen: 'Login' }); // ✅ mở Login trong AuthNavigator
  };

  const goToRegister = () => {
    navigation.navigate('Auth', { screen: 'Register' }); // ✅ mở Register trong AuthNavigator
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/splash.png')}
        style={styles.logo}
        resizeMode="contain"
        />


      <Text style={styles.title}>ChillCup — uống là chill!</Text>
      <Text style={styles.subtitle}>
       Nhấp một ngụm, chill cả ngày.
      </Text>

      <TouchableOpacity style={styles.signInButton} onPress={goToLogin}>
        <Text style={styles.signInText}>Đăng Nhập</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.createAccountButton} onPress={goToRegister}>
        <Text style={styles.createAccountText}>Tạo tài khoản</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3A2D2D',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6e6e6e',
    textAlign: 'center',
    marginBottom: 32,
  },
  signInButton: {
    backgroundColor: '#3DBA57',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  signInText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  createAccountButton: {
    borderColor: '#3DBA57',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  createAccountText: {
    color: '#3DBA57',
    fontSize: 16,
    fontWeight: '600',
  },
});