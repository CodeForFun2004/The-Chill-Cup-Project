import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { formatCurrency } from '../../utils/formatCurrency';

const OrderSummaryDetails = () => {
  const order = useSelector((state: RootState) => state.order);
  const itemsList = order.items?.split(', ') || [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Summary</Text>

      <Row label="Order ID" value={order.orderId} />

      {/* Items Section */}
      <View style={styles.rowItems}>
        <Text style={styles.label}>Items</Text>
        <View style={styles.itemsContainer}>
          {itemsList.map((itemStr, index) => {
            const [namePart, quantityPart] = itemStr.split(' x');
            return (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {namePart}
                </Text>
                <Text style={styles.itemQty}>x{quantityPart}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <Row label="Total" value={formatCurrency(order.total)} highlight />
      <Row label="Delivery Time" value={order.deliveryTime} />
      <Row label="Address" value={order.address} />
      <Row label="Payment" value={order.paymentMethod} />
    </View>
  );
};

export default OrderSummaryDetails;

// Row component
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
    <Text style={styles.label}>{label}</Text>
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
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  rowItems: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    alignItems: 'flex-start',
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
  itemsContainer: {
    flex: 1,
    gap: 4,
    alignItems: 'flex-end',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  itemQty: {
    width: 40,
    textAlign: 'right',
    fontSize: 14,
    color: '#333',
  },
});
