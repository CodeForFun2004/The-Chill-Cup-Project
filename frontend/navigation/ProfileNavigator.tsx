import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/Customer/ProfileScreen';
import EditProfileScreen from '../screens/Customer/EditProfileScreen';
import ChangePasswordScreen from '../screens/Customer/ChangePasswordScreen';
import OrderHistoryScreen from '../screens/Customer/OrderHistoryScreen';
import FavoritesScreen from '../screens/Customer/FavoritesScreen';

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  OrderHistory: undefined;
  Favorites: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#4AA366',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen}
        options={{ title: 'Change Password' }}
      />
      <Stack.Screen 
        name="OrderHistory" 
        component={OrderHistoryScreen}
        options={{ title: 'Order History' }}
      />
      <Stack.Screen 
        name="Favorites" 
        component={FavoritesScreen}
        options={{ title: 'Favorites' }}
      />
    </Stack.Navigator>
  );
};

export default ProfileNavigator; 