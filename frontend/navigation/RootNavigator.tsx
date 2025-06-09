// navigation/RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import GuestNavigator from './GuestNavigator';
import CustomerNavigator from './CustomerNavigator';
import StaffNavigator from './StaffNavigator';
import AdminNavigator from './AdminNavigator';
import ShipperNavigator from './ShipperNavigator';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const role = useSelector((state: RootState) => state.auth.role);

  let MainComponent = AuthNavigator;
  if (role === 'guest') MainComponent = GuestNavigator;
  else if (role === 'customer') MainComponent = CustomerNavigator;
  else if (role === 'staff') MainComponent = StaffNavigator;
  else if (role === 'shipper') MainComponent = ShipperNavigator;
  else if (role === 'admin') MainComponent = AdminNavigator;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainComponent} />
      <Stack.Screen name="Auth" component={AuthNavigator} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
