// screens/Customer/ProfileScreen.tsx
import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { RootState } from '../../redux/store';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  const resetToMain = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      })
    );
  };

  const handleLogout = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Huỷ' },
      {
        text: 'Đăng xuất',
        onPress: () => {
          dispatch(logout());
          resetToMain(); // 👉 Về lại Home
        },
        style: 'destructive',
      },
    ]);
  };

  const handleLogin = () => {
    navigation.navigate('Auth'); // 👉 Đi đến LoginScreen trong AuthNavigator
  };

  return (
    <View style={styles.container}>
      {userInfo ? (
        <>
          <Text style={styles.title}>Xin chào, {userInfo.name}</Text>
          <View style={styles.button}>
            <Button title="Đăng xuất" onPress={handleLogout} color="#FF3B30" />
          </View>
        </>
      ) : (
        <>
          <Text style={styles.title}>Bạn chưa đăng nhập</Text>
          <View style={styles.button}>
            <Button title="Đăng nhập ngay" onPress={handleLogin} color="#4AA366" />
          </View>
        </>
      )}
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    marginTop: 12,
  },
});
