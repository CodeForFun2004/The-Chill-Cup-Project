import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrinkCategoryScreen from '../screens/Customer/DrinkCategoryScreen';
import DrinkDetailScreen from '../screens/Customer/DrinkDetailScreen';

export interface ToppingOption {
  _id: string;
  name: string;
  price: number;
  icon?: string;
}

export interface SizeOption {
  size: 'S' | 'M' | 'L';
  name: string;
  volume: string;
  multiplier: number;
}

type Drink = {
  _id: string;
  name: string;
  image: string;
  basePrice: number;
  sizes: SizeOption[];
  toppingOptions: ToppingOption[];
};

export interface OrderDetail {
  drink: Drink;
  size: 'S' | 'M' | 'L';
  toppings: string[];
  quantity: number;
  totalPrice: number;
}

export type DrinkStackParamList = {
  DrinkCategoryScreen: undefined;
  DrinkDetailScreen: {
    drink: Drink;
  };
};

const Stack = createNativeStackNavigator<DrinkStackParamList>();

const CustomerDrinkStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DrinkCategoryScreen" component={DrinkCategoryScreen} />
      <Stack.Screen name="DrinkDetailScreen" component={DrinkDetailScreen} />
    </Stack.Navigator>
  );
};

export default CustomerDrinkStackNavigator;
