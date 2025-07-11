import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrinkCategoryScreen from '../../screens/Customer/DrinkCategoryScreen';
import DrinkDetailScreen from '../../screens/Customer/DrinkDetailScreen';

export type GuestDrinkStackParamList = {
  DrinkCategoryScreen: undefined;
  DrinkDetailScreen: {
    drink: {
      id: string;
      name: string;
      price: string;
      image: any;
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
