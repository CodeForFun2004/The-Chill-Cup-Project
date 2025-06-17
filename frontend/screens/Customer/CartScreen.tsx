import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import {
  setCartItems,
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
import { CustomerStackParamList } from '../../navigation/CustomerStackNavigator';

import { mockData } from '../../data/carts';




const CartScreen = () => {

  
const navigation = useNavigation<NativeStackNavigationProp<CustomerStackParamList>>();

  const dispatch = useDispatch();
  const { items, delivery } = useSelector((state: RootState) => state.cart);

  useEffect(() => {
    dispatch(setCartItems(mockData));
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + delivery;

  const handleCheckout = () => {
    navigation.navigate('Checkout');
  };
  

  return (
    <View style={styles.wrapper}>
      <CartHeader onClearCart={() => dispatch(clearCart())} />

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        {items.map(item => (
          <CartItem
            key={item.id}
            name={item.name}
            brand={item.brand}
            price={item.price}
            quantity={item.quantity}
            image={item.image}
            onIncrease={() => dispatch(increaseQuantity(item.id))}
            onDecrease={() => dispatch(decreaseQuantity(item.id))}
          />
        ))}

        <PromoCodeInput />
        <CartSummary subtotal={subtotal} delivery={delivery} />
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
