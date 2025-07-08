import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react'
import AdminDashboard from '../../screens/Admin/AdminDashboard';
import ManageUsers from '../../screens/Admin/ManageUsers';
import ManagePromotions from '../../screens/Admin/ManagePromotions';

export type AdminDashboardStackParamList = {
  AdminDashboard: undefined;
  ManageUsers: undefined;
  ManagePromotions: undefined;
};

const Stack = createNativeStackNavigator<AdminDashboardStackParamList>();

const AdminDashboardNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboard}/>
      <Stack.Screen name="ManageUsers" component={ManageUsers}/>
      <Stack.Screen name="ManagePromotions" component={ManagePromotions}/>
    </Stack.Navigator>
  )
}

export default AdminDashboardNavigator