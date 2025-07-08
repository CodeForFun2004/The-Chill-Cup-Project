import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react'
import AdminDashboard from '../../screens/Admin/AdminDashboard';
import ManageUsers from '../../screens/Admin/ManageUsers';
import ManagePromotions from '../../screens/Admin/ManagePromotions';
import ManageProducts from '../../screens/Admin/ManageProducts';  

export type AdminDashboardStackParamList = {
  AdminDashboard: undefined;
  ManageUsers: undefined;
  ManagePromotions: undefined;
  ManageProducts: undefined; // Thêm
};

const Stack = createNativeStackNavigator<AdminDashboardStackParamList>();

const AdminDashboardNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboard}/>
      <Stack.Screen name="ManageUsers" component={ManageUsers}/>
      <Stack.Screen name="ManagePromotions" component={ManagePromotions}/>
      <Stack.Screen name="ManageProducts" component={ManageProducts}/> {/* Thêm */}
    </Stack.Navigator>
  )
}

export default AdminDashboardNavigator