import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '../../utils/formatCurrency';

type Props = {
  subtotal: number;
  delivery: number;
  tax: number;
};

const OrderSummary: React.FC<Props> = ({ subtotal, delivery, tax }) => {
  const total = subtotal + delivery + tax;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Tóm tắt đơn hàng</Text>
      <Row label="Tạm tính" value={formatCurrency(subtotal)} />
      <Row label="Phí giao hàng" value={delivery === 0 ? 'Miễn phí' : formatCurrency(delivery)} />
      <Row label="Thuế" value={formatCurrency(tax)} />
      <Row label="Tổng cộng" value={formatCurrency(total)} bold green />
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
});
