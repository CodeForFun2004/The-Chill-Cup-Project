// screens/Customer/OrderDetailScreen.tsx
import React, { useState } from 'react';
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

  TextInput,
  Modal,

  Platform, // Import Platform for StatusBar on Android

} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { CustomerStackParamList } from '../../navigation/customer/CustomerStackNavigator';



import * as ImagePicker from 'expo-image-picker';

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

// <!-- // NhiNTL -->
const refundReasons = [
  'Đồ uống bị lỗi',
  'Không nhận được đơn',
  'Nhận nhầm sản phẩm',
  'Khác (ghi rõ ở phần lời nhắn)',
];

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



import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrderById } from '../../redux/slices/orderSlice';

const OrderDetailScreen: React.FC<OrderDetailScreenProps> = ({ route, navigation }) => {
  const dispatch = useDispatch();
  // const orderId = route.params.order?._id || route.params.orderId;
  const orderId = route.params.order?._id;
  const order = useSelector((state: any) => state.order.currentOrder);
  const loading = useSelector((state: any) => state.order.loading);
  const error = useSelector((state: any) => state.order.error);
  const [showRefundPopup, setShowRefundPopup] = useState(false);

  // Refund form state
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);


  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId) as any);
    }
  }, [orderId, dispatch]);

  // Use the order.status directly, but convert to lowercase for internal comparisons
  const currentOrderStatus = order?.status?.toLowerCase?.() || '';

  const getStatusColor = (status: Order['status']): string => {
    switch (status?.toLowerCase?.()) {
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
    if (order) navigation.navigate('OrderTracking', { order });
  };

  const canTrackOrder = (): boolean => {
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

  const showRequestRefund =
    order?.status?.toLowerCase?.() === 'completed' || order?.status?.toLowerCase?.() === 'cancelled';

  // Mở popup refund form
  const handleRequestRefund = () => setShowRefundPopup(true);

  // Pick Image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  // Pick Video
  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setVideo(result.assets[0].uri);
    }
  };

  // Xác nhận trước khi gửi
  const handleSubmitConfirm = () => {
    if (!reason || !note.trim() || !image || !video) {
      Alert.alert('Lỗi', 'Bạn cần nhập đầy đủ lý do, lời nhắn, hình ảnh và video!');
      return;
    }
    Alert.alert(
      "Xác nhận gửi yêu cầu?",
      "Bạn chắc chắn muốn gửi yêu cầu hoàn tiền này?",
      [
        { text: "Huỷ", style: "cancel" },
        { text: "Đồng ý", style: "destructive", onPress: doSubmitRefund }
      ]
    );
  };

  // Gửi refund
  const doSubmitRefund = () => {
    Alert.alert('Thành công', 'Yêu cầu hoàn tiền đã được gửi!');
    setShowRefundPopup(false);
    setReason('');
    setNote('');
    setImage(null);
    setVideo(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'red' }}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }
  if (!order) {
    return null;
  }

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
              {/* Hiển thị giá đã tính cho từng item (snapshot khi order) */}
              <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
            </View>
          ))}
        </View>

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentRow}>
            {/* Choose icon based on payment method */}
            {order.paymentMethod === 'vietqr' ? (
              <Ionicons name="card-outline" size={24} color="#007AFF" />
            ) : (
              <Ionicons name="cash-outline" size={24} color="#4CAF50" />
            )}
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentMethod}>{getPaymentMethodDisplayName(order.paymentMethod)}</Text>
              {/* Display additional details if needed for specific payment methods */}
              {order.paymentMethod === 'vietqr' && <Text style={styles.paymentDetails}>Online Payment</Text>}
              {order.paymentMethod === 'cod' && <Text style={styles.paymentDetails}>Cash on delivery</Text>}
            </View>
          </View>
        </View>

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
        
{/* <!--         Refund order --> */}
          {showRequestRefund && (
            <TouchableOpacity style={styles.refundButton} onPress={handleRequestRefund}>
              <Ionicons name="cash-outline" size={20} color="#FFFFFF" />
              <Text style={styles.refundButtonText}>Request Refund</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

   
      <Modal
        visible={showRefundPopup}
        animationType="slide"
        transparent
        onRequestClose={() => setShowRefundPopup(false)}
      >
        <View style={popupStyles.overlay}>
          <View style={popupStyles.modalContent}>
            <View style={popupStyles.header}>
              <Text style={popupStyles.title}>Yêu cầu hoàn tiền</Text>
              <TouchableOpacity onPress={() => setShowRefundPopup(false)}>
                <Ionicons name="close" size={24} color="#222" />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={{ maxHeight: 420 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 30 }}
            >
              <Text style={popupStyles.label}>Chọn lý do hoàn tiền *</Text>
              {refundReasons.map(r => (
                <TouchableOpacity
                  key={r}
                  style={[popupStyles.reasonItem, reason === r && popupStyles.reasonItemActive]}
                  onPress={() => setReason(r)}
                >
                  <Text style={{ color: reason === r ? '#fff' : '#333' }}>{r}</Text>
                  {reason === r && <Ionicons name="checkmark-circle" size={18} color="#fff" style={{ marginLeft: 4 }} />}
                </TouchableOpacity>
              ))}

              <Text style={[popupStyles.label, { marginTop: 20 }]}>Lời nhắn *</Text>
              <TextInput
                style={popupStyles.input}
                placeholder="Nhập lý do cụ thể..."
                value={note}
                onChangeText={setNote}
                multiline
              />

              <Text style={[popupStyles.label, { marginTop: 20 }]}>Hình ảnh minh họa *</Text>
              <TouchableOpacity style={popupStyles.uploadBtn} onPress={pickImage}>
                <Ionicons name="image-outline" size={24} color="#007AFF" />
                <Text style={{ marginLeft: 8, color: '#007AFF' }}>Chọn ảnh</Text>
              </TouchableOpacity>
              {image && <Image source={{ uri: image }} style={popupStyles.previewImage} />}

              <Text style={[popupStyles.label, { marginTop: 20 }]}>Video minh họa *</Text>
              <TouchableOpacity style={popupStyles.uploadBtn} onPress={pickVideo}>
                <Ionicons name="videocam-outline" size={24} color="#007AFF" />
                <Text style={{ marginLeft: 8, color: '#007AFF' }}>Chọn video</Text>
              </TouchableOpacity>
              {video && (
                <View style={popupStyles.videoPreview}>
                  <Ionicons name="videocam" size={20} color="#007AFF" />
                  <Text style={{ marginLeft: 6, color: '#333' }}>Đã chọn video</Text>
                </View>
              )}

              <TouchableOpacity style={popupStyles.submitBtn} onPress={handleSubmitConfirm}>
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Gửi yêu cầu hoàn tiền</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* ===== END POPUP ===== */}

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

  refundButton: {
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  refundButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // image: {
  //   width: 120,
  //   height: 120,
  //   borderRadius: 8,
  //   marginTop: 8,
  // },

});

const popupStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10,10,10,0.24)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    elevation: 10,
    maxHeight: '90%'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  title: {
    fontSize: 18, fontWeight: '700', color: '#222'
  },
  body: {},
  label: {
    fontWeight: '500', marginBottom: 8, color: '#333'
  },
  reasonItem: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    paddingVertical: 12, paddingHorizontal: 14, marginBottom: 8, backgroundColor: '#fff'
  },
  reasonItemActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  input: {
    minHeight: 60, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12,
    backgroundColor: '#fff', textAlignVertical: 'top'
  },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    backgroundColor: '#F0F2F8', borderRadius: 8, marginBottom: 6,
  },
  previewImage: {
    width: 120, height: 120, borderRadius: 10, marginTop: 8,
  },
  videoPreview: {
    flexDirection: 'row', alignItems: 'center', marginTop: 8, padding: 8, backgroundColor: '#eee', borderRadius: 8,
  },
  submitBtn: {
    marginTop: 28, backgroundColor: '#F44336', padding: 16, borderRadius: 12, alignItems: 'center'
  }
});

export default OrderDetailScreen;
