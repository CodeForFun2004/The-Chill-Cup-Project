import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '../../utils/formatCurrency';

type CartSummaryProps = {
  subtotal: number;
  delivery: number;
};

export const CartSummary: React.FC<CartSummaryProps> = ({ subtotal, delivery }) => {
  const total = subtotal + delivery;
  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryRow}>
        <Text>Tạm tính</Text>
        <Text>{formatCurrency(subtotal)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text>Phí giao hàng</Text>
        <Text>{formatCurrency(delivery)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={{ fontWeight: 'bold' }}>Tổng cộng</Text>
        <Text style={{ fontWeight: 'bold', color: '#4AA366' }}>{formatCurrency(total)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});
