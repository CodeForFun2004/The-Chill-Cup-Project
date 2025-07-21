
import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useDispatch } from 'react-redux'
import { logoutUser } from '../../redux/slices/authSlice';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const StaffDashboard = () => {

  const dispatch = useDispatch();
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Huỷ' },
      {
        text: 'Đăng xuất',
        onPress: async () => { // <--- Thêm async vào đây
          await dispatch(logoutUser() as any); // <-- Dispatch thunk logoutUser
          // Sau khi logout thành công (cả Redux và AsyncStorage đã được clear)
          // Điều hướng người dùng về màn hình khách hoặc màn hình bắt đầu
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Main' }], // <-- Đảm bảo đây là Guest Navigator hoặc màn hình khởi đầu cho khách
            })
          );
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with logout */}
      <View style={styles.header}>
        <Text style={styles.title}> Staff Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#f55" />
        </TouchableOpacity>
      </View>
      </SafeAreaView>
  )
}

export default StaffDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  }
});