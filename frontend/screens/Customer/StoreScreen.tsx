import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  TextInput,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { STORES } from '../../data/stores';

const StoreScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStores, setFilteredStores] = useState(STORES);
  const [cardScales, setCardScales] = useState<{ [key: string]: Animated.Value }>(
    STORES.reduce((acc, store) => ({ ...acc, [store.id]: new Animated.Value(1) }), {})
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = STORES.filter(
      store =>
        store.name.toLowerCase().includes(query.toLowerCase()) ||
        store.address.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredStores(filtered);
  };

  const animateCard = (id: string, toValue: number) => {
    Animated.timing(cardScales[id], {
      toValue,
      duration: 100,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  const renderItem = ({ item }: { item: typeof STORES[0] }) => (
    <Animated.View
      style={[styles.card, { transform: [{ scale: cardScales[item.id] }] }]}
    >
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradientOverlay}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.address}>{item.address}</Text>
        <Text style={styles.openTime}>🕒 {item.openTime}</Text>
        <Text style={styles.distance}>📍 Cách bạn {item.distance}</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => Linking.openURL(`https://www.google.com/maps?q=${item.latitude},${item.longitude}`)}
            onPressIn={() => animateCard(item.id, 0.95)}
            onPressOut={() => animateCard(item.id, 1)}
            accessible
            accessibilityLabel={`Xem bản đồ ${item.name}`}
          >
            <Ionicons name="location-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Xem bản đồ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => Linking.openURL(item.phone)}
            onPressIn={() => animateCard(item.id, 0.95)}
            onPressOut={() => animateCard(item.id, 1)}
            accessible
            accessibilityLabel={`Gọi điện đến ${item.name}`}
          >
            <Ionicons name="call-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Gọi điện</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh sách cửa hàng</Text>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm cửa hàng..."
          value={searchQuery}
          onChangeText={handleSearch}
          accessible
          accessibilityLabel="Tìm kiếm cửa hàng"
        />
      </View>
      <FlatList
        data={filteredStores}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Không tìm thấy cửa hàng nào.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#2D2D2D',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 35,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  info: {
    padding: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4AA366',
    marginBottom: 6,
  },
  address: {
    fontSize: 15,
    color: '#555',
    marginBottom: 4,
  },
  openTime: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  distance: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4AA366',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default StoreScreen;