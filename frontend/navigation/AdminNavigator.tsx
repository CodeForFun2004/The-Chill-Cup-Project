// navigation/AdminNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminPanel from '../screens/Admin/AdminPanel';
import ManageUsers from '../screens/Admin/ManageUsers';

const Stack = createNativeStackNavigator();

const AdminNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminPanel" component={AdminPanel} />
    <Stack.Screen name="ManageUsers" component={ManageUsers} />
  </Stack.Navigator>
);

export default AdminNavigator;