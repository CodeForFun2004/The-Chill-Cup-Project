import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import Header from '../../components/hompage/Header';
import AfterLoginBanner from '../../components/hompage/AfterLoginBanner';
import PromoBanner from '../../components/hompage/PromoBanner';
import CategoryCardBlock from '../../components/hompage/search-card/CategoryCardBlock';
import ProductSection from '../../components/hompage/ProductSection';
import OrderMethodBlock from '../../components/delivery-pickup/OrderMethodBlock';
import DeliveryAddressBlock from '../../components/delivery-pickup/DeliveryAddressBlock';
import PickupStoreBlock from '../../components/delivery-pickup/PickupStoreBlock';
import { useOrder } from '../../contexts/OrderContext';
import { drinkData } from '../../data/drinks';

export default function CustomerHomeScreen() {
  const { method, store, deliveryAddress } = useOrder();

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AfterLoginBanner />

        <OrderMethodBlock />
        {method === 'delivery' && <DeliveryAddressBlock />}
        {method === 'pickup' && <PickupStoreBlock />}

        <PromoBanner />
        <CategoryCardBlock />

        {drinkData.map((section) => (
          <ProductSection key={section.category} title={section.category} products={section.drinks} />
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  scrollContent: { paddingBottom: 20 },
});
