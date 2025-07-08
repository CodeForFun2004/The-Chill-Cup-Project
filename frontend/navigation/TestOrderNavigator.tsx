// navigation/TestOrderNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OrderHistoryScreen from '../screens/Customer/OrderHistoryScreen';
import OrderDetailScreen from '../screens/Customer/OrderDetailScreen';
import OrderTrackingScreen from '../screens/Customer/OrderTrackingScreen';

// Types
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: any;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  time: string;
  status: 'Completed' | 'Cancelled' | 'Pending' | 'Processing' | 'Preparing' | 'Ready' | 'Delivering';
  total: number;
  items: OrderItem[];
  estimatedDelivery?: string;
  deliveryAddress?: string;
  phoneNumber?: string;
}

export type TestOrderStackParamList = {
  OrderHistory: undefined;
  OrderDetail: {
    order: Order;
  };
  OrderTracking: {
    order: Order;
  };
};

const Stack = createNativeStackNavigator<TestOrderStackParamList>();

const TestOrderNavigator = () => {
  return (
    <Stack.Navigator 
      // initialRouteName="OrderHistory"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
    </Stack.Navigator>
  );
};

export default TestOrderNavigator;