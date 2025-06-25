import React, { useState, useCallback } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, 
  Dimensions, Alert, Animated, StatusBar
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { DrinkStackParamList } from '../../navigation/CustomerDrinkStackNavigator';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type DrinkDetailRouteProp = RouteProp<DrinkStackParamList, 'DrinkDetailScreen'>;

const availableToppings = [
  { id: '1', name: 'Trân châu đen', price: 5000, icon: '🖤' },
  { id: '2', name: 'Thạch trái cây', price: 7000, icon: '🍓' },
  { id: '3', name: 'Pudding trứng', price: 6000, icon: '🍮' },
  { id: '4', name: 'Kem cheese', price: 7000, icon: '🧀' },
  { id: '5', name: 'Thạch matcha', price: 6000, icon: '🍵' },
  { id: '6', name: 'Trân châu trắng', price: 6000, icon: '🤍' },
];

const sizeOptions = [
  { size: 'S', name: 'Nhỏ', multiplier: 0.8, volume: '350ml' },
  { size: 'M', name: 'Vừa', multiplier: 1.0, volume: '500ml' },
  { size: 'L', name: 'Lớn', multiplier: 1.3, volume: '700ml' },
];

const iceOptions = [
  { id: '0', name: 'Không đá', icon: '🚫' },
  { id: '25', name: 'Ít đá', icon: '🧊' },
  { id: '50', name: 'Đá vừa', icon: '🧊🧊' },
  { id: '100', name: 'Đá nhiều', icon: '🧊🧊🧊' },
];

const sweetnessOptions = [
  { id: '0', name: '0%', label: 'Không đường' },
  { id: '30', name: '30%', label: 'Ít ngọt' },
  { id: '50', name: '50%', label: 'Vừa ngọt' },
  { id: '70', name: '70%', label: 'Ngọt' },
  { id: '100', name: '100%', label: 'Rất ngọt' },
];

const DrinkDetailScreen = () => {
  const route = useRoute<DrinkDetailRouteProp>();
  const navigation = useNavigation();
  const { drink } = route.params;

  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L'>('M');
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [selectedIce, setSelectedIce] = useState('50');
  const [selectedSweetness, setSelectedSweetness] = useState('50');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));

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
    const basePrice = parseInt(drink.price.replace(/[^\d]/g, ''));
    const sizeMultiplier = sizeOptions.find(s => s.size === selectedSize)?.multiplier || 1;
    const toppingsPrice = selectedToppings.reduce((total, toppingId) => {
      const topping = availableToppings.find(t => t.id === toppingId);
      return total + (topping?.price || 0);
    }, 0);
    
    return Math.round((basePrice * sizeMultiplier + toppingsPrice) * quantity);
  }, [drink.price, selectedSize, selectedToppings, quantity]);

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
      ice: selectedIce,
      sweetness: selectedSweetness,
      quantity,
      totalPrice: calculateTotalPrice()
    };
    
    Alert.alert(
      'Thêm vào giỏ hàng',
      `Đã thêm ${quantity} ${drink.name} vào giỏ hàng!\nTổng: ${formatPrice(calculateTotalPrice())}`,
      [{ text: 'OK', style: 'default' }]
    );
    
    console.log('Order details:', orderDetails);
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, IMAGE_HEIGHT - 120],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
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
          <Image source={drink.image} style={styles.image} resizeMode="cover" />
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
              <Text style={styles.basePrice}>{drink.price}</Text>
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
              {sizeOptions.map(option => (
                <TouchableOpacity
                  key={option.size}
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

          {/* Ice Level */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧊 Mức độ đá</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.horizontalOptions}>
                {iceOptions.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.horizontalOption,
                      selectedIce === option.id && styles.selectedOption,
                    ]}
                    onPress={() => setSelectedIce(option.id)}
                  >
                    <Text style={styles.optionIcon}>{option.icon}</Text>
                    <Text style={[
                      styles.optionText,
                      selectedIce === option.id && styles.selectedOptionText
                    ]}>
                      {option.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Sweetness Level */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🍯 Độ ngọt</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.horizontalOptions}>
                {sweetnessOptions.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.horizontalOption,
                      selectedSweetness === option.id && styles.selectedOption,
                    ]}
                    onPress={() => setSelectedSweetness(option.id)}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedSweetness === option.id && styles.selectedOptionText
                    ]}>
                      {option.name}
                    </Text>
                    <Text style={[
                      styles.optionSubtext,
                      selectedSweetness === option.id && styles.selectedOptionText
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Toppings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧋 Chọn topping</Text>
            <View style={styles.toppingsGrid}>
              {availableToppings.map(topping => (
                <TouchableOpacity
                  key={topping.id}
                  style={[
                    styles.toppingOption,
                    selectedToppings.includes(topping.id) && styles.selectedOption,
                  ]}
                  onPress={() => toggleTopping(topping.id)}
                >
                  <Text style={styles.toppingIcon}>{topping.icon}</Text>
                  <Text style={[
                    styles.toppingName,
                    selectedToppings.includes(topping.id) && styles.selectedOptionText
                  ]}>
                    {topping.name}
                  </Text>
                  <Text style={[
                    styles.toppingPrice,
                    selectedToppings.includes(topping.id) && styles.selectedOptionText
                  ]}>
                    +{formatPrice(topping.price)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
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
  // Compact Header Styles
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 44 + 44, // Status bar + header height
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
    paddingBottom: 34, 
    marginBottom: 20,
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
  quantitySection: {
    marginBottom: 80,
  },
});

export default DrinkDetailScreen;