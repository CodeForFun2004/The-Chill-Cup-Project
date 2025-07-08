// navigation/StaffNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StaffDashboard from '../../screens/Staff/StaffDashboard';
import OrderManagement from '../../screens/Staff/StaffOrders';

const Stack = createNativeStackNavigator();

const StaffNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Dashboard" component={StaffDashboard} />
    <Stack.Screen name="Orders" component={OrderManagement} />
  </Stack.Navigator>
);

export default StaffNavigator;