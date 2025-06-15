// components/homepage/Header.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather, Entypo } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useNavigation } from '@react-navigation/native';

const Header = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const greetingName = userInfo?.name?.trim() || 'bạn mới';
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Chào {greetingName} 👋</Text>
      <View style={styles.icons}>
        <Pressable 
          style={styles.iconWrapper}
          onPress={() => (navigation as any).navigate('CustomerHomeStack', { screen: 'Vouchers' })}
        >
          <Entypo name="ticket" size={18} color="#000" />
        </Pressable>
        <Pressable style={styles.iconWrapper}>
          <Feather name="bell" size={18} color="#000" />
        </Pressable>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
  },
  icons: {
    flexDirection: 'row',
  },
  iconWrapper: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    marginLeft: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
});
