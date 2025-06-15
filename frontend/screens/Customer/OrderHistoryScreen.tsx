import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ListRenderItem,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../navigation/CustomerStackNavigator';

// Updated types - consistent với OrderDetail và OrderTracking
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: any;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  time: string;
  status: 'Completed' | 'Cancelled' | 'Pending' | 'Processing' | 'Preparing' | 'Ready' | 'Delivering'; // 👈 Updated
  total: number;
  items: OrderItem[];
  estimatedDelivery?: string;
  deliveryAddress?: string;
  phoneNumber?: string;
}

type OrderHistoryScreenNavigationProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'OrderHistory'
>;

interface OrderHistoryScreenProps {
  navigation: OrderHistoryScreenNavigationProp;
}

// Updated mock data với các status mới
const mockOrderHistory: Order[] = [
  {
    id: '1',
    orderNumber: '#ORD-001',
    date: '2024-01-15',
    time: '10:30 AM',
    status: 'Delivering', // 👈 New status
    total: 15.50,
    items: [
      { name: 'Cappuccino', quantity: 2, price: 4.50 },
      { name: 'Croissant', quantity: 1, price: 6.50 },
    ],
    estimatedDelivery: '11:00 AM',
    deliveryAddress: '123 Coffee Street, Brew City',
  },
  {
    id: '2',
    orderNumber: '#ORD-002',
    date: '2024-01-14',
    time: '2:15 PM',
    status: 'Preparing', // 👈 New status
    total: 8.75,
    items: [
      { name: 'Latte', quantity: 1, price: 5.25 },
      { name: 'Blueberry Muffin', quantity: 1, price: 3.50 },
    ],
    estimatedDelivery: '2:45 PM',
  },
  {
    id: '3',
    orderNumber: '#ORD-003',
    date: '2024-01-13',
    time: '8:45 AM',
    status: 'Completed',
    total: 12.25,
    items: [
      { name: 'Americano', quantity: 1, price: 3.75 },
      { name: 'Sandwich', quantity: 1, price: 8.50 },
    ],
  },
  {
    id: '4',
    orderNumber: '#ORD-004',
    date: '2024-01-12',
    time: '3:20 PM',
    status: 'Ready', // 👈 New status
    total: 7.50,
    items: [
      { name: 'Espresso', quantity: 2, price: 3.75 },
    ],
  },
  {
    id: '5',
    orderNumber: '#ORD-005',
    date: '2024-01-11',
    time: '10:15 AM',
    status: 'Cancelled',
    total: 18.00,
    items: [
      { name: 'Frappuccino', quantity: 1, price: 6.50 },
      { name: 'Cake', quantity: 1, price: 11.50 },
    ],
  },
];

const OrderHistoryScreen: React.FC<OrderHistoryScreenProps> = ({ navigation }) => {
  // Updated getStatusColor để handle tất cả status
  const getStatusColor = (status: Order['status']): string => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#4CAF50'; // Green
      case 'cancelled':
        return '#F44336'; // Red
      case 'pending':
        return '#FF9800'; // Orange
      case 'processing':
        return '#2196F3'; // Blue
      case 'preparing':
        return '#9C27B0'; // Purple
      case 'ready':
        return '#00BCD4'; // Cyan
      case 'delivering':
        return '#FF5722'; // Deep Orange
      default:
        return '#757575'; // Gray
    }
  };

  // Helper function để check xem có thể track không
  const canTrackOrder = (status: Order['status']): boolean => {
    const trackableStatuses = ['processing', 'preparing', 'ready', 'delivering'];
    return trackableStatuses.includes(status.toLowerCase());
  };

  const renderOrderItem: ListRenderItem<Order> = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', { order: item })}
      activeOpacity={0.7}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          <Text style={styles.orderDate}>{item.date} • {item.time}</Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.orderBody}>
        <Text style={styles.itemsText}>
          {item.items.length} item{item.items.length > 1 ? 's' : ''}
        </Text>
        <Text style={styles.totalText}>${item.total.toFixed(2)}</Text>
      </View>

      {/* Show estimated delivery for active orders */}
      {item.estimatedDelivery && canTrackOrder(item.status) && (
        <View style={styles.estimatedDeliveryContainer}>
          <Ionicons name="time-outline" size={14} color="#8E8E93" />
          <Text style={styles.estimatedDeliveryText}>
            Est. delivery: {item.estimatedDelivery}
          </Text>
        </View>
      )}
      
      <View style={styles.orderFooter}>
        <Text style={styles.viewDetailsText}>
          {canTrackOrder(item.status) ? 'Tap to track order' : 'Tap to view details'}
        </Text>
        <Ionicons 
          name={canTrackOrder(item.status) ? 'location-outline' : 'chevron-forward'} 
          size={16} 
          color="#8E8E93" 
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={mockOrderHistory}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySubtitle}>
              Your order history will appear here once you make your first purchase.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

// Updated styles với thêm styles mới
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  orderBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemsText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  totalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  // 👈 New styles
  estimatedDeliveryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  estimatedDeliveryText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 32,
  },
});

export default OrderHistoryScreen;