import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Chip } from 'react-native-paper';
import { orders as initialOrders, Order } from '../../data/orders';

const ManageDelivery = () => {
  const [view, setView] = useState<'orders' | 'settings'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deliveryOrders, setDeliveryOrders] = useState<Order[]>([...initialOrders]);
  const [statusFilter, setStatusFilter] = useState<
    'All' | 'Pending' | 'Processing' | 'Preparing' | 'Ready' | 'Delivering' | 'Completed' | 'Cancelled'
  >('All');

  const [freeShippingThreshold, setFreeShippingThreshold] = useState('20');
  const [deliveryRadius, setDeliveryRadius] = useState('5');
  const [timeEstimate, setTimeEstimate] = useState('30');

  const filteredOrders = deliveryOrders.filter(order => {
    return statusFilter === 'All' || order.status === statusFilter;
  });

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
        {[
          'All',
          'Pending',
          'Processing',
          'Preparing',
          'Ready',
          'Delivering',
          'Completed',
          'Cancelled',
        ].map((status) => (
          <Chip
            key={status}
            selected={statusFilter === status}
            onPress={() => setStatusFilter(status as typeof statusFilter)}
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

  const renderOrderDetail = () => (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 100 }]}>
      {selectedOrder && (
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

import { TextInput } from 'react-native'; // Add if not already imported

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
});

export default ManageDelivery;
