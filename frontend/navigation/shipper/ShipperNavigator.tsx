import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ShipperDashboard from '../../screens/Shipper/ShipperDashboard';
import DeliveryDetail from '../../screens/Shipper/ShipperDeliveryDetail';
import DeliveryHistory from '../../screens/Shipper/DeliveryHistory';

export type ShipperStackParamList = {
  ShipperDashboard: undefined;
  DeliveryDetail: {
    deliveryId: string;
  };
  DeliveryHistory: undefined
};

const Stack = createNativeStackNavigator<ShipperStackParamList>();

const ShipperNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ShipperDashboard" component={ShipperDashboard} />
    <Stack.Screen name="DeliveryDetail" component={DeliveryDetail} />
    <Stack.Screen name="DeliveryHistory" component={DeliveryHistory} />
  </Stack.Navigator>
);

export default ShipperNavigator;