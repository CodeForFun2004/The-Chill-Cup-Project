import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type PickupRouteProp = RouteProp<{ params: { store: any } }, 'params'>;

const ChoosePickupLocationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<PickupRouteProp>();
  const { store } = route.params;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        accessible
        accessibilityLabel="Quay lại"
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Image source={store.image} style={styles.image} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.gradientOverlay}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.header}>Xác nhận cửa hàng nhận hàng</Text>
        <Text style={styles.name}>{store.name}</Text>
        <Text style={styles.address}>
          <Ionicons name="location-outline" size={18} color="#4AA366" /> {store.address}
        </Text>
        <Text style={styles.openTime}>
          <Ionicons name="time-outline" size={18} color="#4AA366" /> {store.openTime}
        </Text>
        <Text style={styles.distance}>
          <Ionicons name="walk-outline" size={18} color="#4AA366" /> Cách bạn {store.distance}
        </Text>
        <TouchableOpacity
          style={styles.confirmButton}
          accessible
          accessibilityLabel={`Xác nhận nhận tại ${store.name}`}
        >
          <Text style={styles.confirmButtonText}>Xác nhận nhận tại {store.name}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 10,
    zIndex: 1,
  },
  image: {
    width: '100%',
    height: 250,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  infoContainer: { padding: 24 },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4AA366',
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  openTime: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  distance: {
    fontSize: 16,
    color: '#555',
    marginBottom: 24,
  },
  confirmButton: {
    backgroundColor: '#4AA366',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ChoosePickupLocationScreen;