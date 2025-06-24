import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { formatCurrency } from '../../utils/formatCurrency';

const OrderSummaryDetails = () => {
  const order = useSelector((state: RootState) => state.order);
  const itemsList = order.items || [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chi tiết đơn hàng</Text>

      <Row label="Mã đơn hàng" value={order.orderNumber} />

      {/* Danh sách món */}
      <View style={styles.rowItems}>
        <Text style={styles.label}>Món đã đặt</Text>
        <View style={styles.itemsContainer}>
          {itemsList.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.itemQty}>x{item.quantity}</Text>
            </View>
          ))}
        </View>
      </View>

      <Row label="Tổng tiền" value={formatCurrency(order.total)} highlight />
      <Row label="Thời gian giao hàng" value={order.deliveryTime} />
      <Row label="Địa chỉ giao hàng" value={order.deliveryAddress || order.address} />
      <Row label="Hình thức thanh toán" value={order.paymentMethod} />
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
