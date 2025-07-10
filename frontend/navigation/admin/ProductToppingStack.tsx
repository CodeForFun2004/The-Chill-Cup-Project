// navigation/admin/ProductToppingStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ManageProducts from '../../screens/Admin/ManageProducts';
import ToppingManagementScreen from '../../screens/Admin/ToppingManagementScreen';

export type ProductToppingStackParamList = {
  ManageProducts: undefined;
  ToppingManagement: undefined;
};

const Stack = createNativeStackNavigator<ProductToppingStackParamList>();

const ProductToppingStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ManageProducts" component={ManageProducts} />
      <Stack.Screen name="ToppingManagement" component={ToppingManagementScreen} />
    </Stack.Navigator>
  );
};

export default ProductToppingStack;
