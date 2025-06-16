import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ListRenderItem,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../navigation/CustomerStackNavigator';

// Get screen width for tab calculations
const { width: screenWidth } = Dimensions.get('window');
const TAB_WIDTH = (screenWidth - 32) / 4; // 32 = padding left + right

// Types
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
  status: 'Completed' | 'Cancelled' | 'Pending' | 'Processing' | 'Preparing' | 'Ready' | 'Delivering';
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

// Tab types
type TabType = 'Preparing' | 'Delivering' | 'Completed' | 'Cancelled';

// Mock data
const mockOrderHistory: Order[] = [
  {
    id: '1',
    orderNumber: '#ORD-001',
    date: '2024-01-15',
    time: '10:30 AM',
    status: 'Delivering',
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
    status: 'Preparing',
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
    status: 'Ready',
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
  {
    id: '6',
    orderNumber: '#ORD-006',
    date: '2024-01-10',
    time: '9:30 AM',
    status: 'Processing',
    total: 9.25,
    items: [
      { name: 'Mocha', quantity: 1, price: 5.75 },
      { name: 'Cookie', quantity: 1, price: 3.50 },
    ],
  },
  {
    id: '7',
    orderNumber: '#ORD-007',
    date: '2024-01-09',
    time: '4:45 PM',
    status: 'Pending',
    total: 6.50,
    items: [
      { name: 'Green Tea', quantity: 1, price: 3.25 },
      { name: 'Donut', quantity: 1, price: 3.25 },
    ],
  },
  {
    id: '8',
    orderNumber: '#ORD-008',
    date: '2024-01-08',
    time: '11:20 AM',
    status: 'Completed',
    total: 14.75,
    items: [
      { name: 'Caramel Latte', quantity: 1, price: 6.25 },
      { name: 'Bagel', quantity: 1, price: 8.50 },
    ],
  },
];

const OrderHistoryScreen: React.FC<OrderHistoryScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<TabType>('Preparing');

  // Tab configuration - Fixed 4 tabs
  const tabs: { key: TabType; title: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'Preparing', title: 'Preparing', icon: 'restaurant-outline' },
    { key: 'Delivering', title: 'Delivering', icon: 'bicycle-outline' },
    { key: 'Completed', title: 'Completed', icon: 'checkmark-circle-outline' },
    { key: 'Cancelled', title: 'Cancelled', icon: 'close-circle-outline' },
  ];

  // Filter orders based on active tab
  const getFilteredOrders = (): Order[] => {
    switch (activeTab) {
      case 'Preparing':
        return mockOrderHistory.filter(order => 
          ['Processing', 'Preparing', 'Ready', 'Pending'].includes(order.status)
        );
      case 'Delivering':
        return mockOrderHistory.filter(order => order.status === 'Delivering');
      case 'Completed':
        return mockOrderHistory.filter(order => order.status === 'Completed');
      case 'Cancelled':
        return mockOrderHistory.filter(order => order.status === 'Cancelled');
      default:
        return mockOrderHistory;
    }
  };

  // Get count for each tab
  const getTabCount = (tabKey: TabType): number => {
    switch (tabKey) {
      case 'Preparing':
        return mockOrderHistory.filter(order => 
          ['Processing', 'Preparing', 'Ready', 'Pending'].includes(order.status)
        ).length;
      case 'Delivering':
        return mockOrderHistory.filter(order => order.status === 'Delivering').length;
      case 'Completed':
        return mockOrderHistory.filter(order => order.status === 'Completed').length;
      case 'Cancelled':
        return mockOrderHistory.filter(order => order.status === 'Cancelled').length;
      default:
        return 0;
    }
  };

  const getStatusColor = (status: Order['status']): string => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      case 'pending':
        return '#FF9800';
      case 'processing':
        return '#2196F3';
      case 'preparing':
        return '#9C27B0';
      case 'ready':
        return '#00BCD4';
      case 'delivering':
        return '#FF5722';
      default:
        return '#757575';
    }
  };

  const getTabColor = (tabKey: TabType): string => {
    switch (tabKey) {
      case 'Preparing':
        return '#9C27B0';
      case 'Delivering':
        return '#FF5722';
      case 'Completed':
        return '#4CAF50';
      case 'Cancelled':
        return '#F44336';
      default:
        return '#007AFF';
    }
  };

  const canTrackOrder = (status: Order['status']): boolean => {
    const trackableStatuses = ['processing', 'preparing', 'ready', 'delivering'];
    return trackableStatuses.includes(status.toLowerCase());
  };

  const renderTabItem = (tab: { key: TabType; title: string; icon: keyof typeof Ionicons.glyphMap }) => {
    const isActive = activeTab === tab.key;
    const count = getTabCount(tab.key);
    const tabColor = getTabColor(tab.key);

    return (
      <TouchableOpacity
        key={tab.key}
        style={[
          styles.tabItem,
          { width: TAB_WIDTH },
          isActive && { 
            backgroundColor: tabColor + '15', 
            borderBottomColor: tabColor,
            borderBottomWidth: 3,
          }
        ]}
        onPress={() => setActiveTab(tab.key)}
        activeOpacity={0.7}
      >
        <View style={styles.tabContent}>
          <View style={styles.tabIconContainer}>
            <Ionicons 
              name={tab.icon} 
              size={20} 
              color={isActive ? tabColor : '#8E8E93'} 
            />
            {count > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: tabColor }]}>
                <Text style={styles.tabBadgeText}>{count}</Text>
              </View>
            )}
          </View>
          <Text style={[
            styles.tabText,
            { color: isActive ? tabColor : '#8E8E93' }
          ]}>
            {tab.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
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

  const filteredOrders = getFilteredOrders();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
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

      {/* Fixed Tabs - No ScrollView */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsRow}>
          {tabs.map(renderTabItem)}
        </View>
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={
                activeTab === 'Preparing' ? 'restaurant-outline' :
                activeTab === 'Delivering' ? 'bicycle-outline' :
                activeTab === 'Completed' ? 'checkmark-circle-outline' :
                'close-circle-outline'
              } 
              size={64} 
              color="#C7C7CC" 
            />
            <Text style={styles.emptyTitle}>No {activeTab} Orders</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'Preparing' && 'No orders are currently being prepared.'}
              {activeTab === 'Delivering' && 'No orders are currently being delivered.'}
              {activeTab === 'Completed' && 'No completed orders found.'}
              {activeTab === 'Cancelled' && 'No cancelled orders found.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

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
  // Fixed Tab Styles
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingHorizontal: 16,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tabItem: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  tabBadge: {
    position: 'absolute',
    top: -10,
    right: -9,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Order List Styles
  listContainer: {
    padding: 16,
    flexGrow: 1,
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

