import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrinkCategoryScreen from '../../screens/Customer/DrinkCategoryScreen';
import DrinkDetailScreen from '../../screens/Customer/DrinkDetailScreen';
import { SizeOption } from '../CustomerDrinkStackNavigator';

export type GuestDrinkStackParamList = {
  DrinkCategoryScreen: undefined;
  DrinkDetailScreen: {
    drink: {
      id: string;
      name: string;
      basePrice: Number;
      image: string;
      sizes: SizeOption[];
      toppingOptions: {
        _id: string;
        name: string;
        price: number;
        icon?: string;
      }[];
    };
  };
};

const Stack = createNativeStackNavigator<GuestDrinkStackParamList>();

const GuestDrinkStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DrinkCategoryScreen" component={DrinkCategoryScreen} />
      <Stack.Screen name="DrinkDetailScreen" component={DrinkDetailScreen} />
    </Stack.Navigator>
  );
};

export default GuestDrinkStackNavigator;
