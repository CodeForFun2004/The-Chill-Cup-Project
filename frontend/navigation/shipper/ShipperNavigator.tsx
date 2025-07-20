import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ShipperDashboard from '../../screens/Shipper/ShipperDashboard';
import DeliveryDetail from '../../screens/Shipper/ShipperDeliveryDetail';

export type ShipperStackParamList = {
  ShipperDashboard: undefined;
  DeliveryDetail: {
    deliveryId: string;
  };
};

const Stack = createNativeStackNavigator<ShipperStackParamList>();

const ShipperNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ShipperDashboard" component={ShipperDashboard} />
    <Stack.Screen name="DeliveryDetail" component={DeliveryDetail} />
  </Stack.Navigator>
);

export default ShipperNavigator;