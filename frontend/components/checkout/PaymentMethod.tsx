import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type Props = {
  selected: 'vnpay' | 'cod';
  onSelect: (method: 'vnpay' | 'cod') => void;
};

const PaymentMethod: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Method</Text>

      <TouchableOpacity
        style={[styles.card, selected === 'vnpay' && styles.selected]}
        onPress={() => onSelect('vnpay')}
      >
        <View style={styles.row}>
          <Image
            source={require('../../assets/images/vn-pay/vnpay-logo.png')}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.method}>VNPay Payment</Text>
          {selected === 'vnpay' && <MaterialIcons name="check-circle" size={20} color="#4AA366" />}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, selected === 'cod' && styles.selected]}
        onPress={() => onSelect('cod')}
      >
        <View style={styles.row}>
          <Text style={styles.method}>💵 Cash on Delivery</Text>
          {selected === 'cod' && <MaterialIcons name="check-circle" size={20} color="#4AA366" />}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default PaymentMethod;

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
  },
  selected: {
    borderWidth: 1.5,
    borderColor: '#4AA366',
  },
  method: {
    fontWeight: 'bold',
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    width: 24,
    height: 24,
  },
});
