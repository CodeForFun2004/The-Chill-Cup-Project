// navigation/CustomerStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CartScreen from '../screens/Customer/CartScreen';
import CheckoutScreen from '../screens/Customer/CheckoutScreen';
import VouchersScreen from '../screens/Customer/VouchersScreen';
import LoyaltyScreen from '../screens/Customer/LoyaltyScreen';
import OrderSuccessScreen from '../screens/Customer/OrderSuccessScreen';
import VNPayGatewayScreen from '../screens/Customer/VNPayGatewayScreen';

export type CustomerStackParamList = {
  Cart: undefined;
  Checkout: undefined;
  Vouchers: undefined;
  LoyaltyScreen: undefined;
  VNPayGateway: undefined;
  OrderSuccess: undefined;
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
    </Stack.Navigator>
  );
};

export default CustomerStackNavigator;
