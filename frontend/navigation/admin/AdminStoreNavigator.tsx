import { createStackNavigator } from '@react-navigation/stack';
import React from 'react'
import ManageStores from '../../screens/Admin/ManageStores';
import ManageDelivery from '../../screens/Admin/ManageDelivery';

export type AdminStoreStackParamList = {
    ManageStores: undefined;
    ManageDelivery: undefined;
}

const Stack = createStackNavigator<AdminStoreStackParamList>();

const AdminStoreNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ManageStores" component={ManageStores}/>
        <Stack.Screen name="ManageDelivery" component={ManageDelivery}/>
    </Stack.Navigator>
  )
}

export default AdminStoreNavigator