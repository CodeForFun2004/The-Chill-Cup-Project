// screens/Customer/ProfileScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { RootState } from '../../redux/store';
import {
  useNavigation,
  CommonActions,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/ProfileNavigator';
import {
  MaterialIcons,
  MaterialCommunityIcons,
  Ionicons,
  Feather,
} from '@expo/vector-icons';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CustomerTabParamList } from '../../navigation/CustomerNavigator';

// Combine stack and tab navigation props
type ProfileScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList>,
  BottomTabNavigationProp<CustomerTabParamList>
>;

type MenuItemType = {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
  rightText?: string;
};

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel' },
      {
        text: 'Logout',
        onPress: () => {
          dispatch(logout());
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'CustomerHomeStack' }],
            })
          );
        },
        style: 'destructive',
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Huỷ' },
      {
        text: 'Đăng xuất',
        onPress: () => {
          dispatch(logout());
          resetToMain(); // 👉 Về lại Home
        },
        style: 'destructive',
      },
    ]);
  };

  const MenuItem = ({ icon, title, onPress, rightText }: MenuItemType) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        {icon}
        <Text style={styles.menuItemText}>{title}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {rightText && <Text style={styles.menuItemRightText}>{rightText}</Text>}
        <MaterialIcons name="chevron-right" size={24} color="#666" />
      </View>
    </TouchableOpacity>
  );

  if (!userInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Please login to view your profile</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.getParent()?.navigate('WelcomeScreen')}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          {userInfo.avatar ? (
            <Image source={{ uri: userInfo.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.placeholderAvatar]}>
              <MaterialIcons name="person" size={30} color="#ccc" />
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.name}>{userInfo.name}</Text>
            <Text style={styles.phone}>{userInfo.phone}</Text>
          </View>
        </>
      )}
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    marginTop: 12,
  },
});
