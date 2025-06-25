import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/slices/authSlice';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';

const CreateAccountScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();

  const [username, setUsername] = useState('user123');
  const [password, setPassword] = useState('12345678');
  const [confirm, setConfirm] = useState('12345678');
  const [secure1, setSecure1] = useState(true);
  const [secure2, setSecure2] = useState(true);
  const [agree, setAgree] = useState(true);

  const handleSubmit = () => {
    if (!username || !password || !confirm) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }
    if (!agree) {
      Alert.alert('Lỗi', 'Bạn phải đồng ý với chính sách.');
      return;
    }

    dispatch(login({
      role: 'customer',
      userInfo: { name: username, id: 'M162445270' },
    }));

    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <View style={styles.card}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={20} color="#000" />
              </TouchableOpacity>

              <Image source={require('../../assets/splash.png')} style={styles.logo} />

              <Text style={styles.title}>Chào mừng bạn mới!<Text style={{ fontSize: 20 }}>👋</Text></Text>

              <Text style={styles.label}>Tên đăng nhập</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChangeText={setUsername}
              />

              <Text style={styles.label}>Tạo mật khẩu</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.inputField}
                  placeholder="Tối thiểu 8 ký tự"
                  secureTextEntry={secure1}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setSecure1(!secure1)}>
                  <Ionicons name={secure1 ? 'eye-off' : 'eye'} size={20} color="#555" />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Xác nhận mật khẩu</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.inputField}
                  placeholder="Nhập lại mật khẩu"
                  secureTextEntry={secure2}
                  value={confirm}
                  onChangeText={setConfirm}
                />
                <TouchableOpacity onPress={() => setSecure2(!secure2)}>
                  <Ionicons name={secure2 ? 'eye-off' : 'eye'} size={20} color="#555" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.agreeRow} onPress={() => setAgree(!agree)}>
                <Ionicons
                  name={agree ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={agree ? '#4AA366' : '#ccc'}
                />
                <Text style={styles.agreeText}> Tôi đồng ý với điều khoản và chính sách bảo mật</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Đã có tài khoản?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Auth', { screen: 'Login' })}>
                <Text style={styles.footerLink}> Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default CreateAccountScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#EAFBF2',
    borderRadius: 24,
    padding: 24,
  },
  logo: {
    width: 120,
    height: 90,
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3A2D2D',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 12,
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  agreeText: {
    fontSize: 13,
    color: '#333',
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#4AA366',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    fontSize: 13,
    color: '#555',
  },
  footerLink: {
    fontSize: 13,
    color: '#4AA366',
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    //backgroundColor: '#fff',
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
