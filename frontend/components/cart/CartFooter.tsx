import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatCurrency } from '../../utils/formatCurrency'; // ✅ Import hàm định dạng

type CartFooterProps = {
  total: number;
  onCheckout: () => void;
};

export const CartFooter: React.FC<CartFooterProps> = ({ total, onCheckout }) => {
  return (
    <TouchableOpacity style={styles.checkoutButton} onPress={onCheckout}>
      <Text style={styles.checkoutText}>Thanh toán • {formatCurrency(total)}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkoutButton: {
    backgroundColor: '#4AA366',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  checkoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
