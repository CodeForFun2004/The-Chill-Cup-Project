import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

const RegisterScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

   const handleGoogleSignup = () => {
    navigation.navigate('CreateAccount'); // ✅ chuyển sang CreateAccount
  };

  const handleFacebookSignup = () => {
    navigation.navigate('CreateAccount'); // ✅ chuyển sang CreateAccount
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Logo */}
        <Image
          source={require('../../assets/splash.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Title */}
        <Text style={styles.title}>ChillCup — uống là chill!</Text>
        <Text style={styles.description}>
          Nhấp một ngụm, chill cả ngày.
        </Text>

        {/* Social Buttons */}
        <TouchableOpacity style={styles.socialBtn} onPress={handleGoogleSignup}>
          <FontAwesome name="google" size={20} color="#EA4335" />
          <Text style={styles.socialText}>  Đăng ký với Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialBtn} onPress={handleFacebookSignup}>
          <FontAwesome name="facebook" size={20} color="#3b5998" />
          <Text style={styles.socialText}>  Đăng ký với Facebook</Text>
        </TouchableOpacity>
      </View>

      {/* Log in link */}
      <View style={styles.loginRow}>
        <Text style={styles.loginText}>Đã có tài khoản?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}> Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#EAFBF2',
    borderRadius: 24,
    paddingVertical: 60, // ✅ tăng chiều cao khung
    paddingHorizontal: 24,
    alignItems: 'center',
    minHeight: 500,       // ✅ đảm bảo khung đủ to
    borderWidth: 1,
    borderColor: '#000',
  },
  logo: {
    width: 180,
    height: 100,
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3A2D2D',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 16,
  },
  socialText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4AA366',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  loginText: {
    fontSize: 13,
    color: '#555',
  },
  loginLink: {
    fontSize: 13,
    color: '#4AA366',
    fontWeight: '600',
  },
});
