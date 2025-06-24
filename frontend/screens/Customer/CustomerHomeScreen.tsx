import React from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import Header from "../../components/hompage/Header";
import LoginBanner from "../../components/hompage/LoginBanner";
import PromoBanner from "../../components/hompage/PromoBanner";
import CategoryCardBlock from "../../components/hompage/search-card/CategoryCardBlock";
import ProductSection from "../../components/hompage/ProductSection";
import AfterLoginBanner from "../../components/hompage/AfterLoginBanner";
import { drinkData } from "../../data/drinks";

const CustomerHomeScreen = () => {
  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AfterLoginBanner />
        <PromoBanner />
        <CategoryCardBlock />

        {drinkData.map((section) => (
          <ProductSection
            title={section.category}
            products={section.drinks}
          />
        ))}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

export default CustomerHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  scrollContent: {
    paddingBottom: 16,
  },
});
