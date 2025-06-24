import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";


import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";



import { View, Text, StyleSheet, Platform } from "react-native";
import { NavigatorScreenParams } from "@react-navigation/native";
import CustomerHomeStack from "./CustomerHomeStack";
import DrinkCategoryScreen from '../../screens/Customer/DrinkCategoryScreen';
import StoreScreen from "../../screens/Customer/StoreScreen";
import PromotionScreen from "../../screens/Customer/PromotionScreen";
import CartScreen from "../../screens/Customer/CartScreen";
import CheckoutScreen from "../../screens/Customer/CheckoutScreen";
import CustomerStackNavigator from "./CustomerStackNavigator";
import ProfileNavigator from "../ProfileNavigator";
import { ProfileStackParamList } from "../ProfileNavigator";
import TestOrderNavigator from "../TestOrderNavigator";
import DrinkStackNavigator from '../DrinkStackNavigator';

export type CustomerTabParamList = {
  CustomerHomeStack: undefined;
  Drink: undefined;
  Store: undefined;
  Promotion: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
  SearchScreen: undefined;
  CartStack: undefined;
  // OrderStack: undefined;
};

const Tab = createBottomTabNavigator<CustomerTabParamList>(); 

const CustomerNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ focused }) => {
          let icon;


        switch (route.name) {
          case "CustomerHomeStack":
            icon = <Ionicons name="home-outline" size={22} color={focused ? "#4AA366" : "#888"} />;
            break;
          case 'Drink':
            icon = <Ionicons name="cafe-outline" size={22} color={focused ? '#4AA366' : '#888'} />;
            break;
          case "Store":
            icon = <MaterialCommunityIcons name="storefront-outline" size={22} color={focused ? "#4AA366" : "#888"} />;
            break;
          case "Promotion":
            icon = <FontAwesome name="credit-card" size={20} color={focused ? "#4AA366" : "#888"} />;
            break;
          case "Profile":
            icon = <MaterialCommunityIcons name="account-outline" size={22} color={focused ? '#4AA366' : '#888'} />;
            break;
          case "CartStack":
            icon = <MaterialCommunityIcons name="cart" size={22} color={focused ? '#4AA366' : '#888'} />;
            break;
            // case "OrderStack":
            // icon = <MaterialCommunityIcons name="cart" size={22} color={focused ? '#4AA366' : '#888'} />;
            // break;
        }

        return <View style={styles.iconWrapper}>{icon}</View>;
      },
    })}
  >

    <Tab.Screen name="CustomerHomeStack" component={CustomerHomeStack} /> 
    <Tab.Screen name="Drink" component={DrinkStackNavigator} />
    <Tab.Screen name="Store" component={StoreScreen} />
    <Tab.Screen name="Promotion" component={PromotionScreen} />
    <Tab.Screen 
      name="Profile" 
      component={ProfileNavigator}
      options={{
        headerShown: false
      }}
    />
    <Tab.Screen
      name="CartStack"
      component={CustomerStackNavigator}
      listeners={({ navigation, route }) => ({
        tabPress: e => {
          e.preventDefault();
          (navigation as any).navigate('CartStack', { screen: 'Cart' });
        },
      })}
    />
    {/* <Tab.Screen name="OrderStack" component={TestOrderNavigator} /> */}
  </Tab.Navigator>
)};


export default CustomerNavigator;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#fff",
    height: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 0,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
});
