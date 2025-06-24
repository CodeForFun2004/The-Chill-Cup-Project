import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel' },
      {
        text: 'Logout',
        onPress: () => {
          dispatch(logout());
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Login' }], // hoặc 'CustomerHomeStack' nếu muốn về giao diện khách
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
        <Text style={styles.title}>Admin Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#f55" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Revenue Block */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hôm nay</Text>
          <Text style={styles.cardValue}>3.500.000đ</Text>
          <Text style={styles.cardLabel}>Doanh thu</Text>
        </View>

        {/* Orders Block */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tổng cộng</Text>
          <Text style={styles.cardValue}>235</Text>
          <Text style={styles.cardLabel}>Đơn hàng</Text>
        </View>

        {/* Growth Block */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>+12%</Text>
          <Text style={styles.cardValue}>Tháng này</Text>
          <Text style={styles.cardLabel}>Tăng trưởng</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboard;

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
  },
  content: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4AA366',
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 6,
  },
  cardLabel: {
    fontSize: 14,
    color: '#888',
  },
});
