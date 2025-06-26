import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

type DeliveryRouteProp = RouteProp<{ params: { store: any } }, 'params'>;

const ChooseDeliveryAddressScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<DeliveryRouteProp>();
  const { store } = route.params;
  const [address, setAddress] = useState('');

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        accessible
        accessibilityLabel="Quay lại"
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <View style={styles.infoContainer}>
        <Text style={styles.header}>Chọn địa chỉ giao hàng</Text>
        <Text style={styles.storeInfo}>
          Giao từ: {store.name}, {store.address}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập địa chỉ giao hàng (ví dụ: 123 Đường ABC, Quận 1)"
          value={address}
          onChangeText={setAddress}
          accessible
          accessibilityLabel="Nhập địa chỉ giao hàng"
        />
        <TouchableOpacity
          style={styles.confirmButton}
          accessible
          accessibilityLabel="Xác nhận địa chỉ giao hàng"
        >
          <Text style={styles.confirmButtonText}>Xác nhận giao hàng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 10,
    zIndex: 1,
  },
  infoContainer: { padding: 24, marginTop: 80 },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 16,
  },
  storeInfo: {
    fontSize: 16,
    color: '#555',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  confirmButton: {
    backgroundColor: '#4AA366',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ChooseDeliveryAddressScreen;