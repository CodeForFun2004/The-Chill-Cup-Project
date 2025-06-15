import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Dimensions
} from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';

interface Drink {
  id: string;
  name: string;
  image: any;
  price: string;
}

interface Props {
  navigation: NavigationProp<any>;
  route: RouteProp<{ params: { drink: Drink } }, 'params'>;
}

const DrinkDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { drink } = route.params;
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L'>('M');
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  const sizes = [
    { label: 'S', priceMultiplier: 0.8 },
    { label: 'M', priceMultiplier: 1.0 },
    { label: 'L', priceMultiplier: 1.2 },
  ];

  const toppings = [
    { name: 'Trân châu', price: 0.5 },
    { name: 'Pudding', price: 0.7 },
    { name: 'Thạch trái cây', price: 0.6 },
    { name: 'Kem cheese', price: 0.8 },
  ];

  // Convert price from '59,000đ' to number (assuming 1000đ = $1 for simplicity)
  const basePrice = parseFloat(drink.price.replace(/[^0-9]/g, '')) / 1000;
  const sizePrice = basePrice * (sizes.find(s => s.label === selectedSize)?.priceMultiplier || 1.0);
  const toppingsPrice = selectedToppings.reduce((total, topping) => {
    const toppingData = toppings.find(t => t.name === topping);
    return total + (toppingData?.price || 0);
  }, 0);
  const totalPrice = (sizePrice + toppingsPrice) * quantity;

  const toggleTopping = (topping: string) => {
    setSelectedToppings(prev =>
      prev.includes(topping)
        ? prev.filter(t => t !== topping)
        : [...prev, topping]
    );
  };

  const handlePurchase = () => {
    console.log(`Purchased ${quantity} ${drink.name} (Size: ${selectedSize}, Toppings: ${selectedToppings.join(', ')}) for $${totalPrice.toFixed(2)}`);
    // Implement actual purchase logic here
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <Image
        source={typeof drink.image === 'string' ? { uri: drink.image } : drink.image}
        style={styles.drinkImage}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.drinkName}>{drink.name}</Text>
        <Text style={styles.basePrice}>Base Price: ${basePrice.toFixed(2)}</Text>

        {/* Size Selection */}
        <Text style={styles.sectionTitle}>Select Size</Text>
        <View style={styles.sizeContainer}>
          {sizes.map(size => (
            <TouchableOpacity
              key={size.label}
              style={[
                styles.sizeButton,
                selectedSize === size.label && styles.sizeButtonSelected,
              ]}
            >
              <Text style={[
                styles.sizeButtonText,
                selectedSize === size.label && styles.sizeButtonTextSelected,
              ]}>
                {size.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Topping Selection */}
        <Text style={styles.sectionTitle}>Select Toppings</Text>
        <View style={styles.toppingContainer}>
          {toppings.map(topping => (
            <TouchableOpacity
              key={topping.name}
              style={[
                styles.toppingButton,
                selectedToppings.includes(topping.name) && styles.toppingButtonSelected,
              ]}
              onPress={() => toggleTopping(topping.name)}
            >
              <Text style={[
                styles.toppingButtonText,
                selectedToppings.includes(topping.name) && styles.toppingButtonTextSelected,
              ]}>
                {topping.name} (+${topping.price.toFixed(2)})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quantity Selector */}
        <Text style={styles.sectionTitle}>Quantity</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(prev => Math.max(1, prev - 1))}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(prev => prev + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Total Price and Purchase Button */}
        <Text style={styles.totalPrice}>Total: ${totalPrice.toFixed(2)}</Text>
        <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase}>
          <Text style={styles.purchaseButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const theme = {
  primary: '#D17842',
  background: '#ffffff',
  text: '#333',
  gray: '#ccc',
  green: '#4CAF50',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  drinkImage: {
    width: '100%',
    height: 250,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  content: { padding: 16 },
  drinkName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
  },
  basePrice: {
    fontSize: 18,
    color: theme.gray,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginTop: 16,
    marginBottom: 8,
  },
  sizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sizeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  sizeButtonSelected: {
    backgroundColor: theme.primary,
  },
  sizeButtonText: {
    fontSize: 16,
    color: theme.text,
    fontWeight: '500',
  },
  sizeButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  toppingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  toppingButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  toppingButtonSelected: {
    backgroundColor: theme.primary,
  },
  toppingButtonText: {
    fontSize: 14,
    color: theme.text,
  },
  toppingButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 16,
    color: theme.text,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.green,
    marginBottom: 16,
    textAlign: 'center',
  },
  purchaseButton: {
    backgroundColor: theme.green,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  purchaseButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DrinkDetailScreen;