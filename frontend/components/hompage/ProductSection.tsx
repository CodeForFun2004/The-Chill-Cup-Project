import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import ProductCard from './ProductCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerHomeStackParamList } from '../../navigation/customer/CustomerHomeStack';

type Product = {
  id: string;
  name: string;
  image: string; // Sửa kiểu về string (uri)
  price: string;
  description?: string;
  basePrice?: number;
  sizeOptions?: any;
  toppingOptions?: any;
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
            key={item.id || index}
            product={item}
            onPress={() =>
              navigation.navigate('DrinkDetailScreen', {
                drink: item,
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