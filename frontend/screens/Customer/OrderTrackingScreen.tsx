import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform, // Import Platform for StatusBar handling
  Linking, // Import Linking for call functionality
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/formatCurrency'; // Assuming this path is correct
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../navigation/customer/CustomerStackNavigator';


// ✅ Import the Order type directly from your Redux slice
// import { Order } from '../../redux/slices/orderSlice';

// const { width } = Dimensions.get('window');

type IoniconsName = keyof typeof Ionicons.glyphMap;
interface TrackingStep {
  id: string;
  title: string;
  description: string;
  time?: string; // Optional time specific to a step (e.g., "In progress...", "Ready now!")
  status: 'completed' | 'current' | 'pending' | 'cancelled';
  icon: IoniconsName;
}

type Props = NativeStackScreenProps<CustomerStackParamList, 'OrderTracking'>;

// Helper to format date and time from an ISO string
const formatDateTime = (isoString: string | undefined): string => {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    // Use 'en-US' locale for consistent 2-digit month/day, or your desired locale
    const formattedDate = date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }); // 24-hour format
    return `${formattedDate} • ${formattedTime}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};

const OrderTrackingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { order } = route.params;


// <!--    Larefundrefund      -->
  // Lấy trạng thái refund mới nhất (nếu có)
  const getRefundStatus = () => {
    if (!order.refundRequests || order.refundRequests.length === 0) return null;
    const latest = order.refundRequests[0];
    switch (latest.status) {
      case 'Pending':
        return {
          label: 'Đang yêu cầu hoàn tiền',
          color: '#FF9800',
          icon: 'sync-circle' as IoniconsName,
        };
      case 'Approved':
        return {
          label: 'Đã hoàn tiền',
          color: '#4CAF50',
          icon: 'cash-outline' as IoniconsName,
        };
      case 'Rejected':
        return {
          label: 'Đã từ chối hoàn tiền',
          color: '#F44336',
          icon: 'close-circle' as IoniconsName,
        };
      default:
        return null;
    }
  };


// <!--  Main hiện tại  -->
  // Ensure order.status is treated as lowercase for comparisons
  const currentOrderStatus = order.status.toLowerCase();

  const getTrackingSteps = (orderStatus: string): TrackingStep[] => {
    // Define all possible steps with default pending status

    const baseSteps: TrackingStep[] = [
      {
        id: '1',
        title: 'Order Confirmed',
        description: 'Your order has been confirmed',
        status: 'pending',
        icon: 'checkmark-circle',
      },
      {
        id: '2',
        title: 'Preparing',
        description: 'Your coffee is being prepared',
        status: 'pending',
        icon: 'restaurant',
      },
      {
        id: '3',
        title: 'Ready for Pickup/Delivery',
        description: 'Your order is ready',
        status: 'pending',
        icon: 'bag-check',
      },
      {
        id: '4',
        title: 'Out for Delivery',
        description: 'Your order is on the way',
        status: 'pending',
        icon: 'bicycle',
      },
      {
        id: '5',
        title: 'Delivered',
        description: 'Order delivered successfully',
        status: 'pending',
        icon: 'home',
      },
    ];


    // Map through steps and update their status based on the current order status
    return baseSteps.map((step, index) => {
      let stepStatus: TrackingStep['status'] = 'pending';
      let stepTime: string | undefined = undefined;

      switch (orderStatus) {
        case 'cancelled':
          // If order is cancelled, only the first step (confirmed) is completed, others are cancelled.
          stepStatus = index === 0 ? 'completed' : 'cancelled';
          if (index === 0 && order.createdAt) {
            stepTime = formatDateTime(order.createdAt).split(' • ')[1]; // Get only time part
          }
          break;
        case 'pending':
        case 'processing': // Assuming 'processing' is an initial state before 'preparing'
          if (index === 0) {
            stepStatus = 'current';
            if (order.createdAt) stepTime = formatDateTime(order.createdAt).split(' • ')[1];
          }
          break;
        case 'preparing':
          if (index === 0) stepStatus = 'completed';
          if (index === 1) {
            stepStatus = 'current';
            stepTime = 'In progress...';
          }
          break;
        case 'ready':
          if (index <= 1) stepStatus = 'completed';
          if (index === 2) {
            stepStatus = 'current';
            stepTime = 'Ready now!';
          }
          break;
        case 'delivering':
          if (index <= 2) stepStatus = 'completed';
          if (index === 3) {
            stepStatus = 'current';
            stepTime = 'On the way...';
          }
          break;
        case 'completed':
          stepStatus = 'completed';
          if (index === 0 && order.createdAt) {
            stepTime = formatDateTime(order.createdAt).split(' • ')[1];
          } else if (index === 4) {
            // You might want to store a 'deliveredAt' timestamp on your order for accuracy
            stepTime = 'Delivered!';
          }
          break;
        default:
          // Fallback for unknown statuses, keep as pending
          break;
      }

      return {
        ...step,
        status: stepStatus,
        time: stepTime || step.time, // Prioritize dynamically set time
      };
    });

  };

  const getStepColor = (status: TrackingStep['status']) => {
    switch (status) {
      case 'completed':
        return '#4CAF50'; // Green
      case 'current':
        return '#2196F3'; // Blue
      case 'cancelled':
        return '#F44336'; // Red
      default:
        return '#E0E0E0'; // Gray
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return { message: 'Your order is awaiting confirmation', color: '#FFC107' }; // Amber
      case 'processing':
        return { message: 'Your order is being processed', color: '#FF9800' }; // Orange
      case 'preparing':
        return { message: 'Your order is being prepared with care', color: '#FF9800' }; // Orange
      case 'ready':
        return { message: 'Your order is ready for pickup!', color: '#4CAF50' }; // Green
      case 'delivering':
        return { message: 'Your order is on the way to you', color: '#2196F3' }; // Blue
      case 'completed':
        return { message: 'Order delivered successfully!', color: '#4CAF50' }; // Green
      case 'cancelled':
        return { message: 'This order has been cancelled', color: '#F44336' }; // Red
      default:
        return { message: 'Processing your order...', color: '#757575' }; // Gray
    }
  };


  const trackingSteps = getTrackingSteps(currentOrderStatus);
  const statusInfo = getStatusMessage(currentOrderStatus);
        
//           Refund LanNhi
           const refundStatus = getRefundStatus();

  const handleCallSupport = () => {
    if (order.phone) {
      Linking.openURL(`tel:${order.phone}`); // Use Linking to open phone dialer
    } else {
      console.log('No phone number available for support.');
      // You might want to show an alert or a default support number
    }

  };

  const handleViewDetails = () => {
    navigation.navigate('OrderDetail', { order });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Adjust StatusBar for Android to avoid content overlapping */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order</Text>
        <TouchableOpacity onPress={handleCallSupport} style={styles.supportButton}>
          <Ionicons name="call-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 70 }}>
        <View style={styles.orderInfoCard}>
          <View style={styles.orderInfoHeader}>
            <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
            {/* ✅ Fixed: Use formatDateTime helper for createdAt */}
            <Text style={styles.orderDate}>{formatDateTime(order.createdAt)}</Text>
          </View>

          <View style={[styles.statusMessageContainer, { backgroundColor: statusInfo.color + '20' }]}>
            <Ionicons name="information-circle" size={20} color={statusInfo.color} />
            <Text style={[styles.statusMessage, { color: statusInfo.color }]}>
              {statusInfo.message}
            </Text>
          </View>


          {/* Trạng thái refund (nếu có) */}
          {refundStatus && (
            <View style={[
              styles.statusMessageContainer,
              { backgroundColor: refundStatus.color + '20', marginTop: 0 }
            ]}>
              <Ionicons name={refundStatus.icon} size={20} color={refundStatus.color} />
              <Text style={[styles.statusMessage, { color: refundStatus.color }]}>
                {refundStatus.label}
              </Text>
            </View>
          )}

          

          {/* ✅ Fixed: Use order.deliveryTime and check for "completed" or "cancelled" status */}
          {order.deliveryTime && currentOrderStatus !== 'completed' && currentOrderStatus !== 'cancelled' && (

            <View style={styles.estimatedTimeContainer}>
              <Ionicons name="time-outline" size={16} color="#8E8E93" />
              <Text style={styles.estimatedTime}>Estimated delivery: {order.deliveryTime}</Text>
            </View>
          )}
        </View>

        <View style={styles.trackingContainer}>
          <Text style={styles.sectionTitle}>Order Progress</Text>
          <View style={styles.trackingSteps}>
            {trackingSteps.map((step, index) => (
              <View key={step.id} style={styles.stepContainer}>
                <View style={styles.stepIndicator}>
                  <View style={[styles.stepCircle, { backgroundColor: getStepColor(step.status) }]}>
                    <Ionicons name={step.status === 'cancelled' ? 'close' : step.icon} size={20} color="#FFFFFF" />
                  </View>
                  {/* Render line only if it's not the last step AND not cancelled (unless it's the first step of a cancelled order) */}
                  {index < trackingSteps.length - 1 && (
                    <View style={[
                      styles.stepLine,
                      { backgroundColor: getStepColor(trackingSteps[index + 1].status) },
                      // If the current step is completed and the next is pending/current, make the line active
                      (step.status === 'completed' || step.status === 'current') && trackingSteps[index + 1].status !== 'cancelled' && styles.activeStepLine
                    ]} />
                  )}
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: step.status === 'cancelled' ? '#F44336' : '#000' }]}>{step.title}</Text>
                  <Text style={[styles.stepDescription, { color: step.status === 'cancelled' ? '#F44336' : '#8E8E93' }]}>{step.description}</Text>
                  {step.time && <Text style={styles.stepTime}>{step.time}</Text>}
                </View>
              </View>
            ))}
          </View>
        </View>

        {order.deliveryAddress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Information</Text>
            <View style={styles.deliveryInfo}>
              <View style={styles.deliveryRow}>
                <Ionicons name="location-outline" size={20} color="#8E8E93" />
                <Text style={styles.deliveryText}>{order.deliveryAddress}</Text>
              </View>
              {/* ✅ Fixed: Use order.phone property from Order type */}
              {order.phone && (
                <View style={styles.deliveryRow}>
                  <Ionicons name="call-outline" size={20} color="#8E8E93" />
                  <Text style={styles.deliveryText}>{order.phone}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Order Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.detailsButton} onPress={handleViewDetails}>
            <Text style={styles.detailsButtonText}>View Order Details</Text>
          </TouchableOpacity>

          {(currentOrderStatus === 'preparing' || currentOrderStatus === 'ready' || currentOrderStatus === 'delivering') && (
            <TouchableOpacity style={styles.supportButton2} onPress={handleCallSupport}>
              <Ionicons name="headset-outline" size={20} color="#007AFF" />
              <Text style={styles.supportButtonText}>Contact Support</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
  supportButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  orderInfoCard: {
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
  orderInfoHeader: {
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 16,
    color: '#8E8E93',
  },
  statusMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  statusMessage: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  estimatedTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estimatedTime: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
  },
  trackingContainer: {
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
    marginBottom: 20,
  },
  trackingSteps: {
    paddingLeft: 10,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    width: 2,
    height: 30,
    marginTop: 8,
    backgroundColor: '#E0E0E0', // Default color for pending lines
  },
  activeStepLine: {
    backgroundColor: '#2196F3', // Color for active/completed lines
  },
  stepContent: {
    flex: 1,
    paddingTop: 8,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  stepTime: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
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
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  actionButtons: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 12,
  },
  detailsButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  supportButton2: {
    backgroundColor: '#F8F9FA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 8,
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
});

export default OrderTrackingScreen;
