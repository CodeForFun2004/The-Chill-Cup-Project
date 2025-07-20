import React, { useEffect } from 'react';
import { StyleSheet, ScrollView, Text, ActivityIndicator, View } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/rootReducer';
import { CustomerStackParamList } from '../../navigation/customer/CustomerStackNavigator';

import OrderSuccessHeader from '../../components/order-success/OrderSuccessHeader';
import OrderSummaryDetails from '../../components/order-success/OrderSummaryDetails';
import OrderSuccessActions from '../../components/order-success/OrderSuccessActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch } from '../../redux/hooks';
// ✅ Import resetOrderState từ orderSlice
import { fetchOrderById, resetOrderState } from '../../redux/slices/orderSlice'; 

type OrderSuccessScreenRouteProp = RouteProp<CustomerStackParamList, 'OrderSuccess'>;


const OrderSuccessScreen = () => {
  const route = useRoute<OrderSuccessScreenRouteProp>();
  const { orderId } = route.params;
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<CustomerStackParamList>>();
  const { currentOrder, loading, error } = useSelector((state: RootState) => state.order);

  useEffect(() => {
    console.log('OrderSuccessScreen: orderId from params:', orderId);
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
    // Cleanup khi unmount
    return () => {
      console.log('OrderSuccessScreen: Component unmounting, dispatching resetOrderState.');
      dispatch(resetOrderState());
    };
  }, [orderId, dispatch]);

  // Hàm xử lý về trang chủ: reset order state và xóa orderId khỏi AsyncStorage
  const handleBackToHome = async () => {
    dispatch(resetOrderState());
    try {
      await AsyncStorage.removeItem('orderId');
    } catch (e) {
      console.warn('Không thể xóa orderId khỏi AsyncStorage:', e);
    }
    // Điều hướng về tab Home ở bottom tab
    const parentNav = navigation.getParent();
    if (parentNav) {
      parentNav.navigate('CustomerHomeStack');
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
  };

  // ... (phần loading/error/no data display vẫn giữ nguyên)
  if (loading && !currentOrder) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#e53935" />
        <Text style={styles.loadingText}>Đang tải chi tiết đơn hàng...</Text>
      </View>
    );
  }

  if (error && !currentOrder) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Lỗi: Không thể tải chi tiết đơn hàng. {error}</Text>
      </View>
    );
  }

  if (!currentOrder || currentOrder._id !== orderId) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.loadingText}>Đang chờ thông tin đơn hàng...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <OrderSuccessHeader />
      <OrderSummaryDetails order={currentOrder} />
      {/* Nút về trang chủ sẽ gọi handleBackToHome */}
      <OrderSuccessActions onBackToHome={handleBackToHome} />
    </ScrollView>
  );
};

export default OrderSuccessScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    paddingBottom: 100,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});