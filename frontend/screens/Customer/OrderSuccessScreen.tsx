import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import OrderSuccessHeader from '../../components/order-success/OrderSuccessHeader';
import OrderSummaryDetails from '../../components/order-success/OrderSummaryDetails';
import OrderSuccessActions from '../../components/order-success/OrderSuccessActions';


const OrderSuccessScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <OrderSuccessHeader />
      <OrderSummaryDetails />
      <OrderSuccessActions />
    </ScrollView>
  );
};

export default OrderSuccessScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    paddingBottom: 100,
  },
});
