import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';

import { RootState } from '../../redux/rootReducer';
import {
  loadCartFromAPI,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
} from '../../redux/slices/cartSlice';

import { CartItem } from '../../components/cart/CartItem';
import { PromoCodeInput } from '../../components/cart/PromoCodeInput';
import { CartSummary } from '../../components/cart/CartSummary';
import { CartFooter } from '../../components/cart/CartFooter';
import CartHeader from '../../components/cart/CardHeader';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../navigation/customer/CustomerStackNavigator';

import type { AppDispatch } from '../../redux/store';

const CartScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<CustomerStackParamList>>();

    const dispatch = useAppDispatch();
    const { items, delivery, loading, error } = useAppSelector(
      (state) => state.cart
    );
    

  console.log('🛒 items from Redux:', items);

  useEffect(() => {
    dispatch(loadCartFromAPI());
  }, [dispatch]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal + delivery;

  const handleCheckout = () => {
    navigation.navigate('Checkout');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Đang tải giỏ hàng...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red' }}>Lỗi: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <CartHeader onClearCart={() => dispatch(clearCart())} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {items.length === 0 ? (
          <View style={styles.centered}>
            <Text>🛒 Giỏ hàng của bạn đang trống</Text>
          </View>
        ) : (
          <>
            {items.map((item) => (
              <CartItem
                key={item.id.toString()}
                name={item.name}
                category={item.category} 
                price={item.price}
                quantity={item.quantity}
                image={item.image}
                onIncrease={() => dispatch(increaseQuantity(item.id.toString()))}
                onDecrease={() => dispatch(decreaseQuantity(item.id.toString()))}
              />
            ))}

            <PromoCodeInput />
            <CartSummary subtotal={subtotal} delivery={delivery} />
            <CartFooter total={total} onCheckout={handleCheckout} />
          </>
        )}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
