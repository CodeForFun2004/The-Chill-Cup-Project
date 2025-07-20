import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react'
import { Text } from 'react-native'
import ManageProducts from '../../screens/Admin/ManageProducts';
export type AdminProductStackParamList = {
  ManageProducts: undefined;
  ManageOrders: undefined;
}

const Stack = createNativeStackNavigator<AdminProductStackParamList>();

const AdminProductNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ManageProducts" component={ManageProducts}/>
    </Stack.Navigator>
  )
}

export default AdminProductNavigator