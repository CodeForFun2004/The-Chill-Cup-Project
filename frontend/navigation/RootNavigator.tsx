import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/Auth/WelcomeScreen';
import AuthNavigator from './AuthNavigator';
import GuestNavigator from './GuestNavigator';
import CustomerNavigator from './customer/CustomerNavigator';
import GuestHomeScreen from '../screens/Guest/GuestHomeScreen';

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { AuthStackParamList } from './AuthNavigator';
import AdminNavigator from './admin/AdminNavigator';
import StaffNavigator from './staff/StaffNavigator';
import ShipperNavigator from './shipper/ShipperNavigator';

export type RootStackParamList = {
  Splash: undefined;
  Main: undefined;
  WelcomeScreen: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  GuestHomeScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const role = useSelector((state: RootState) => state.auth.role);

  let MainComponent = GuestNavigator;
  if (role === 'customer') MainComponent = CustomerNavigator;
  if (role === 'admin') MainComponent = AdminNavigator;
  if (role === 'staff') MainComponent = StaffNavigator;
  if (role === 'shipper') MainComponent = ShipperNavigator;
  // Có thể mở rộng role: staff, shipper, admin tại đây...

  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Main" component={MainComponent} />
      <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="GuestHomeScreen" component={GuestHomeScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
