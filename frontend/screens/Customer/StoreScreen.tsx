import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Linking,
  StatusBar,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { STORES } from '../../data/stores';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Store {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  image: any;
  distance?: number;
}

const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const toRad = (value: number): number => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function StoreScreen() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Không có quyền truy cập vị trí');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  const sortedStores = useMemo(() => {
    if (!location)
      return STORES.map((s) => ({
        ...s,
        distance: parseFloat(s.distance || '0'),
      }));
    const mapped = STORES.map((s) => ({
      ...s,
      distance: getDistance(
        location.latitude,
        location.longitude,
        s.latitude,
        s.longitude
      ),
    }));
    mapped.sort((a, b) => a.distance - b.distance);
    return mapped.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.address.toLowerCase().includes(search.toLowerCase())
    );
  }, [location, search]);

  const nearestStore = sortedStores[0];
  const otherStores = sortedStores.slice(1);

  const handleSelect = (store: Store): void => {
    setSelectedStore(store);
    Alert.alert('Đã chọn', `Địa chỉ giao hàng: ${store.name}`);
  };

  const StoreCard = ({ store }: { store: Store }) => (
    <View style={styles.card}>
      <Image source={store.image} style={styles.thumbnail} />
      <View style={styles.details}>
        <Text style={styles.storeName}>{store.name}</Text>
        <Text style={styles.storeAddress}>{store.address}</Text>
        <Text style={styles.storeDistance}>
          📍 {store.distance?.toFixed(2)} km
        </Text>
        <View style={styles.rowActions}>
          <TouchableOpacity
            style={styles.iconAction}
            onPress={() =>
              Linking.openURL(
                `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`
              )
            }
          >
            <Ionicons name='navigate' size={20} color='#6366f1' />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconAction}
            onPress={() => Linking.openURL(`tel:${store.phone}`)}
          >
            <Ionicons name='call' size={20} color='#10b981' />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => handleSelect(store)}
          >
            <Text style={styles.ctaText}>Chọn</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='dark-content' />
      <FlatList
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.greeting}>Xin chào! 👋</Text>
            <TextInput
              placeholder='Tìm cửa hàng...'
              style={styles.searchBox}
              value={search}
              onChangeText={setSearch}
            />

            {nearestStore && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏠 Gần bạn nhất</Text>
                <StoreCard store={nearestStore} />
              </View>
            )}
            <Text style={styles.sectionTitle}>📍 Các cửa hàng khác</Text>
          </View>
        }
        data={otherStores}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <StoreCard store={item} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 50 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20 },
  greeting: { fontSize: 20, fontWeight: '700', marginBottom: 10 },
  searchBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginVertical: 10 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  thumbnail: { width: 60, height: 60, borderRadius: 10, marginRight: 12 },
  details: { flex: 1 },
  storeName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  storeAddress: { fontSize: 13, color: '#64748b' },
  storeDistance: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  iconAction: {
    backgroundColor: '#eef2ff',
    padding: 8,
    borderRadius: 8,
  },
  ctaBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  ctaText: { color: '#fff', fontWeight: '700' },
});
