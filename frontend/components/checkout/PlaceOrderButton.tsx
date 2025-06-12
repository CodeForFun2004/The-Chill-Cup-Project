import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { setOrderInfo } from '../../redux/slices/orderSlice';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../navigation/CustomerStackNavigator';

const PlaceOrderButton = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CustomerStackParamList>>();
  const dispatch = useDispatch();

  const { items, delivery, taxRate } = useSelector((state: RootState) => state.cart);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + delivery + tax;

  const handlePress = () => {
    const formattedItems = items.map(i => `${i.name} x${i.quantity}`).join(', ');

    dispatch(setOrderInfo({
      orderId: Math.random().toString(36).substr(2, 8).toUpperCase(),
      items: formattedItems,
      total,
      address: '123 Sakura Street, Downtown', // sau này có thể lấy từ location state
      paymentMethod: 'VNPay', // sau này có thể lấy từ PaymentMethod state
      deliveryTime: '25–35 mins',
    }));

    navigation.navigate('OrderSuccess');
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Text style={styles.text}>🛒 Place Order</Text>
    </TouchableOpacity>
  );
};

export default PlaceOrderButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#E53935',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
