import React, { useState } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { DrinkStackParamList } from '../../navigation/DrinkStackNavigator';
import { Ionicons } from '@expo/vector-icons';

type DrinkDetailRouteProp = RouteProp<DrinkStackParamList, 'DrinkDetailScreen'>;

const availableToppings = [
  { id: '1', name: 'Trân châu đen', price: 5000 },
  { id: '2', name: 'Thạch trái cây', price: 7000 },
  { id: '3', name: 'Pudding trứng', price: 6000 },
  { id: '4', name: 'Kem cheese', price: 7000 },
  { id: '5', name: 'Thạch matcha', price: 6000 },
  { id: '6', name: 'Trân châu trắng', price: 6000 },
];

const DrinkDetailScreen = () => {
  const route = useRoute<DrinkDetailRouteProp>();
  const navigation = useNavigation();
  const { drink } = route.params;

  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L'>('M');
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

  const toggleTopping = (id: string) => {
    setSelectedToppings(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Image source={drink.image} style={styles.image} resizeMode="cover" />
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.name}>{drink.name}</Text>
          <Text style={styles.price}>{drink.price}</Text>

          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description}>
            Một lựa chọn tuyệt vời cho ngày mới. {drink.name} được pha chế từ những nguyên liệu chất lượng.
          </Text>

          <Text style={styles.sectionTitle}>Chọn size</Text>
          <View style={styles.optionsContainer}>
            {(['S', 'M', 'L'] as const).map(size => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.optionButton,
                  selectedSize === size && styles.selectedOption,
                ]}
                onPress={() => setSelectedSize(size)}
              >
                <Text style={{ fontWeight: selectedSize === size ? 'bold' : 'normal' }}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Chọn topping</Text>
          <View style={styles.optionsContainer}>
            {availableToppings.map(topping => (
              <TouchableOpacity
                key={topping.id}
                style={[
                  styles.optionButton,
                  selectedToppings.includes(topping.id) && styles.selectedOption,
                ]}
                onPress={() => toggleTopping(topping.id)}
              >
                <Text style={{ fontWeight: selectedToppings.includes(topping.id) ? 'bold' : 'normal' }}>
                  {topping.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.addToCartButton}>
          <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = width * 0.9;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: {
    width: width,
    height: IMAGE_HEIGHT,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    backgroundColor: '#00000088',
    borderRadius: 20,
    padding: 8,
  },
  infoContainer: { padding: 20 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  price: { fontSize: 20, color: '#D17842', marginVertical: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 8, color: '#555' },
  description: { fontSize: 15, color: '#666', lineHeight: 22 },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#D17842',
    borderColor: '#D17842',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    marginBottom: 60,
  },
  addToCartButton: {
    backgroundColor: '#D17842',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DrinkDetailScreen;
