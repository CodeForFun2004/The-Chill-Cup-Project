import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { DrinkStackParamList } from '../../navigation/DrinkStackNavigator';
import { Ionicons } from '@expo/vector-icons';

type DrinkDetailRouteProp = RouteProp<DrinkStackParamList, 'DrinkDetailScreen'>;

const DrinkDetailScreen = () => {
  const route = useRoute<DrinkDetailRouteProp>();
  const navigation = useNavigation();
  const { drink } = route.params;

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Ảnh sản phẩm */}
        <Image source={drink.image} style={styles.image} resizeMode="cover" />

        {/* Nút quay lại */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Thông tin */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{drink.name}</Text>
          <Text style={styles.price}>{drink.price}</Text>

          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description}>
            {`Một lựa chọn tuyệt vời cho ngày mới. ${drink.name} được pha chế từ những nguyên liệu chất lượng, mang lại hương vị đậm đà, thơm ngon và trọn vẹn.`}
          </Text>

          <Text style={styles.sectionTitle}>Chọn size</Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionButton}>
              <Text>S</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton}>
              <Text>M</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton}>
              <Text>L</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Nút thêm vào giỏ */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.addToCartButton}>
          <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = width * 0.9;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: width,
    height: IMAGE_HEIGHT,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    backgroundColor: '#00000088',
    borderRadius: 20,
    padding: 8,
  },
  infoContainer: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  price: {
    fontSize: 20,
    color: '#D17842',
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    color: '#555',
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  optionsContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    marginBottom: 60
  },
  addToCartButton: {
    backgroundColor: '#D17842',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DrinkDetailScreen;
