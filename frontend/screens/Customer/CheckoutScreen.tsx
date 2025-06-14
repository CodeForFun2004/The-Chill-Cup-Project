import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

import LocationInfo from '../../components/checkout/LocationInfo';
import OrderSummary from '../../components/checkout/OrderSummary';
import PaymentMethod from '../../components/checkout/PaymentMethod';
import PlaceOrderButton from '../../components/checkout/PlaceOrderButton';
import CheckoutHeader from '../../components/checkout/CheckoutHeader';

const CheckoutScreen = () => {
  const { items, delivery, taxRate } = useSelector((state: RootState) => state.cart);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * taxRate);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <CheckoutHeader />
        <LocationInfo />
        <OrderSummary subtotal={subtotal} delivery={delivery} tax={tax} />
        <PaymentMethod />
        <PlaceOrderButton />
      </ScrollView>
    </View>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
    padding: 16,
  },
});
