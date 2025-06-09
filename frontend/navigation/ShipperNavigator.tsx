// navigation/ShipperNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ShipperDashboard from '../screens/Shipper/Dashboard';
import DeliveryDetail from '../screens/Shipper/DeliveryDetail';

const Stack = createNativeStackNavigator();

const ShipperNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Dashboard" component={ShipperDashboard} />
    <Stack.Screen name="DeliveryDetail" component={DeliveryDetail} />
  </Stack.Navigator>
);

export default ShipperNavigator;