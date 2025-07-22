import React from 'react';

import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { addItemToCart } from '../../redux/slices/cartSlice';
import splash from '../../assets/images/bubble-tea/hong-tra-sua-tran-chau.png'; 

type ProductCardProps = {
  product: any; // Should be typed properly, but using any for now
  onPress?: () => void;
};

const ProductCard = ({ product, onPress }: ProductCardProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleAddToCart = async () => {
    if (!product) return;
    // Use default size/toppings if available, else fallback
    const size = product.sizeOptions?.[0]?.size || "M";
    const itemToSend = {
      productId: product.id,
      size,
      toppings: [],
      quantity: 1,
    };
    try {
      await dispatch(addItemToCart(itemToSend)).unwrap();
      Alert.alert('Thành công', `Đã thêm 1 ${product.name} vào giỏ hàng!`);
    } catch {
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng.');
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.card}>
      {/* <Image source={{ uri: product.image }} style={styles.image} /> */}
      <Image
  source={
    typeof product.image === 'string' && product.image
      ? { uri: product.image }
      :splash // Đường dẫn ảnh mặc định
  }
  style={styles.image}
/>
      <Text style={styles.name}>{product.name}</Text>
      <View style={styles.bottomContainer}>
        <Text style={styles.price}>{product.price ? `${product.price}` : ''}</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
