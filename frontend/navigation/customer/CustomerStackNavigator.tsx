import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CartScreen from '../../screens/Customer/CartScreen';
import CheckoutScreen from '../../screens/Customer/CheckoutScreen';
import VouchersScreen from '../../screens/Customer/VouchersScreen';
import LoyaltyScreen from '../../screens/Customer/LoyaltyScreen';
import OrderSuccessScreen from '../../screens/Customer/OrderSuccessScreen';
import OrderHistoryScreen from '../../screens/Customer/OrderHistoryScreen';
import OrderDetailScreen from '../../screens/Customer/OrderDetailScreen';
import OrderTrackingScreen from '../../screens/Customer/OrderTrackingScreen';
import NotificationScreen from '../../screens/Customer/NotificationScreen';

// ✅ Chỉ import type Order đúng chuẩn
import type { Order } from '../../data/orders';

export type CustomerStackParamList = {
  Cart: undefined;
  Checkout: undefined;
  Vouchers: undefined;
  LoyaltyScreen: undefined;
  OrderSuccess: undefined;
  OrderHistory: undefined;
  Notifications: undefined;
  OrderDetail: { order: Order };
  OrderTracking: { order: Order };
  RequestRefund: { order: Order };
};

const Stack = createNativeStackNavigator<CustomerStackParamList>();

const CustomerStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Vouchers" component={VouchersScreen} />
      <Stack.Screen name="LoyaltyScreen" component={LoyaltyScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
    </Stack.Navigator>
  );
};

export default CustomerStackNavigator;
