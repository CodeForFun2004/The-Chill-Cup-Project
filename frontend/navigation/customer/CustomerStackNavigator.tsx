import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CustomerHomeScreen from '../../screens/Customer/CustomerHomeScreen';
import CartScreen from '../../screens/Customer/CartScreen';
import CheckoutScreen from '../../screens/Customer/CheckoutScreen';
import VouchersScreen from '../../screens/Customer/VouchersScreen';
import LoyaltyScreen from '../../screens/Customer/LoyaltyScreen';
import OrderSuccessScreen from '../../screens/Customer/OrderSuccessScreen';
import OrderHistoryScreen from '../../screens/Customer/OrderHistoryScreen';
import OrderDetailScreen from '../../screens/Customer/OrderDetailScreen';
import OrderTrackingScreen from '../../screens/Customer/OrderTrackingScreen';
import NotificationScreen from '../../screens/Customer/NotificationScreen';


// ✅ IMPORT ĐỊNH NGHĨA ORDER TỪ ORDER SLICE
import { Order } from '../../redux/slices/orderSlice'; 

// Loại bỏ định nghĩa OrderItem và Order cục bộ ở đây,
// vì chúng ta sẽ dùng định nghĩa đầy đủ từ orderSlice.ts


import VietQRGatewayScreen from '../../screens/Customer/VietQRGatewayScreen';


export type CustomerStackParamList = {
  Home: undefined;
  Cart: undefined;
  Checkout: undefined;
  Vouchers: undefined;
  LoyaltyScreen: undefined;

  RequestRefund: { order: Order };

 VietQRGateway: { orderId: string };
  OrderSuccess: { orderId: string };
  OrderHistory: undefined;
  Notifications: undefined;
  // ✅ Đảm bảo kiểu 'order' ở đây là kiểu 'Order' ĐẦY ĐỦ từ orderSlice
  OrderDetail: {
    order: Order; 
  };
  // ✅ Đảm bảo kiểu 'order' ở đây là kiểu 'Order' ĐẦY ĐỦ từ orderSlice
  OrderTracking: {
    order: Order; 
  };
};

const Stack = createNativeStackNavigator<CustomerStackParamList>();


const CustomerStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={CustomerHomeScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Vouchers" component={VouchersScreen} />
      <Stack.Screen name="LoyaltyScreen" component={LoyaltyScreen} />
      <Stack.Screen name="VietQRGateway" component={VietQRGatewayScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="Notifications" component={NotificationScreen} />
    </Stack.Navigator>
  );
};

export default CustomerStackNavigator;

