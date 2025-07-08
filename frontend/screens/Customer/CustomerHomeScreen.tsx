<<<<<<< HEAD
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
=======
import React from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import Header from "../../components/hompage/Header";
import LoginBanner from "../../components/hompage/LoginBanner";
import PromoBanner from "../../components/hompage/PromoBanner";
import CategoryCardBlock from "../../components/hompage/search-card/CategoryCardBlock";
import ProductSection from "../../components/hompage/ProductSection";
import AfterLoginBanner from "../../components/hompage/AfterLoginBanner";
import { drinkData } from "../../data/drinks";
>>>>>>> ThienLA

export default function CustomerHomeScreen() {
  const { method, store, deliveryAddress } = useOrder();

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AfterLoginBanner />
<<<<<<< HEAD

        <OrderMethodBlock />
        {method === 'delivery' && <DeliveryAddressBlock />}
        {method === 'pickup' && store && <PickupStoreBlock />}

        <PromoBanner />
        <CategoryCardBlock />

        {drinkData.map((section) => (
          <ProductSection key={section.category} title={section.category} products={section.drinks} />
        ))}

        <View style={{ height: 30 }} />
=======
        <PromoBanner />
        <CategoryCardBlock />

        {drinkData.map((section) => (
          <ProductSection title={section.category} products={section.drinks} />
        ))}

        <View style={{ height: 80 }} />
>>>>>>> ThienLA
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  scrollContent: { paddingBottom: 20 },
});
