import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native'; // Đã bỏ Alert

type Props = {
  // location, phone, paymentMethod không còn được sử dụng trực tiếp trong component này
  // vì logic kiểm tra và xử lý đã nằm ở CheckoutScreen
  location: string; // Vẫn giữ để khớp với Type Props, nhưng không cần dùng trong JSX
  phone: string; // Vẫn giữ để khớp với Type Props, nhưng không cần dùng trong JSX
  paymentMethod: 'cod' | 'vnpay'; // Vẫn giữ để khớp với Type Props, nhưng không cần dùng trong JSX
  onPress: () => void;
  isLoading: boolean;
};

const PlaceOrderButton: React.FC<Props> = ({

  onPress,
  isLoading,
}) => {


  return (
    <TouchableOpacity
      style={[styles.button, isLoading && styles.buttonDisabled]}
      onPress={onPress} // Sử dụng prop onPress được truyền từ CheckoutScreen
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.buttonText}>Đặt Hàng</Text>
      )}
    </TouchableOpacity>
  );
};

export default PlaceOrderButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#e53935',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    marginVertical: 10,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#e5393580',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});