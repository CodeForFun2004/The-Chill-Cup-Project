// screens/Customer/OrderDetailScreen.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
  Platform, // Import Platform for StatusBar on Android
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { CustomerStackParamList } from '../../navigation/customer/CustomerStackNavigator';
import { formatCurrency } from '../../utils/formatCurrency'; // Assuming this path is correct

// ✅ Import the Order and OrderItem types directly from your Redux slice
import { Order, OrderItem } from '../../redux/slices/orderSlice';

type OrderDetailScreenNavigationProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'OrderDetail'
>;

type OrderDetailScreenRouteProp = RouteProp<CustomerStackParamList, 'OrderDetail'>;

interface OrderDetailScreenProps {
  navigation: OrderDetailScreenNavigationProp;
  route: OrderDetailScreenRouteProp;
}

// Helper to format date and time from an ISO string
const formatDateTime = (isoString: string | undefined): string => {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    // Adjust locale and options as needed for your desired format
    const formattedDate = date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }); // e.g., 10/27/2023
    const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }); // e.g., 21:05
    return `${formattedDate} at ${formattedTime}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};

const OrderDetailScreen: React.FC<OrderDetailScreenProps> = ({ route, navigation }) => {
  const { order } = route.params;

  // Use the order.status directly, but convert to lowercase for internal comparisons
  const currentOrderStatus = order.status.toLowerCase();

  const getStatusColor = (status: Order['status']): string => {
    switch (status.toLowerCase()) { // ✅ Consistent lowercase comparison
      case 'completed':
        return '#4CAF50'; // Green
      case 'cancelled':
        return '#F44336'; // Red
      case 'pending':
        return '#FF9800'; // Orange/Amber for pending
      case 'processing':
      case 'preparing':
      case 'ready':
      case 'delivering':
        return '#2196F3'; // Blue for in-progress statuses
      default:
        return '#757575'; // Gray for unknown/default
    }
  };

  const handleReorder = (): void => {
    Alert.alert(
      'Reorder Items',
      'Add these items to your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add to Cart',
          onPress: () => {
            // ✅ Implement actual reorder logic here, e.g., dispatching an action to add items to cart
            Alert.alert('Success', 'Items added to cart!');
            // Potentially navigate to cart: navigation.navigate('Cart');
          },
        },
      ]
    );
  };

  const handleGetReceipt = (): void => {
    Alert.alert('Receipt', 'Receipt will be sent to your email.');
    // ✅ Implement actual receipt logic (e.g., call API to send email)
  };

  const handleTrackOrder = (): void => {
    navigation.navigate('OrderTracking', { order });
  };

  const canTrackOrder = (): boolean => {
    // ✅ Consistent lowercase comparison for trackable statuses
    const trackableStatuses = ['processing', 'preparing', 'ready', 'delivering'];
    return trackableStatuses.includes(currentOrderStatus);
  };

  // Helper to format payment method display name
  const getPaymentMethodDisplayName = (method: 'vnpay' | 'cod') => {
    switch (method) {
      case 'vnpay':
        return 'VNPay';
      case 'cod':
        return 'Cash on Delivery (COD)';
      default:
        return 'Unknown';
    }
  };

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
        <Text style={styles.headerTitle}>Order Details</Text>
        <TouchableOpacity onPress={handleGetReceipt} style={styles.receiptButton}>
          <Ionicons name="receipt-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 70 }}>
        {/* Order Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={styles.statusText}>{order.status}</Text>
            </View>
          </View>
          {/* ✅ Fixed: Use formatDateTime helper for createdAt */}
          <Text style={styles.orderDateTime}>{formatDateTime(order.createdAt)}</Text>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items.map((item: OrderItem, index: number) => (
            // Using item._id from OrderItem for key, if not present fall back to index (though _id is better)
            <View key={item._id || index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.productId?.name || item.name}</Text> 
                {/* Display size and toppings if they exist on the item */}
                {item.size && <Text style={styles.itemQuantity}>Size: {item.size}</Text>}
                {item.toppings && item.toppings.length > 0 && (
                  <Text style={styles.itemQuantity}>Toppings: {item.toppings.map(t => t.name).join(', ')}</Text>
                )}
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                {/* ✅ Fixed: Use item.productId.image which is a URL string */}
                {item.productId?.image && <Image source={{ uri: item.productId.image }} style={styles.image} />}
              </View>
              {/* Display total price for this specific item row (price per unit * quantity) */}
              {/* <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text> */}
              <Text style={styles.itemPrice}>{formatCurrency(item.productId?.basePrice * item.quantity)}</Text>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            {/* ✅ Fixed: Use order.subtotal directly */}
            <Text style={styles.summaryValue}>{formatCurrency(order.subtotal)}</Text>
          </View>
          {order.discount && order.discount > 0 && ( 
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.summaryValue}>- {formatCurrency(order.discount)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            {/* ✅ Fixed: Use order.tax directly */}
            <Text style={styles.summaryValue}>{formatCurrency(order.tax)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            {/* ✅ Fixed: Use order.deliveryFee directly */}
            <Text style={styles.summaryValue}>{formatCurrency(order.deliveryFee)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            {/* ✅ Correct total */}
            <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentRow}>
            {/* Choose icon based on payment method */}
            {order.paymentMethod === 'vnpay' ? (
              <Ionicons name="card-outline" size={24} color="#007AFF" />
            ) : (
              <Ionicons name="cash-outline" size={24} color="#4CAF50" />
            )}
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentMethod}>{getPaymentMethodDisplayName(order.paymentMethod)}</Text>
              {/* Display additional details if needed for specific payment methods */}
              {order.paymentMethod === 'vnpay' && <Text style={styles.paymentDetails}>Online Payment</Text>}
              {order.paymentMethod === 'cod' && <Text style={styles.paymentDetails}>Cash on delivery</Text>}
            </View>
          </View>
        </View>

        {/* Delivery Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          <View style={styles.deliveryInfo}>
            {order.deliveryAddress && (
              <View style={styles.deliveryRow}>
                <Ionicons name="location-outline" size={20} color="#8E8E93" />
                <Text style={styles.deliveryText}>{order.deliveryAddress}</Text>
              </View>
            )}
            {order.phone && ( 
              <View style={styles.deliveryRow}>
                <Ionicons name="call-outline" size={20} color="#8E8E93" />
                <Text style={styles.deliveryText}>{order.phone}</Text>
              </View>
            )}
            {order.deliveryTime && ( 
              <View style={styles.deliveryRow}>
                <Ionicons name="time-outline" size={20} color="#8E8E93" />
                <Text style={styles.deliveryText}>Est. delivery: {order.deliveryTime}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {/* Track Order Button - for orders in progress */}
          {canTrackOrder() && (
            <TouchableOpacity style={styles.trackButton} onPress={handleTrackOrder}>
              <Ionicons name="location-outline" size={20} color="#FFFFFF" />
              <Text style={styles.trackButtonText}>Track Order</Text>
            </TouchableOpacity>
          )}

          {/* Reorder Button - for completed or cancelled orders */}
          {(currentOrderStatus === 'completed' || currentOrderStatus === 'cancelled') && (
            <TouchableOpacity style={styles.reorderButton} onPress={handleReorder}>
              <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
              <Text style={styles.reorderButtonText}>Reorder</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles (keeping existing styles and adding new ones)
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Handle Android status bar
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  receiptButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  orderDateTime: {
    fontSize: 16,
    color: '#8E8E93',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Changed to flex-start for multi-line item info
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  itemInfo: {
    flex: 1,
    marginRight: 10, // Give some space before price
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2, // Space between quantity and toppings/image
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  image: {
    width: 80, // Smaller image size for better fit in item row
    height: 80,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start', // Align image to the start
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  summaryValue: {
    fontSize: 16,
    color: '#000',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentInfo: {
    marginLeft: 12,
  },
  paymentMethod: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  paymentDetails: {
    fontSize: 14,
    color: '#8E8E93',
  },
  deliveryInfo: {
    gap: 12,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
    flex: 1,
  },
  actionButtons: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 8,
  },
  trackButton: {
    backgroundColor: '#FF9800',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  trackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reorderButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  reorderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default OrderDetailScreen;