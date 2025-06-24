import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";

// Import các screen của admin
import AdminDashboardNavigator from "./AdminDashboardNavigator";
import AdminProductNavigator from "./AdminProductNavigator";
import AdminStoreNavigator from "./AdminStoreNavigator";

export type AdminTabParamList = {
  Dashboard: undefined;
  ProductsOrders: undefined;
  StoreDelivery: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

const AdminNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ focused }) => {
          let icon;

          switch (route.name) {
            case "Dashboard":
              icon = (
                <Ionicons
                  name="stats-chart"
                  size={22}
                  color={focused ? "#4AA366" : "#888"}
                />
              );
              break;
            case "ProductsOrders":
              icon = (
                <Ionicons
                  name="cube-outline"
                  size={22}
                  color={focused ? "#4AA366" : "#888"}
                />
              );
              break;
            case "StoreDelivery":
              icon = (
                <MaterialCommunityIcons
                  name="truck-delivery-outline"
                  size={22}
                  color={focused ? "#4AA366" : "#888"}
                />
              );
              break;
          }

          return <View style={styles.iconWrapper}>{icon}</View>;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboardNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            (navigation as any).navigate("Dashboard", {
              screen: "AdminDashboard", // 👈 điều hướng đến màn cụ thể
            });
          },
        })}
      />

      <Tab.Screen
        name="ProductsOrders"
        component={AdminProductNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            (navigation as any).navigate("ProductsOrders", {
              screen: "ManageProducts", // 👈 mặc định load lại từ đầu
            });
          },
        })}
      />

      <Tab.Screen
        name="StoreDelivery"
        component={AdminStoreNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            (navigation as any).navigate("StoreDelivery", {
              screen: "ManageStores", // 👈 ép về màn hình gốc
            });
          },
        })}
      />
    </Tab.Navigator>
  );
};

export default AdminNavigator;

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
