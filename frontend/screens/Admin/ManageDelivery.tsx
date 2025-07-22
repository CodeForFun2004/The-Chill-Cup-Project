import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Chip } from 'react-native-paper';
import { orders as initialOrders, Order, RefundRequest } from '../../data/orders';
import { TextInput } from 'react-native';

const statusFilters = [
  'All',
  'Pending',
  'Processing',
  'Preparing',
  'Ready',
  'Delivering',
  'Completed',
  'Cancelled',
  'Refunded', // Thêm filter này
] as const;

type StatusFilter = typeof statusFilters[number];

const ManageDelivery = () => {
  const [view, setView] = useState<'orders' | 'settings'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deliveryOrders, setDeliveryOrders] = useState<Order[]>([...initialOrders]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

  // Settings state
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('20');
  const [deliveryRadius, setDeliveryRadius] = useState('5');
  const [timeEstimate, setTimeEstimate] = useState('30');

  // ** Sửa lại filter cho Refunded **
  const filteredOrders = deliveryOrders.filter(order => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Refunded') {
      return order.refundRequests && order.refundRequests.length > 0;
    }
    return order.status === statusFilter;
  });

  // ----------- REFUND ADMIN HANDLERS -----------
  const handleAcceptRefund = (orderId: string, refundId: string) => {
    Alert.alert(
      'Chấp nhận hoàn tiền?',
      'Bạn chắc chắn muốn CHẤP NHẬN yêu cầu hoàn tiền này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Chấp nhận',
          style: 'default',
          onPress: () => {
            setDeliveryOrders(prev =>
              prev.map(order => {
                if (order.id === orderId && order.refundRequests) {
                  return {
                    ...order,
                    refundRequests: order.refundRequests.map(r =>
                      r.id === refundId ? { ...r, status: 'Approved' } : r
                    ),
                  };
                }
                return order;
              })
            );
            // update state nếu đang mở chi tiết đơn
            if (selectedOrder && selectedOrder.id === orderId) {
              setSelectedOrder(order => {
                if (!order || !order.refundRequests) return order;
                return {
                  ...order,
                  refundRequests: order.refundRequests.map(r =>
                    r.id === refundId ? { ...r, status: 'Approved' } : r
                  ),
                };
              });
            }
          },
        },
      ]
    );
  };

  const handleRejectRefund = (orderId: string, refundId: string) => {
    Alert.alert(
      'Từ chối hoàn tiền?',
      'Bạn chắc chắn muốn TỪ CHỐI yêu cầu hoàn tiền này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Từ chối',
          style: 'destructive',
          onPress: () => {
            setDeliveryOrders(prev =>
              prev.map(order => {
                if (order.id === orderId && order.refundRequests) {
                  return {
                    ...order,
                    refundRequests: order.refundRequests.map(r =>
                      r.id === refundId ? { ...r, status: 'Rejected' } : r
                    ),
                  };
                }
                return order;
              })
            );
            if (selectedOrder && selectedOrder.id === orderId) {
              setSelectedOrder(order => {
                if (!order || !order.refundRequests) return order;
                return {
                  ...order,
                  refundRequests: order.refundRequests.map(r =>
                    r.id === refundId ? { ...r, status: 'Rejected' } : r
                  ),
                };
              });
            }
          },
        },
      ]
    );
  };

  // -----------------------------------------------

  const handleSave = () => {
    console.log('Settings Saved:', {
      freeShippingThreshold,
      deliveryRadius,
      timeEstimate,
    });
    setView('orders');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {view === 'settings' || selectedOrder ? (
        <TouchableOpacity onPress={() => (selectedOrder ? setSelectedOrder(null) : setView('orders'))}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}

      <Text style={styles.headerTitle}>
        {selectedOrder
          ? 'Order Detail'
          : view === 'settings'
          ? 'Delivery Settings'
          : 'Manage Delivery'}
      </Text>

      <TouchableOpacity
        onPress={() => {
          if (selectedOrder) setSelectedOrder(null);
          else if (view === 'settings') setView('orders');
          else setView('settings');
        }}
      >
        <Ionicons
          name={
            selectedOrder
              ? 'close-outline'
              : view === 'orders'
              ? 'settings-outline'
              : 'close-outline'
          }
          size={24}
          color="#000"
        />
      </TouchableOpacity>
    </View>
  );

  const renderOrderList = () => (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 100 }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
        {statusFilters.map((status) => (
          <Chip
            key={status}
            selected={statusFilter === status}
            onPress={() => setStatusFilter(status)}
            style={[
              styles.categoryChip,
              statusFilter === status && styles.categoryChipSelected
            ]}
            textStyle={[
              styles.categoryChipText,
              statusFilter === status && styles.categoryChipTextSelected
            ]}
            icon={statusFilter === status ? 'check' : undefined}
          >
            {status}
          </Chip>
        ))}
      </ScrollView>

      {filteredOrders.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.label}>Order: {item.orderNumber}</Text>
          <Text style={styles.text}>
            Date: {item.date} • {item.time}
          </Text>
          <Text style={styles.text}>Status: {item.status}</Text>
          {item.refundRequests && item.refundRequests.length > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 6 }}>
              <Ionicons name="cash-outline" size={16} color="#009688" style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 12, color: '#009688', fontWeight: '500' }}>
                Có yêu cầu hoàn tiền
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => setSelectedOrder(item)}
          >
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderRefundRequests = (order: Order) => {
    if (!order.refundRequests || order.refundRequests.length === 0) return null;
    return (
      <View style={styles.card}>
        <Text style={styles.label}>Yêu cầu hoàn tiền</Text>
        {order.refundRequests.map((refund) => (
          <View key={refund.id} style={{ marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderColor: '#f0f0f0' }}>
            <Text style={{ color: '#F44336', fontWeight: 'bold' }}>Lý do: {refund.reason}</Text>
            <Text>Ghi chú: {refund.note}</Text>
            <Text>Trạng thái: <Text style={{
              color: refund.status === 'Pending' ? '#FF9800'
                : refund.status === 'Approved' ? '#4CAF50'
                : '#F44336',
              fontWeight: 'bold'
            }}>{refund.status}</Text>
            </Text>
            <Text>Gửi lúc: {refund.createdAt}</Text>
            {/* Nút admin: chỉ cho phép nếu vẫn còn Pending */}
            {refund.status === 'Pending' && (
              <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
                <TouchableOpacity
                  style={[styles.refundBtn, { backgroundColor: '#4CAF50' }]}
                  onPress={() => handleAcceptRefund(order.id, refund.id)}
                >
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 6 }}>Chấp nhận</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.refundBtn, { backgroundColor: '#F44336' }]}
                  onPress={() => handleRejectRefund(order.id, refund.id)}
                >
                  <Ionicons name="close" size={18} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 6 }}>Từ chối</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderOrderDetail = () => (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 100 }]}>
      {selectedOrder && (
        <>
          <View style={styles.card}>
            <Text style={styles.label}>Order #: {selectedOrder.orderNumber}</Text>
            <Text style={styles.text}>
              Date: {selectedOrder.date} • {selectedOrder.time}
            </Text>
            <Text style={styles.text}>Status: {selectedOrder.status}</Text>
            {selectedOrder.deliveryAddress && (
              <>
                <Text style={styles.label}>Delivery Address:</Text>
                <Text style={styles.text}>{selectedOrder.deliveryAddress}</Text>
              </>
            )}
            {selectedOrder.estimatedDelivery && (
              <>
                <Text style={styles.label}>Estimated Delivery:</Text>
                <Text style={styles.text}>{selectedOrder.estimatedDelivery}</Text>
              </>
            )}
            <Text style={styles.label}>Items:</Text>
            {selectedOrder.items.map((item, index) => (
              <Text key={index} style={styles.text}>
                - {item.name} x{item.quantity} • {item.price.toLocaleString()} ₫
              </Text>
            ))}
            <Text style={[styles.label, { marginTop: 12 }]}>Total:</Text>
            <Text style={styles.text}>{selectedOrder.total.toLocaleString()} ₫</Text>
            {selectedOrder.status === 'Cancelled' && selectedOrder.rejectionReason && (
              <>
                <Text style={[styles.label, { marginTop: 12 }]}>Lý do từ chối:</Text>
                <Text style={styles.text}>{selectedOrder.rejectionReason}</Text>
              </>
            )}
          </View>
          {/* Hiển thị quản lý refund nếu có */}
          {renderRefundRequests(selectedOrder)}
        </>
      )}
    </ScrollView>
  );

  const renderSettings = () => (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingBottom: 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <Text style={styles.label}>Free Shipping Threshold ($)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={freeShippingThreshold}
          onChangeText={setFreeShippingThreshold}
          placeholder="e.g. 20"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Delivery Radius (km)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={deliveryRadius}
          onChangeText={setDeliveryRadius}
          placeholder="e.g. 5"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Estimated Delivery Time (minutes)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={timeEstimate}
          onChangeText={setTimeEstimate}
          placeholder="e.g. 30"
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {selectedOrder ? renderOrderDetail() : view === 'settings' ? renderSettings() : renderOrderList()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  content: { padding: 16, gap: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
  },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 6, color: '#333' },
  text: { fontSize: 15, color: '#555', marginBottom: 8 },
  input: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  saveButton: {
    marginTop: 10,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  viewButton: {
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  categoryChip: {
    marginRight: 10,
    height: 36,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  categoryChipSelected: {
    backgroundColor: '#007AFF',
  },
  categoryChipText: {
    color: '#007AFF',
    fontWeight: '500',
    fontSize: 14,
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  refundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginRight: 8,
  },
});

export default ManageDelivery;
