import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';

import { CartItem } from '../../components/cart/CartItem';
import { PromoCodeInput } from '../../components/cart/PromoCodeInput';
import { CartSummary } from '../../components/cart/CartSummary';
import { CartFooter } from '../../components/cart/CartFooter';
import CartHeader from '../../components/cart/CardHeader';

const mockData = [
  {
    id: 1,
    name: 'Bạc Xỉu',
    brand: 'Pizza Italiano',
    price: 55000,
    quantity: 1,
    image: require('../../assets/images/coffee/bac-xiu.png'),
  },
  {
    id: 2,
    name: 'Hồng Trà Sữa Trân Châu',
    brand: 'Melt House',
    price: 55000,
    quantity: 1,
    image: require('../../assets/images/bubble-tea/hong-tra-sua-tran-chau.png'),
  },
  {
    id: 3,
    name: 'Matcha Latte',
    brand: 'Burger Hunt',
    price: 59000,
    quantity: 1,
    image: require('../../assets/images/matcha/matcha-latte.png'),
  },
];

const CartScreen = () => {
  const [items, setItems] = useState(mockData);
  const deliveryFee = 5000;

  const handleIncrease = (id: number) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item))
    );
  };

  const handleDecrease = (id: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    Alert.alert('Thông báo', 'Chức năng Checkout đang được phát triển.');
  };

  return (
    <View style={styles.wrapper}>
      <CartHeader onClearCart={() => setItems([])} />

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        {items.map(item => (
          <CartItem
            key={item.id}
            name={item.name}
            brand={item.brand}
            price={item.price}
            quantity={item.quantity}
            image={item.image}
            onIncrease={() => handleIncrease(item.id)}
            onDecrease={() => handleDecrease(item.id)}
          />
        ))}

        <PromoCodeInput />
        <CartSummary subtotal={subtotal} delivery={deliveryFee} />
        <CartFooter total={total} onCheckout={handleCheckout} />
      </ScrollView>
    </View>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F4F4F4',
  },
});
