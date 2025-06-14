import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomerHomeScreen from '../screens/Customer/CustomerHomeScreen';
import VouchersScreen from '../screens/Customer/VouchersScreen';
import LoyaltyScreen from '../screens/Customer/LoyaltyScreen';

export type CustomerHomeStackParamList = {
  CustomerHomeScreen: undefined;
  Vouchers: undefined;
  LoyaltyScreen: undefined;
};

const Stack = createNativeStackNavigator<CustomerHomeStackParamList>();

const CustomerHomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerHomeScreen" component={CustomerHomeScreen} />
      <Stack.Screen name="Vouchers" component={VouchersScreen} />
      <Stack.Screen name="LoyaltyScreen" component={LoyaltyScreen} />
    </Stack.Navigator>
  );
};

export default CustomerHomeStack; 