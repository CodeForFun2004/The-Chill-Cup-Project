import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomerHomeScreen from '../../screens/Customer/CustomerHomeScreen';
import VouchersScreen from '../../screens/Customer/VouchersScreen';
import LoyaltyScreen from '../../screens/Customer/LoyaltyScreen';
import DrinkDetailScreen from '../../screens/Customer/DrinkDetailScreen';

export interface Drink {
  id: string;
  name: string;
  image: string;
  price: number;
  description?: string;
}

export type CustomerHomeStackParamList = {
  CustomerHomeScreen: undefined;
  Vouchers: undefined;
  LoyaltyScreen: undefined;
  DrinkDetailScreen: {
    drink: {
      id: string;
      name: string;
      price: string;
      image: any;
    };
  };
};

const Stack = createNativeStackNavigator<CustomerHomeStackParamList>();

const CustomerHomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerHomeScreen" component={CustomerHomeScreen} />
      <Stack.Screen name="DrinkDetailScreen" component={DrinkDetailScreen} />
      <Stack.Screen name="Vouchers" component={VouchersScreen} />
      <Stack.Screen name="LoyaltyScreen" component={LoyaltyScreen} />
    </Stack.Navigator>
  );
};

export default CustomerHomeStack; 