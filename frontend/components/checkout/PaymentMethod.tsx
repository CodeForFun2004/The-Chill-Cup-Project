import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import vnpay from '../../assets/images/vn-pay/vietqr-logo.png'; // Ensure this path is correct

type Props = {
  selected: 'vietqr' | 'cod';
  onSelect: (method: 'vietqr' | 'cod') => void;
};

const PaymentMethod: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phương thức thanh toán</Text>

      <TouchableOpacity
        style={[styles.card, selected === 'vietqr' && styles.selected]}
        onPress={() => onSelect('vietqr')}
      >
        <View style={styles.row}>
          <Image
            source={vnpay}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.method}>Thanh toán VietQR</Text>
          {selected === 'vietqr' && <MaterialIcons name="check-circle" size={20} color="#4AA366" />}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, selected === 'cod' && styles.selected]}
        onPress={() => onSelect('cod')}
      >
        <View style={styles.row}>
          <Text style={styles.method}>💵 Thanh toán khi nhận hàng</Text>
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
