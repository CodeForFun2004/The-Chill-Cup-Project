import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/Customer/ProfileScreen';
import EditProfileScreen from '../screens/Customer/EditProfileScreen';
import ChangePasswordScreen from '../screens/Customer/ChangePasswordScreen';
import FavoritesScreen from '../screens/Customer/FavoritesScreen';
import TestOrderNavigator from './TestOrderNavigator'; // ✅ thêm navigator mới

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Favorites: undefined;
  OrderStack: undefined; // ✅ dùng stack chứa toàn bộ order
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
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: 'Favorites' }}
      />
      <Stack.Screen
        name="OrderStack"
        component={TestOrderNavigator}
        options={{ headerShown: false }} // dùng header riêng trong Order stack
      />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;
