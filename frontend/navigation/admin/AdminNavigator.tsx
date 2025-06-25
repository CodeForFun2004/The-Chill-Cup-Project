import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { View, StyleSheet, Text } from "react-native";

// Import các screen của admin
import AdminDashboard from "../../screens/Admin/AdminDashboard";
import ManageProducts from "../../screens/Admin/ManageProducts";
import ManageOrders from "../../screens/Admin/ManageOrders";
import ManageStores from "../../screens/Admin/ManageStores";
import ManagePromotions from "../../screens/Admin/ManagePromotions";
import ManageDelivery from "../../screens/Admin/ManageDelivery";

export type AdminTabParamList = {
  Dashboard: undefined;
  Products: undefined;
  Orders: undefined;
  Stores: undefined;
  Promotions: undefined;
  Delivery: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

const AdminNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true, 
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused }) => {
          let icon;
          const color = focused ? "#4AA366" : "#888";
          const size = 24;

          switch (route.name) {
            case "Dashboard":
              icon = <Ionicons name="stats-chart" size={size} color={color} />;
              break;
            case "Products":
              icon = <Ionicons name="cube" size={size} color={color} />;
              break;
            case "Orders":
              icon = <Ionicons name="receipt" size={size} color={color} />;
              break;
            case "Stores":
              icon = <MaterialCommunityIcons name="store" size={size} color={color} />;
              break;
            case "Promotions":
              icon = <Ionicons name="pricetags" size={size} color={color} />;
              break;
            case "Delivery":
              icon = <MaterialCommunityIcons name="truck-delivery" size={size} color={color} />;
              break;
          }

          return <View style={styles.iconWrapper}>{icon}</View>;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboard} />
      <Tab.Screen name="Products" component={ManageProducts} />
      <Tab.Screen name="Orders" component={ManageOrders} />
      <Tab.Screen name="Stores" component={ManageStores} />
      <Tab.Screen name="Promotions" component={ManagePromotions} />
      <Tab.Screen name="Delivery" component={ManageDelivery} />
    </Tab.Navigator>
  );
};

export default AdminNavigator;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#fff",
    height: 70, // Increased height for labels
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
    paddingTop: 5,
    paddingBottom: 5,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: -5,
    marginBottom: 5,
  },
});
