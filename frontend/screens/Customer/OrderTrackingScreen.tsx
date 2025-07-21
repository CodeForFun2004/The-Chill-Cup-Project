import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/formatCurrency';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../navigation/customer/CustomerStackNavigator';
import type { Order } from '../../data/orders'; // <--- BẮT BUỘC

const { width } = Dimensions.get('window');

type IoniconsName = keyof typeof Ionicons.glyphMap;
interface TrackingStep {
  id: string;
  title: string;
  description: string;
  time?: string;
  status: 'completed' | 'current' | 'pending' | 'cancelled';
  icon: IoniconsName;
}

type Props = NativeStackScreenProps<CustomerStackParamList, 'OrderTracking'>;

const OrderTrackingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { order } = route.params;

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

  const getTrackingSteps = (orderStatus: typeof order.status): TrackingStep[] => {
    const baseSteps: TrackingStep[] = [
      {
        id: '1',
        title: 'Order Confirmed',
        description: 'Your order has been confirmed',
        time: order.time,
        status: 'completed',
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

    switch (orderStatus.toLowerCase()) {
      case 'cancelled':
        return baseSteps.map((step, idx) => ({
          ...step,
          status: idx === 0 ? 'completed' : 'cancelled',
        }));
      case 'preparing':
        return baseSteps.map((step, idx) => ({
          ...step,
          status: idx === 0 ? 'completed' : idx === 1 ? 'current' : 'pending',
          time: idx === 1 ? 'In progress...' : step.time,
        }));
      case 'ready':
        return baseSteps.map((step, idx) => ({
          ...step,
          status: idx <= 1 ? 'completed' : idx === 2 ? 'current' : 'pending',
          time: idx === 2 ? 'Ready now!' : step.time,
        }));
      case 'delivering':
        return baseSteps.map((step, idx) => ({
          ...step,
          status: idx <= 2 ? 'completed' : idx === 3 ? 'current' : 'pending',
          time: idx === 3 ? 'On the way...' : step.time,
        }));
      case 'completed':
        return baseSteps.map((step, idx) => ({
          ...step,
          status: 'completed',
          time: idx === 4 ? 'Delivered!' : step.time,
        }));
      default:
        return baseSteps;
    }
  };

  const getStepColor = (status: TrackingStep['status']) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'current':
        return '#2196F3';
      case 'cancelled':
        return '#F44336';
      default:
        return '#E0E0E0';
    }
  };

  const getStatusMessage = (status: typeof order.status) => {
    switch (status.toLowerCase()) {
      case 'preparing':
        return { message: 'Your order is being prepared with care', color: '#FF9800' };
      case 'ready':
        return { message: 'Your order is ready for pickup!', color: '#4CAF50' };
      case 'delivering':
        return { message: 'Your order is on the way to you', color: '#2196F3' };
      case 'completed':
        return { message: 'Order delivered successfully!', color: '#4CAF50' };
      case 'cancelled':
        return { message: 'This order has been cancelled', color: '#F44336' };
      default:
        return { message: 'Processing your order...', color: '#757575' };
    }
  };

  const trackingSteps = getTrackingSteps(order.status);
  const statusInfo = getStatusMessage(order.status);
  const refundStatus = getRefundStatus();

  const handleCallSupport = () => {
    // Thực tế gọi số support hoặc show modal hỗ trợ
    console.log('Calling support...');
  };

  const handleViewDetails = () => {
    navigation.navigate('OrderDetail', { order });
  };

  return (
    <SafeAreaView style={styles.container}>
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
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <Text style={styles.orderDate}>{order.date} • {order.time}</Text>
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

          {order.estimatedDelivery && order.status !== 'Completed' && order.status !== 'Cancelled' && (
            <View style={styles.estimatedTimeContainer}>
              <Ionicons name="time-outline" size={16} color="#8E8E93" />
              <Text style={styles.estimatedTime}>Estimated delivery: {order.estimatedDelivery}</Text>
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
                  {index < trackingSteps.length - 1 && (
                    <View style={[styles.stepLine, { backgroundColor: getStepColor(trackingSteps[index + 1].status) }]} />
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
              {order.phoneNumber && (
                <View style={styles.deliveryRow}>
                  <Ionicons name="call-outline" size={20} color="#8E8E93" />
                  <Text style={styles.deliveryText}>{order.phoneNumber}</Text>
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

          {(order.status === 'Preparing' || order.status === 'Ready' || order.status === 'Delivering') && (
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
