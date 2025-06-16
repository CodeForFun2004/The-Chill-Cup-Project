// components/homepage/AfterLoginBanner.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useNavigation } from '@react-navigation/native';

const AfterLoginBanner = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const name = userInfo?.name?.trim() || 'Thành viên';
  const memberId = userInfo?.id || 'M162445270';
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Pressable style={{ flex: 1 }} onPress={() => (navigation as any).navigate('CustomerHomeStack', { screen: 'LoyaltyScreen' })}>
        <View style={styles.headerRow}>
          <View style={styles.userInfo}>
            <Image
              source={require('../../assets/images/search-box/new.png')} // hoặc URL avatar từ userInfo
              style={styles.avatar}
            />
            <View>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.tag}>Thành viên mới</Text>
            </View>
          </View>
          <View style={styles.rightBox}>
            <Text style={styles.beanText}>Đổi</Text>
            <Text style={styles.beanCount}>0 BEAN</Text>
          </View>
        </View>
        <Text style={styles.memberId}>Mã thành viên: {memberId}</Text>
      </Pressable>
    </View>
  );
};

export default AfterLoginBanner;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4AA366',
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  tag: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.85,
  },
  rightBox: {
    alignItems: 'flex-end',
  },
  beanText: {
    fontSize: 14,
    color: '#fff',
  },
  beanCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  memberId: {
    marginTop: 12,
    fontSize: 13,
    color: '#fff',
    opacity: 0.85,
  },
});
