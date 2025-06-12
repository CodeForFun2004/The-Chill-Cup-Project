import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const OrderSummaryDetails = () => {
  const order = useSelector((state: RootState) => state.order);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Summary</Text>
      <Row label="Order ID" value={order.orderId} />
      <Row label="Items" value={order.items} />
      <Row label="Total" value={`$${order.total.toFixed(2)}`} highlight />
      <Row label="Delivery Time" value={order.deliveryTime} />
      <Row label="Address" value={order.address} />
      <Row label="Payment" value={order.paymentMethod} />
    </View>
  );
};

export default OrderSummaryDetails;

const Row = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <View style={styles.row}>
    <Text style={[styles.label]}>{label}</Text>
    <Text style={[styles.value, highlight && styles.highlight]} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  label: {
    color: '#666',
    fontSize: 14,
    flex: 1,
  },
  value: {
    color: '#333',
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  highlight: {
    fontWeight: 'bold',
    color: '#e53935',
  },
});
