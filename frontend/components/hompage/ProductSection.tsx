import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import ProductCard from './ProductCard';
import { ImageSourcePropType } from 'react-native';

type Product = {
  name: string;
  image: ImageSourcePropType;
  price: string;
};

type ProductSectionProps = {
  title: string;
  products: Product[];
};

const ProductSection = ({ title, products }: ProductSectionProps) => {
  return (
    <View style={{ marginVertical: 12 }}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView contentContainerStyle={styles.productContainer}>
        {products.map((item: Product, index: number) => (
          <ProductCard key={index} image={item.image} name={item.name} price={item.price} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default ProductSection;
