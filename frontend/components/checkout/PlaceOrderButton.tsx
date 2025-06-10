import React from 'react';
import { Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const PlaceOrderButton = () => {
  const handlePress = () => {
    Alert.alert('Đặt hàng thành công!', 'Cảm ơn bạn đã mua hàng.');
  };

  return (
    <TouchableOpacity style={styles.checkoutButton} onPress={handlePress}>
      <Text style={styles.checkoutText}>🛒 Đặt hàng</Text>
    </TouchableOpacity>
  );
};

export default PlaceOrderButton;

const styles = StyleSheet.create({
  checkoutButton: {
    backgroundColor: '#E53935',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginHorizontal: 2,  // khoảng cách 2 bên
    marginBottom: 20,      // khoảng cách dưới cùng
  },
  checkoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
