import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { formatCurrency } from '../../utils/formatCurrency';

type CartItemProps = {
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: any;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
};

export const CartItem: React.FC<CartItemProps> = ({
  name,
  category,
  price,
  quantity,
  image,
  onIncrease,
  onDecrease,
  onRemove,
}) => {
  return (
    <View style={styles.container}>
      <Image source={{uri:image}} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.price}>{formatCurrency(price)}</Text>
      </View>
      <View style={styles.quantityBox}>
        <TouchableOpacity style={styles.qtyButton} onPress={onDecrease}>
          <Text style={styles.qtyText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.qtyCount}>{quantity}</Text>
        <TouchableOpacity style={styles.qtyButton} onPress={onIncrease}>
          <Text style={styles.qtyText}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
    <Text style={styles.removeText}>🗑</Text>
  </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  category: {
    fontSize: 13,
    color: '#999',
  },
  price: {
    fontSize: 15,
    marginTop: 4,
  },
  quantityBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyButton: {
    backgroundColor: '#EDEDED',
    padding: 6,
    borderRadius: 6,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  qtyCount: {
    marginHorizontal: 8,
    fontSize: 16,
  },
  removeButton: {
  marginLeft: 12,
  padding: 6,
},
removeText: {
  fontSize: 18,
  color: '#ff3333',
},
});
