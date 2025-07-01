import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import ProductCard from './ProductCard';
import { ImageSourcePropType } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerHomeStackParamList } from '../../navigation/customer/CustomerHomeStack';

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
  const navigation = useNavigation<NativeStackNavigationProp<CustomerHomeStackParamList>>();

  return (
    <View style={{ marginVertical: 12 }}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView contentContainerStyle={styles.productContainer}>
        {products.map((item: Product, index: number) => (
          <ProductCard
            key={index}
            image={item.image}
            name={item.name}
            price={item.price}
            onPress={() =>
              navigation.navigate('DrinkDetailScreen', {
                drink: {
                  name: item.name,
                  image: item.image,
                  price: item.price,
                  id: String(index),
                },
              })
            }
          />
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
