import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '../../utils/formatCurrency';

type Props = {
  subTotal: number;
  delivery: number;
  discountAmount: number;
  total: number;
};

const OrderSummary: React.FC<Props> = ({ subTotal, delivery, discountAmount , total }) => {
 
  const tax = subTotal * 0.1; // Giả sử thuế là 10% của subtotal
  const finalTotal = total + tax - discountAmount;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Tóm tắt đơn hàng</Text>
      <Row label="Tạm tính" value={formatCurrency(subTotal)} />
      <Row label="Thuế" value={formatCurrency(tax)} />
      <Row label="Phí giao hàng" value={formatCurrency(delivery)} />
      {discountAmount > 0 && ( // Chỉ hiển thị dòng giảm giá nếu có giảm giá
        <View style={styles.summaryRow}>
          <Text style={styles.discountLabel}>Giảm giá</Text>
          <Text style={styles.discountValue}>- {formatCurrency(discountAmount)}</Text>
        </View>
      )}
      <Row label="Tổng cộng" value={formatCurrency(finalTotal)} bold green />
      <Text style={styles.estimated}>⏱ Thời gian giao hàng dự kiến: 25-35 phút</Text>
    </View>
  );
};

const Row = ({
  label,
  value,
  bold = false,
  green = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
  green?: boolean;
}) => (
  <View style={styles.row}>
    <Text style={[styles.label, bold && styles.bold]}>{label}</Text>
    <Text
      style={[
        styles.value,
        bold && styles.bold,
        green && { color: '#4AA366' },
      ]}
    >
      {value}
    </Text>
  </View>
);

export default OrderSummary;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    marginBottom: 16,
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: { color: '#333' },
  value: { color: '#333' },
  bold: { fontWeight: 'bold' },
  estimated: {
    marginTop: 12,
    color: '#e53935',
    fontStyle: 'italic',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  discountLabel: {
    color: '#E74C3C', // Màu đỏ cho giảm giá
  },
  discountValue: {
    color: '#E74C3C',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
