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
import { logoutUser } from '../../redux/slices/authSlice'; // <-- Import thunk này
import { RootState } from '../../redux/rootReducer';
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
import { CustomerTabParamList } from '../../navigation/customer/CustomerNavigator';

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
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const userInfo = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Huỷ' },
      {
        text: 'Đăng xuất',
        onPress: async () => { // <--- Thêm async vào đây
          await dispatch(logoutUser() as any); // <-- Dispatch thunk logoutUser
          // Sau khi logout thành công (cả Redux và AsyncStorage đã được clear)
          // Điều hướng người dùng về màn hình khách hoặc màn hình bắt đầu
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Main' }], // <-- Đảm bảo đây là Guest Navigator hoặc màn hình khởi đầu cho khách
            })
          );
        },
        style: 'destructive',
      },
    ]);
  };

  const menuItems: MenuItemType[] = [
    {
      icon: <MaterialIcons name="history" size={24} color="#666" />,
      title: 'Lịch sử đơn hàng',
      onPress: () => navigation.navigate('OrderStack' as never),
    },
    {
      icon: <MaterialIcons name="favorite-border" size={24} color="#666" />,
      title: 'Nhà hàng yêu thích',
      onPress: () => navigation.navigate('Favorites'),
    },
    {
      icon: <MaterialIcons name="local-offer" size={24} color="#666" />,
      title: 'Ưu đãi & khuyến mãi',
      onPress: () => {},
    },
    {
      icon: <MaterialIcons name="payment" size={24} color="#666" />,
      title: 'Phương thức thanh toán',
      onPress: () => {},
    },
    {
      icon: <MaterialIcons name="person-outline" size={24} color="#666" />,
      title: 'Thông tin cá nhân',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      icon: <MaterialIcons name="location-on" size={24} color="#666" />,
      title: 'Địa chỉ',
      onPress: () => {},
    },
    {
      icon: <MaterialIcons name="notifications-none" size={24} color="#666" />,
      title: 'Thông báo',
      onPress: () => {},
    },
    {
      icon: <MaterialIcons name="security" size={24} color="#666" />,
      title: 'Bảo mật',
      onPress: () => navigation.navigate('ChangePassword'),
    },
    {
      icon: <MaterialIcons name="language" size={24} color="#666" />,
      title: 'Ngôn ngữ',
      rightText: 'Tiếng Việt',
      onPress: () => {},
    },
    {
      icon: <MaterialIcons name="help-outline" size={24} color="#666" />,
      title: 'Trung tâm trợ giúp',
      onPress: () => {},
    },
    {
      icon: <MaterialIcons name="group-add" size={24} color="#666" />,
      title: 'Mời bạn bè',
      onPress: () => {},
    },
  ];

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
        <Text style={styles.title}>Vui lòng đăng nhập để xem hồ sơ của bạn</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.getParent()?.navigate('WelcomeScreen')}
        >
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
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
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
            <MaterialIcons name="edit" size={24} color="#4AA366" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <MenuItem key={index} {...item} />
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={24} color="#FF3B30" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 8,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  phone: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  menuContainer: {
    backgroundColor: '#fff',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemRightText: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 8,
  },
  loginButton: {
    backgroundColor: '#4AA366',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  placeholderAvatar: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen;
