import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons, MaterialCommunityIcons, Entypo, FontAwesome } from "@expo/vector-icons"; // Expo default icons


import ProfileScreen from "../screens/Customer/ProfileScreen";
import CustomerHomeScreen from "../screens/Customer/CustomerHomeScreen";
import StoreScreen from "../screens/Customer/StoreScreen";
import PromotionScreen from "../screens/Customer/PromotionScreen";

export type CustomerTabParamList = {
  CustomerHomeScreen: undefined;
  Store: undefined;
  Promotion: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<CustomerTabParamList>();

const CustomerNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: styles.tabBar,
      tabBarIcon: ({ focused, color, size }) => {
        let icon;

        switch (route.name) {
          case "CustomerHomeScreen":
            icon = <Ionicons name="home-outline" size={22} color={focused ? "#4AA366" : "#888"} />;
            break;
          case "Store":
            icon = <MaterialCommunityIcons name="storefront-outline" size={22} color={focused ? '#4AA366' : '#888'} />;
            break;
          case "Promotion":
            icon = <FontAwesome name="credit-card" size={20} color={focused ? "#4AA366" : "#888"} />;
            break;
          case "Profile":
            icon = <MaterialCommunityIcons name="account-outline" size={22} color={focused ? '#4AA366' : '#888'} />;
            break;
        }

        return <View style={styles.iconWrapper}>{icon}</View>;
      },
    })}
  >
    <Tab.Screen name="CustomerHomeScreen" component={CustomerHomeScreen} />
    <Tab.Screen name="Store" component={StoreScreen} />
    <Tab.Screen name="Promotion" component={PromotionScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default CustomerNavigator;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#fff",
    height: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 0,
    position: "absolute",
    bottom: 0,       // ✅ SÁT ĐÁY
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
