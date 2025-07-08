import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import ManageStores from '../../screens/Admin/ManageStores';
import ManageDelivery from '../../screens/Admin/ManageDelivery';
import StoreDetail from '../../screens/Admin/StoreDetail';
import type { Store } from '../../screens/Admin/ManageStores'; // chính xác đường dẫn

export type AdminStoreStackParamList = {
  ManageStores: undefined;
  ManageDelivery: undefined;
  StoreDetail: {
    store: Store;
    onUpdate: (updatedStore: Store) => void;
  };
};

const Stack = createStackNavigator<AdminStoreStackParamList>();

const AdminStoreNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ManageStores" component={ManageStores} />
      <Stack.Screen name="ManageDelivery" component={ManageDelivery} />
      <Stack.Screen name="StoreDetail" component={StoreDetail} />
    </Stack.Navigator>
  );
};

export default AdminStoreNavigator;
