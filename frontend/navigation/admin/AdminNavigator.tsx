import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";

// Import các màn hình hoặc Stack
import AdminDashboard from "../../screens/Admin/AdminDashboard";
import ProductToppingStack from "../../navigation/admin/ProductToppingStack";
import OrderDelivery from "../../screens/Admin/ManageDelivery";
import ManageStores from "../../screens/Admin/ManageStores";
import ManagePromotions from "../../screens/Admin/ManagePromotions";
import ManageUsers from "../../screens/Admin/ManageUsers";

export type AdminTabParamList = {
  AdminDashboard: undefined;
  ProductTopping: undefined;
  OrderDelivery: undefined;
  Stores: undefined;
  Promotions: undefined;
  Users: undefined;
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
          const color = focused ? "#4AA366" : "#888";
          const size = 24;
          let icon;

          switch (route.name) {
            case "AdminDashboard":
              icon = <Ionicons name="stats-chart" size={size} color={color} />;
              break;
            case "ProductTopping":
              icon = <MaterialCommunityIcons name="food-variant" size={size} color={color} />;
              break;
            case "OrderDelivery":
              icon = <MaterialCommunityIcons name="truck-delivery" size={size} color={color} />;
              break;
            case "Stores":
              icon = <MaterialCommunityIcons name="store" size={size} color={color} />;
              break;
            case "Promotions":
              icon = <Ionicons name="pricetags" size={size} color={color} />;
              break;
            case "Users":
              icon = <Ionicons name="people" size={size} color={color} />;
              break;
            default:
              icon = <Ionicons name="alert-circle-outline" size={size} color="#ccc" />;
          }

          return <View style={styles.iconWrapper}>{icon}</View>;
        },
      })}
    >
      <Tab.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: "AdminDashboard" }} />
      <Tab.Screen name="ProductTopping" component={ProductToppingStack} options={{ title: "Menu" }} />
      <Tab.Screen name="OrderDelivery" component={OrderDelivery} options={{ title: "Đơn & Giao hàng" }} />
      <Tab.Screen name="Stores" component={ManageStores} options={{ title: "Cửa hàng" }} />
      <Tab.Screen name="Promotions" component={ManagePromotions} options={{ title: "Khuyến mãi" }} />
      <Tab.Screen name="Users" component={ManageUsers} options={{ title: "Người dùng" }} />
    </Tab.Navigator>
  );
};

export default AdminNavigator;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#fff",
    height: 70,
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
