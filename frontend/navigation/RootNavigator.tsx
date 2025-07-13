import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/Auth/WelcomeScreen';
import AuthNavigator from './AuthNavigator';
import GuestHomeScreen from '../screens/Guest/GuestHomeScreen';
import StoreDetail from '../screens/Admin/StoreDetail';
import MainSelector from './MainSelector';  // ✅ import mới
import { Text } from 'react-native';

export type RootStackParamList = {
  Splash: undefined;
  Main: undefined;
  WelcomeScreen: undefined;
  Auth: undefined;
  GuestHomeScreen: undefined;
  StoreDetail: {
    store: {
      id: string;
      name: string;
      address: string;
      contact: string;
      openHours: string;
      isActive: boolean;
      mapUrl: string;
      image: any;
      staff?: string;
    };
    onUpdate: (store: any) => void;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      {/* ✅ dùng MainSelector */}
      {/* <Stack.Screen name="Main" component={MainSelector} /> 
      <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="GuestHomeScreen" component={GuestHomeScreen} /> */}
      {/* <Stack.Screen name="StoreDetail" component={StoreDetail} /> */}
      {/* <Stack.Screen name="Main" component={() => <Text>Main Dummy</Text>} /> */}
      <Stack.Screen name="Main" component={MainSelector} /> 
    </Stack.Navigator>
  );
};

export default RootNavigator;
