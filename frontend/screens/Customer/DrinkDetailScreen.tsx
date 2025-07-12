import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity,
  Dimensions, Alert, Animated
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { DrinkStackParamList } from '../../navigation/CustomerDrinkStackNavigator';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationProp } from '@react-navigation/native';

type DrinkDetailRouteProp = RouteProp<DrinkStackParamList, 'DrinkDetailScreen'>;
type DrinkDetailNavigationProp = NavigationProp<DrinkStackParamList, 'DrinkDetailScreen'>;

const DrinkDetailScreen = () => {
  const route = useRoute<DrinkDetailRouteProp>();
  const rawDrink = route.params.drink;
  const drink = {
    ...rawDrink,
    toppingOptions: rawDrink.toppingOptions ?? [],
  };

  const navigation = useNavigation<DrinkDetailNavigationProp>();
  const [selectedSize, setSelectedSize] = useState(
    drink.sizes.find(s => s.size === 'M')?.size || 'M'
  );
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));

  useEffect(() => {
    // Ẩn bottom tab bar
    const parent = navigation.getParent();
    if (parent) {
      parent.setOptions({
        tabBarStyle: { display: 'none' },
      });
    } else {
      console.warn('Không tìm thấy parent navigator. Kiểm tra cấu hình navigation.');
    }

    return () => {
      if (parent) {
        parent.setOptions({
          tabBarStyle: undefined,
        });
      }
    };
  }, [navigation]);

  const toggleTopping = useCallback((id: string) => {
    setSelectedToppings(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  }, []);

  const adjustQuantity = useCallback((increment: boolean) => {
    setQuantity(prev => increment ? prev + 1 : Math.max(1, prev - 1));
  }, []);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const toggleFavorite = useCallback(() => {
    setIsFavorite(prev => {
      const newFavoriteState = !prev;

      Alert.alert(
        newFavoriteState ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích',
        newFavoriteState ? `${drink.name} đã được thêm vào danh sách yêu thích` : `${drink.name} đã được xóa khỏi danh sách yêu thích`,
        [{ text: 'OK', style: 'default' }]
      );

      return newFavoriteState;
    });
  }, [drink.name]);

  const calculateTotalPrice = useCallback(() => {
    const basePrice = drink.basePrice;
    const sizeMultiplier = drink.sizes.find((s) => s.size === selectedSize)?.multiplier || 1;

    const toppingsPrice = selectedToppings.reduce((total, toppingId) => {
      const topping = (drink.toppingOptions ?? []).find(t => t._id === toppingId);
      return total + (topping?.price || 0);
    }, 0);

    return Math.round((basePrice * sizeMultiplier + toppingsPrice) * quantity);
  }, [drink, selectedSize, selectedToppings, quantity]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleAddToCart = () => {
    const orderDetails = {
      drink,
      size: selectedSize,
      toppings: selectedToppings,
      quantity,
      totalPrice: calculateTotalPrice()
    };

    Alert.alert(
      'Thêm vào giỏ hàng',
      `Đã thêm ${quantity} ${drink.name} vào giỏ hàng!\nTổng: ${formatPrice(calculateTotalPrice())}`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, IMAGE_HEIGHT - 120],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Compact Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={['#4AA366', '#66BB6A']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.headerBackButton} onPress={handleGoBack}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>{drink.name}</Text>
            <TouchableOpacity style={styles.headerFavoriteButton} onPress={toggleFavorite}>
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={20}
                color={isFavorite ? "#FFB6C1" : "#fff"}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image Section */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: drink.image }} style={styles.image} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.imageOverlay}
          />

          {/* Navigation Buttons */}
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? "#FF6B6B" : "#fff"}
            />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          {/* Basic Info */}
          <View style={styles.basicInfo}>
            <Text style={styles.name}>{drink.name}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.basePrice}>{drink.basePrice}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.rating}>4.8 (124)</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Mô tả</Text>
            <Text style={styles.description}>
              Một lựa chọn tuyệt vời cho ngày mới. {drink.name} được pha chế từ những nguyên liệu chất lượng cao,
              mang đến hương vị đậm đà và sảng khoái. Thích hợp cho mọi thời điểm trong ngày.
            </Text>
          </View>

          {/* Size Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📏 Chọn size</Text>
            <View style={styles.optionsGrid}>
              {drink.sizes.map((option: { size: boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | React.Key | null | undefined; name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; volume: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }) => (
                <TouchableOpacity
                  // key={option.size}
                  style={[
                    styles.sizeOption,
                    selectedSize === option.size && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedSize(option.size as 'S' | 'M' | 'L')}
                >
                  <Text style={[
                    styles.optionText,
                    selectedSize === option.size && styles.selectedOptionText
                  ]}>
                    {option.size}
                  </Text>
                  <Text style={[
                    styles.optionSubtext,
                    selectedSize === option.size && styles.selectedOptionText
                  ]}>
                    {option.name}
                  </Text>
                  <Text style={[
                    styles.optionVolume,
                    selectedSize === option.size && styles.selectedOptionText
                  ]}>
                    {option.volume}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Toppings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧋 Chọn topping</Text>
            <View style={styles.toppingsGrid}>
              {(drink.toppingOptions || []).map(topping => (
                <TouchableOpacity
                  key={topping._id}
                  style={[
                    styles.toppingOption,
                    selectedToppings.includes(topping._id) && styles.selectedOption,
                  ]}
                  onPress={() => toggleTopping(topping._id)}
                >
                  <Text style={styles.toppingIcon}>{topping.icon}</Text>
                  <Text style={[
                    styles.toppingName,
                    selectedToppings.includes(topping._id) && styles.selectedOptionText
                  ]}>
                    {topping.name}
                  </Text>
                  <Text style={[
                    styles.toppingPrice,
                    selectedToppings.includes(topping._id) && styles.selectedOptionText
                  ]}>
                    +{formatPrice(topping.price)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quantity Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔢 Số lượng</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => adjustQuantity(false)}
              >
                <Ionicons name="remove" size={20} color="#4AA366" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => adjustQuantity(true)}
              >
                <Ionicons name="add" size={20} color="#4AA366" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </View>
      </Animated.ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <LinearGradient
          colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,1)']}
          style={styles.bottomBarGradient}
        >
          <View style={styles.priceSection}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalPrice}>{formatPrice(calculateTotalPrice())}</Text>
          </View>
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <LinearGradient
              colors={['#4AA366', '#66BB6A']}
              style={styles.addToCartGradient}
            >
              <MaterialIcons name="shopping-cart" size={20} color="#fff" />
              <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');
const IMAGE_HEIGHT = width * 0.8;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    zIndex: 1000,
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    height: 44,
  },
  headerBackButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerFavoriteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: width,
    height: IMAGE_HEIGHT,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -25,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  basicInfo: {
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  basePrice: {
    fontSize: 24,
    color: '#4AA366',
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  optionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sizeOption: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  selectedOption: {
    backgroundColor: '#4AA366',
    borderColor: '#4AA366',
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedOptionText: {
    color: '#fff',
  },
  optionSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  optionVolume: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  horizontalOptions: {
    flexDirection: 'row',
    paddingHorizontal: 5,
  },
  horizontalOption: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 80,
    backgroundColor: '#f8f9fa',
  },
  optionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  toppingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  toppingOption: {
    width: '48%',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    margin: '1%',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  toppingIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  toppingName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  toppingPrice: {
    fontSize: 12,
    color: '#4AA366',
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 10,
  },
  quantityButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quantityText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 30,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 15,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4AA366',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomBarGradient: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
  },
  priceSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4AA366',
  },
  addToCartButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  addToCartGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  addToCartText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default DrinkDetailScreen;