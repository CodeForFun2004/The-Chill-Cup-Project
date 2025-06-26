// navigation/GuestNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams } from '@react-navigation/native';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Entypo, FontAwesome } from '@expo/vector-icons';

import StoreScreen from '../screens/Customer/StoreScreen';
import PromotionScreen from '../screens/Customer/PromotionScreen';
import ProfileScreen from '../screens/Customer/ProfileScreen';
import GuestDrinkStackParamList from '../navigation/guest/GuestDrinkStackNavigator';
import DrinkStackNavigator from './CustomerDrinkStackNavigator';
import GuestHomeStack from './GuestHomeStack';

export type GuestTabParamList = {
  GuestHomeStack: undefined;
  DrinkCategory: NavigatorScreenParams<typeof GuestDrinkStackParamList>;
  Store: undefined;
  Promotion: undefined;
  Profile: undefined;
  Cart: undefined;
};

const Tab = createBottomTabNavigator<GuestTabParamList>();

const GuestNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }: { route: { name: keyof GuestTabParamList } }) => ({
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: styles.tabBar,
      tabBarIcon: ({ focused }: { focused: boolean }) => {
        let icon;

        switch (route.name) {
          case 'GuestHomeStack':
            icon = <Ionicons name="home-outline" size={22} color={focused ? '#4AA366' : '#888'} />;
            break;
          case 'DrinkCategory':
            icon = <Ionicons name="cafe-outline" size={22} color={focused ? '#4AA366' : '#888'} />;
            break;
          case 'Store':
            icon = <MaterialCommunityIcons name="storefront-outline" size={22} color={focused ? '#4AA366' : '#888'} />;
            break;
          case 'Promotion':
            icon = <FontAwesome name="credit-card" size={20} color={focused ? '#4AA366' : '#888'} />;
            break;
          case 'Profile':
            icon = <MaterialCommunityIcons name="account-outline" size={22} color={focused ? '#4AA366' : '#888'} />;
            break;

           
        }

        return <View style={styles.iconWrapper}>{icon}</View>;
      },
    })}
  >
    <Tab.Screen name="GuestHomeStack" component={GuestHomeStack} />
    <Tab.Screen name="DrinkCategory" component={DrinkStackNavigator } />
    <Tab.Screen name="Store" component={StoreScreen} />
    <Tab.Screen name="Promotion" component={PromotionScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default GuestNavigator;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    height: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
