import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrinkDetailScreen from '../screens/Customer/DrinkDetailScreen';
import GuestHomeScreen from '../screens/Guest/GuestHomeScreen';

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
};

const Stack = createNativeStackNavigator<GuestHomeStackParamList>();

const GuestHomeStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="GuestHomeScreen" component={GuestHomeScreen} />
            <Stack.Screen name="DrinkDetailScreen" component={DrinkDetailScreen} />
        </Stack.Navigator>
    );
};

export default GuestHomeStack; 