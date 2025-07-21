// navigation/StaffNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StaffDashboard from '../../screens/Staff/StaffDashboard';
import OrderManagement from '../../screens/Staff/StaffOrders';

export type StaffStackParamList = {
  StaffDashboard: undefined;
  OrderManagement: undefined;
  Auth: undefined;
};

const Stack = createNativeStackNavigator<StaffStackParamList>();

const StaffNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StaffDashboard" component={StaffDashboard} />
    <Stack.Screen name="OrderManagement" component={OrderManagement} />
  </Stack.Navigator>
);

export default StaffNavigator;