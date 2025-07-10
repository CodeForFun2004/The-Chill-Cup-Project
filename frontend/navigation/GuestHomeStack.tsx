import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrinkDetailScreen from '../screens/Customer/DrinkDetailScreen';
import GuestHomeScreen from '../screens/Guest/GuestHomeScreen';
import StoreScreen from '../screens/Customer/StoreScreen';

export type GuestHomeStackParamList = {
    GuestHomeScreen: undefined;
    DrinkDetailScreen: {
        drink: {
            id: string;
            name: string;
            price: string;
            image: any;
        };
    };
    StoreScreen: undefined;
};

const Stack = createNativeStackNavigator<GuestHomeStackParamList>();

const GuestHomeStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="GuestHomeScreen" component={GuestHomeScreen} />
            <Stack.Screen name="DrinkDetailScreen" component={DrinkDetailScreen} />
            <Stack.Screen name="StoreScreen" component={StoreScreen} />
        </Stack.Navigator>
    );
};

export default GuestHomeStack; 