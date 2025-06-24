// navigation/CustomerStackNavigator.tsx
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

// Types for Order data
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: any; // ImageSourcePropType
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

import VNPayGatewayScreen from '../../screens/Customer/VNPayGatewayScreen';

export type CustomerStackParamList = {
  Cart: undefined;
  Checkout: undefined;
  Vouchers: undefined;
  LoyaltyScreen: undefined;
  VNPayGateway: undefined;
  OrderSuccess: undefined;
  OrderHistory: undefined;
  OrderDetail: {
    order: Order;
  };
  OrderTracking: {
    order: Order;
  };
  
};

const Stack = createNativeStackNavigator<CustomerStackParamList>();

const CustomerStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Vouchers" component={VouchersScreen} />
      <Stack.Screen name="LoyaltyScreen" component={LoyaltyScreen} />
      <Stack.Screen name="VNPayGateway" component={VNPayGatewayScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
    </Stack.Navigator>
  );
};

export default CustomerStackNavigator;