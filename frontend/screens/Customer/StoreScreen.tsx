import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Dữ liệu giả có thêm hình ảnh
const STORES = [
  {
    id: '1',
    name: 'Chi nhánh Nguyễn Huệ',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    openTime: '07:00 - 22:00',
    mapUrl: 'https://maps.google.com/?q=123+Nguyen+Hue,+Quan+1',
    image: require('../../assets/images/store/chinhanh1.jpg'),
  },
  {
    id: '2',
    name: 'Chi nhánh Lê Văn Sỹ',
    address: '45 Lê Văn Sỹ, Quận 3, TP.HCM',
    openTime: '08:00 - 21:00',
    mapUrl: 'https://maps.google.com/?q=45+Le+Van+Sy,+Quan+3',
    image: require('../../assets/images/store/chinhanh2.jpg'),
  },
  {
    id: '3',
    name: 'Chi nhánh Phú Nhuận',
    address: '78 Hoàng Văn Thụ, Phú Nhuận, TP.HCM',
    openTime: '06:30 - 23:00',
    mapUrl: 'https://maps.google.com/?q=78+Hoang+Van+Thu,+Phu+Nhuan',
    image: require('../../assets/images/store/chinhanh3.jpg'),
  },
];

const StoreScreen = () => {
  const renderItem = ({ item }: { item: typeof STORES[0] }) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.address}>{item.address}</Text>
        <Text style={styles.openTime}>🕒 {item.openTime}</Text>

        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => Linking.openURL(item.mapUrl)}
        >
          <Ionicons name="location-outline" size={20} color="#fff" />
          <Text style={styles.mapText}>Xem bản đồ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh sách cửa hàng</Text>
      <FlatList
        data={STORES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default StoreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 30,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 160,
  },
  info: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4AA366',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#555',
  },
  openTime: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4AA366',
    padding: 10,
    marginTop: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  mapText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
});
