// navigation/CustomerStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CartScreen from '../screens/Customer/CartScreen';
import CheckoutScreen from '../screens/Customer/CheckoutScreen';

export type CustomerStackParamList = {
  Cart: undefined;
  Checkout: undefined;
};

const Stack = createNativeStackNavigator<CustomerStackParamList>();

const CustomerStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
    </Stack.Navigator>
  );
};

export default CustomerStackNavigator;
