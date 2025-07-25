import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Alert,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';

import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { loginUser } from '../../redux/slices/authSlice';

const LoginScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [remember, setRemember] = useState(true);
  const { loading } = useAppSelector((state) => state.auth);

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    dispatch(loginUser({ usernameOrEmail: username, password }))
      .unwrap()
      .then(() => {
        if (remember) {
          // Nếu muốn lưu thêm flag remember, có thể dùng AsyncStorage tại đây
        }
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      })
      .catch((err) => {
        Alert.alert('Đăng nhập thất bại', err);
      });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Logo */}
        <Image
          source={require('../../assets/splash.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Welcome Text */}
        <Text style={styles.welcome}>Xin chào! <Text style={{ fontSize: 20 }}>👋</Text></Text>

        {/* Username */}
        <Text style={styles.label}>Tên đăng nhập</Text>
        <TextInput
          style={styles.input}
          placeholder="Tên đăng nhập"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('WelcomeScreen')}
        >
          <View style={styles.backIconWrapper}>
            <Ionicons name="chevron-back" size={20} color="#333" />
          </View>
        </TouchableOpacity>

        {/* Password */}
        <Text style={styles.label}>Mật khẩu</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Mật khẩu"
            placeholderTextColor="#999"
            secureTextEntry={secure}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.eyeButton} onPress={() => setSecure(!secure)}>
            <Ionicons name={secure ? 'eye-off' : 'eye'} size={20} color="#555" />
          </TouchableOpacity>
        </View>

        {/* Remember + Forgot */}
        <View style={styles.rememberRow}>
          <View style={styles.rememberLeft}>
            <Ionicons
              name={remember ? 'checkmark-circle' : 'ellipse-outline'}
              size={18}
              color={remember ? '#4AA366' : '#ccc'}
              onPress={() => setRemember(!remember)}
            />
            <Text style={styles.rememberText}> Lưu tài khoản</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Auth', { screen: 'ForgotPassword' })}>
            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
          <Text style={styles.loginText}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.orText}>Đăng nhập với</Text>
          <View style={styles.line} />
        </View>

        {/* Social buttons */}
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn}>
            <FontAwesome name="facebook" size={18} color="#3b5998" />
            <Text style={styles.socialText}> Facebook</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn}>
            <Image
              source={{ uri: 'https://img.icons8.com/color/48/google-logo.png' }}
              style={{ width: 18, height: 18 }}
            />
            <Text style={styles.socialText}> Google</Text>
          </TouchableOpacity>
        </View>

        {/* Sign up */}
        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Chưa có tài khoản?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Auth', { screen: 'Register' })}>
            <Text style={styles.signupLink}> Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  logo: {
    width: 130,
    height: 120,
    alignSelf: 'center',
    marginBottom: 24,
  },
  welcome: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    //textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    marginBottom: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    fontSize: 13,
    color: '#555',
  },
  forgotText: {
    fontSize: 13,
    color: '#555',
  },
  loginBtn: {
    backgroundColor: '#4AA366',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: '#888',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 6,
  },
  socialText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#333',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  signupText: {
    fontSize: 13,
    color: '#555',
  },
  signupLink: {
    fontSize: 13,
    color: '#4AA366',
    fontWeight: '600',
  },
  passwordContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 10,
  paddingHorizontal: 12,
  marginBottom: 14,
  backgroundColor: '#fff',
},
passwordInput: {
  flex: 1,
  fontSize: 14,
  paddingVertical: 12,
  color: '#000',
},
eyeButton: {
  padding: 6,
},
backButton: {
  position: 'absolute',
  top: 40,
  left: 24,
  zIndex: 10,
},
backIconWrapper: {
  width: 36,
  height: 36,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#ccc',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#fff',
},

});
