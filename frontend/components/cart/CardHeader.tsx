// components/cart/CartHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type Props = {
  onClearCart: () => void;
};

const CartHeader = ({ onClearCart }: Props) => {
  const navigation = useNavigation();

  const confirmClear = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xoá giỏ hàng?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Xoá', style: 'destructive', onPress: onClearCart },
    ]);
  };

  console.log('CartHeader rendered');

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Giỏ Hàng</Text>

      <TouchableOpacity onPress={confirmClear}>
        <MaterialCommunityIcons name="delete-outline" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );
};

export default CartHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F4F4F4',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
});
