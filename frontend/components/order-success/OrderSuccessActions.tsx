import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { RootState } from '../../redux/store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../navigation/customer/CustomerStackNavigator';

const OrderSuccessActions = () => {
  const order = useSelector((state: RootState) => state.order);
  const navigation = useNavigation<NativeStackNavigationProp<CustomerStackParamList>>();

  const handleBackToHome = () => {
    const parentNav = navigation.getParent();
    parentNav?.navigate('CustomerHomeStack', {
      screen: 'CustomerHomeScreen',
    });
  };

  const handleTrackOrder = () => {
    if (!order || !order.id) {
      console.warn('Không có đơn hàng hợp lệ để theo dõi.');
      return;
    }

    navigation.navigate('OrderTracking', { order });
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.button, styles.outlineButton]}
        onPress={handleBackToHome}
      >
        <Text style={styles.outlineText}>← Quay về trang chủ</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handleTrackOrder}
      >
        <MaterialIcons name="local-shipping" size={20} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.primaryText}>Theo dõi đơn hàng</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OrderSuccessActions;

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  outlineButton: {
    backgroundColor: '#fff0f0',
  },
  outlineText: {
    color: '#e53935',
    fontWeight: 'bold',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#e53935',
  },
  primaryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
