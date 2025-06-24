import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { setOrderInfo } from '../../redux/slices/orderSlice';
import uuid from 'react-native-uuid';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../navigation/customer/CustomerStackNavigator';

import { addOrder } from '../../data/orders';

const PlaceOrderButton = ({
  location,
  phone,
  paymentMethod,
}: {
  location: string;
  phone: string;
  paymentMethod: 'cod' | 'vnpay';
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<CustomerStackParamList>>();
  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.cart);

  const handlePlaceOrder = () => {
    if (!cart.items.length) {
      Alert.alert('Cart is empty');
      return;
    }

    const now = new Date();
    const id = String(uuid.v4()); // ✅ generate uuid
    const orderNumber = `#ORD-${id.slice(0, 6)}`; // ✅ generate orderNumber
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * cart.taxRate);
    const total = subtotal + tax + cart.delivery;

    const order = {
      id,
      orderNumber,
      items: cart.items,
      total,
      address: location,
      paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'VNPAY',
      deliveryTime: '25–35 mins',
      date: now.toLocaleDateString('en-CA'),
      time: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      status: 'Processing' as const,
      estimatedDelivery: '25–35 mins',
      deliveryAddress: location,
      phoneNumber: phone,
    };

    dispatch(setOrderInfo(order));
    addOrder(order); // ✅ thêm order vào danh sách hiện tại
    navigation.navigate('OrderSuccess');
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePlaceOrder}>
      <Text style={styles.buttonText}>Place Order</Text>
    </TouchableOpacity>
  );
};

export default PlaceOrderButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#e53935',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
