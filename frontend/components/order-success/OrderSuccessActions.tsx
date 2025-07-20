import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { RootState } from '../../redux/rootReducer';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// ✅ Import lại Order từ orderSlice để đảm bảo định nghĩa kiểu thống nhất

import { CustomerStackParamList } from '../../navigation/customer/CustomerStackNavigator';

const OrderSuccessActions = () => {
  // ✅ Lấy currentOrder từ order state, KHÔNG phải toàn bộ order state
  const currentOrder = useSelector((state: RootState) => state.order.currentOrder);
  // OrderState bao gồm currentOrder, loading, error, v.v.
  // currentOrder mới là đối tượng Order thực sự.

  const navigation = useNavigation<NativeStackNavigationProp<CustomerStackParamList>>();

  const handleBackToHome = () => {
    // Lưu ý: getParent().navigate là cách chuyển giữa các top-level navigators.
    // Nếu CustomerHomeStack là tên của navigator chứa Home, thì đúng.
    const parentNav = navigation.getParent();
    parentNav?.navigate('CustomerHomeStack', { // Đảm bảo 'CustomerHomeStack' là tên Stack Navigator chính
      screen: 'CustomerHomeScreen', // Đảm bảo 'CustomerHomeScreen' là tên màn hình Home trong CustomerHomeStack
    });
  };

  const handleTrackOrder = () => {
    // ✅ Kiểm tra currentOrder, không phải order (OrderState)
    if (!currentOrder || !currentOrder._id) { // Dùng _id thay vì id vì MongoDB dùng _id
      console.warn('Không có đơn hàng hợp lệ để theo dõi.');
      Alert.alert('Lỗi', 'Không tìm thấy chi tiết đơn hàng để theo dõi.'); // Thêm Alert cho người dùng
      return;
    }

    // ✅ Truyền currentOrder (đối tượng Order đầy đủ)
    navigation.navigate('OrderTracking', { order: currentOrder }); 
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.button, styles.outlineButton]}
        onPress={handleBackToHome}
      >
        <Text style={styles.outlineText}>← Quay về trang chủ</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handleTrackOrder}
      >
        <MaterialIcons name="local-shipping" size={20} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.primaryText}>Theo dõi đơn hàng</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OrderSuccessActions;

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  outlineButton: {
    backgroundColor: '#fff0f0',
  },
  outlineText: {
    color: '#e53935',
    fontWeight: 'bold',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#e53935',
  },
  primaryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});