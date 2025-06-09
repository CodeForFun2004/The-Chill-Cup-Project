import React from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType, TouchableOpacity } from 'react-native';

type ProductCardProps = {
  image: ImageSourcePropType;
  name: string;
  price: string;
};

const ProductCard = ({ image, name, price }: ProductCardProps) => {
  return (
    <View style={styles.card}>
      <Image source={image} style={styles.image} />
      <Text style={styles.name}>{name}</Text>
      <View style={styles.bottomContainer}>
        <Text style={styles.price}>{price}</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
    position: 'relative', // Cho phép sử dụng absolute position cho các phần tử con
    paddingBottom: 40, // Để không bị chồng lên giá và nút "Add"
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  name: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    position: 'absolute',
    bottom: 10, // Đặt container ở phía dưới
    paddingHorizontal: 10,
  },
  price: {
    fontSize: 14,
    color: '#4AA366',
    position: 'absolute',
    left: 21, // Đặt giá ở vị trí bên trái
  },
  addButton: {
    backgroundColor: '#4AA366',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexShrink: 0,
    position: 'absolute',
    right: 10, // Đặt nút "Add" ở phía bên phải
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ProductCard;
