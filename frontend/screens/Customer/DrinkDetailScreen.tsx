"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Alert, Animated } from "react-native"
import { type RouteProp, useRoute, useNavigation } from "@react-navigation/native"
import type { GuestDrinkStackParamList } from "../../navigation/guest/GuestDrinkStackNavigator"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import type { NavigationProp } from "@react-navigation/native"

import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { addItemToCart } from '../../redux/slices/cartSlice';


type DrinkDetailRouteProp = RouteProp<GuestDrinkStackParamList, "DrinkDetailScreen">
type DrinkDetailNavigationProp = NavigationProp<GuestDrinkStackParamList, "DrinkDetailScreen">

const DrinkDetailScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const route = useRoute<DrinkDetailRouteProp>();
  const navigation = useNavigation<DrinkDetailNavigationProp>();
  
  // Khai báo drink ở đây, mặc dù nó có thể là undefined ban đầu
  const { drink } = route.params; 

  // --- TẤT CẢ CÁC REACT HOOKS PHẢI ĐƯỢC GỌI TRƯỚC BẤT KỲ LỆNH RETURN CÓ ĐIỀU KIỆN NÀO ---

  // Sử dụng useMemo cho các mảng phụ thuộc vào `drink` để tránh re-creation không cần thiết
  // Đảm bảo truy cập drink một cách an toàn (drink?.property) vì drink có thể là undefined
  const sizeOptions = useMemo(() => drink?.sizeOptions || [], [drink?.sizeOptions]);
  const availableToppings = useMemo(() => drink?.toppingOptions || [], [drink?.toppingOptions]);

  const [selectedSize, setSelectedSize] = useState<"S" | "M" | "L">("M");
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));

  // Hook để ẩn/hiện TabBar
  useEffect(() => {
    const parent = navigation.getParent();
    if (parent) {
      parent.setOptions({
        tabBarStyle: { display: "none" },
      });
    } else {
      console.warn("Không tìm thấy parent navigator. Kiểm tra cấu hình navigation.");
    }
    return () => {
      if (parent) {
        parent.setOptions({
          tabBarStyle: undefined,
        });
      }
    };
  }, [navigation]);

  // Hook để thiết lập size mặc định
  useEffect(() => {
    // Chỉ chạy nếu drink và sizeOptions đã sẵn sàng
    if (drink && sizeOptions.length > 0) {
      const defaultSize = sizeOptions.find((s) => s.multiplier === 1.0)?.size as "S" | "M" | "L";
      if (defaultSize) {
        setSelectedSize(defaultSize);
      } else {
        setSelectedSize("M"); // Fallback if no default is found
      }
    }
  }, [drink, sizeOptions]); // Thêm 'drink' vào dependency để hook chạy lại khi drink có dữ liệu

  const toggleTopping = useCallback((id: string) => {
    setSelectedToppings((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }, []);

  const adjustQuantity = useCallback((increment: boolean) => {
    setQuantity((prev) => (increment ? prev + 1 : Math.max(1, prev - 1)));
  }, []);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const toggleFavorite = useCallback(() => {
    setIsFavorite((prev) => {
      const newFavoriteState = !prev;
      Alert.alert(
        newFavoriteState ? "Đã thêm vào yêu thích" : "Đã xóa khỏi yêu thích",
        newFavoriteState
          ? `${drink?.name} đã được thêm vào danh sách yêu thích` // Sử dụng drink?.name an toàn
          : `${drink?.name} đã được xóa khỏi danh sách yêu thích`, // Sử dụng drink?.name an toàn
        [{ text: "OK", style: "default" }],
      );
      return newFavoriteState;
    });
  }, [drink?.name]); // Dependency array cần drink.name

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  }, []); // Hàm này không phụ thuộc vào state hay props nào, có thể để dependency rỗng

  // Ensure basePrice is a number, defaulting to 0 if not valid
  // basePrice cần được tính toán sau khi drink chắc chắn có giá trị, hoặc xử lý defensive
  const basePrice = typeof drink?.basePrice === "number" ? drink.basePrice : 0;

  const calculateTotalPrice = useCallback(() => {
    const sizeMultiplier = sizeOptions.find((s) => s.size === selectedSize)?.multiplier || 1;
    const toppingsPrice = selectedToppings.reduce((total, toppingId) => {
      const topping = availableToppings.find((t) => t._id === toppingId);
      return total + (topping?.price || 0);
    }, 0);

    return Math.round((basePrice * sizeMultiplier + toppingsPrice) * quantity);
  }, [basePrice, sizeOptions, availableToppings, selectedSize, selectedToppings, quantity]);

  const handleAddToCart = useCallback(async () => {
    if (!drink) { // Thêm kiểm tra drink ở đây trước khi gửi dữ liệu
      Alert.alert('Lỗi', 'Không tìm thấy thông tin sản phẩm để thêm vào giỏ hàng.');
      return;
    }

    const itemToSend = {
      productId: drink.id,
      size: selectedSize,
      toppings: selectedToppings,
      quantity,
    };

    console.log("Sending item to backend:", itemToSend);

    try {
      await dispatch(addItemToCart(itemToSend)).unwrap();

      Alert.alert(
        'Thành công',
        `Đã thêm ${quantity} ${drink.name} vào giỏ hàng!`,
        [{ text: 'OK', style: 'default' }]
      );
      navigation.goBack();
    } catch (error: any) {
      console.error("Failed to add item to cart:", error);
      let errorMessage = "Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert('Lỗi', errorMessage);
    }
  }, [dispatch, drink, navigation, quantity, selectedSize, selectedToppings]); // Thêm đầy đủ dependencies

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, IMAGE_HEIGHT - 120],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // --- KIỂM TRA ĐIỀU KIỆN ĐỂ RETURN SỚM CHỈ ĐƯỢC ĐẶT SAU TẤT CẢ CÁC LỆNH GỌI HOOK ---
  if (!drink) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading drink details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Compact Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <LinearGradient colors={["#4AA366", "#66BB6A"]} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.headerBackButton} onPress={handleGoBack}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {drink.name}
            </Text>
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
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image Section */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: drink.image }} style={styles.image} resizeMode="cover" />
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.3)"]} style={styles.imageOverlay} />

          {/* Navigation Buttons */}
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? "#FF6B6B" : "#fff"} />
          </TouchableOpacity>
        </View>
        {/* Main Content */}
        <View style={styles.contentContainer}>
          {/* Basic Info */}
          <View style={styles.basicInfo}>
            <Text style={styles.name}>{drink.name}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.basePrice}>{formatPrice(basePrice)}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.rating}>4.8 (124)</Text>
              </View>
            </View>
          </View>
          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Mô tả</Text>
            <Text style={styles.description}>{drink.description}</Text>
          </View>
          {/* Size Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📏 Chọn size</Text>
            <View style={styles.optionsGrid}>
              {sizeOptions.map((option, index) => (
                <TouchableOpacity
                  key={option.size || `size-${index}`}
                  style={[styles.sizeOption, selectedSize === option.size && styles.selectedOption]}
                  onPress={() => setSelectedSize(option.size as "S" | "M" | "L")}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedSize === option.size ? styles.selectedOptionText : styles.unselectedOptionText,
                    ]}
                  >
                    {option.size}
                  </Text>
                  <Text
                    style={[
                      styles.optionSubtext,
                      selectedSize === option.size ? styles.selectedOptionText : styles.unselectedOptionText,
                    ]}
                  >
                    {option.name}
                  </Text>
                  <Text
                    style={[
                      styles.optionVolume,
                      selectedSize === option.size ? styles.selectedOptionText : styles.unselectedOptionText,
                    ]}
                  >
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
              {availableToppings.map((topping, index) => (
                <TouchableOpacity
                  key={topping._id || `topping-${index}`}
                  style={[styles.toppingOption, selectedToppings.includes(topping._id) && styles.selectedOption]}
                  onPress={() => toggleTopping(topping._id)}
                >
                  <Text style={styles.toppingIcon}>{topping.icon}</Text>
                  <Text
                    style={[
                      styles.toppingName,
                      selectedToppings.includes(topping._id) ? styles.selectedOptionText : styles.unselectedOptionText,
                    ]}
                  >
                    {topping.name}
                  </Text>
                  <Text
                    style={[
                      styles.toppingPrice,
                      selectedToppings.includes(topping._id) ? styles.selectedOptionText : styles.unselectedOptionText,
                    ]}
                  >
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
              <TouchableOpacity style={styles.quantityButton} onPress={() => adjustQuantity(false)}>
                <Ionicons name="remove" size={20} color="#4AA366" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity style={styles.quantityButton} onPress={() => adjustQuantity(true)}>
                <Ionicons name="add" size={20} color="#4AA366" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ height: 120 }} />
        </View>
      </Animated.ScrollView>
      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <LinearGradient colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,1)"]} style={styles.bottomBarGradient}>
          <View style={styles.priceSection}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalPrice}>{formatPrice(calculateTotalPrice())}</Text>
          </View>
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <LinearGradient colors={["#4AA366", "#66BB6A"]} style={styles.addToCartGradient}>
              <MaterialIcons name="shopping-cart" size={20} color="#fff" />
              <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
};

const { width } = Dimensions.get("window");
const IMAGE_HEIGHT = width * 0.8;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    zIndex: 1000,
  },
  headerGradient: {
    flex: 1,
    justifyContent: "flex-end",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
    height: 44,
  },
  headerBackButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginHorizontal: 16,
  },
  headerFavoriteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: width,
    height: IMAGE_HEIGHT,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButton: {
    position: "absolute",
    top: 50,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    backgroundColor: "#fff",
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
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  basePrice: {
    fontSize: 24,
    color: "#4AA366",
    fontWeight: "bold",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
  },
  optionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  sizeOption: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  selectedOption: {
    backgroundColor: "#4AA366",
    borderColor: "#4AA366",
  },
  optionText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  selectedOptionText: {
    color: "#fff",
  },
  optionSubtext: {
    fontSize: 13,
    marginTop: 4,
  },
  optionVolume: {
    fontSize: 12,
    marginTop: 2,
  },
  optionPrice: {
    fontSize: 14,
    fontWeight: "bold",
  },
  unselectedOptionText: {
    color: "#333",
  },
  toppingIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  toppingName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
  },
  toppingPrice: {
    fontSize: 12,
    color: "#4AA366",
    fontWeight: "bold",
  },
  toppingsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
  },
  toppingOption: {
    width: "48%",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 12,
    margin: "1%",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    padding: 10,
  },
  quantityButton: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quantityText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginHorizontal: 30,
  },
  nutritionGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    padding: 15,
  },
  nutritionItem: {
    alignItems: "center",
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4AA366",
  },
  nutritionLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  bottomBar: {
    position: "absolute",
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
    alignItems: "center",
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 14,
    color: "#666",
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4AA366",
  },
  addToCartButton: {
    borderRadius: 15,
    overflow: "hidden",
  },
  addToCartGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  addToCartText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
});

export default DrinkDetailScreen;