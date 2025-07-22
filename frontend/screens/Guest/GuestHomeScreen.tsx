import React, { useEffect } from "react";
import { View, ScrollView, StyleSheet, FlatList, Text } from "react-native";
import Header from "../../components/hompage/Header";
import LoginBanner from "../../components/hompage/LoginBanner";
import PromoBanner from "../../components/hompage/PromoBanner";
import CategoryCardBlock from "../../components/hompage/search-card/CategoryCardBlock";
import ProductSection from "../../components/hompage/ProductSection"; // Giữ nguyên nếu bạn muốn dùng lại component này
import ProductCard from "../../components/hompage/ProductCard"; // Hoặc dùng ProductCard trực tiếp như CustomerHomeScreen
import OrderMethodBlock from '../../components/delivery-pickup/OrderMethodBlock';
import DeliveryAddressBlock from '../../components/delivery-pickup/DeliveryAddressBlock';
import PickupStoreBlock from '../../components/delivery-pickup/PickupStoreBlock';
import { useOrder } from '../../contexts/OrderContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/rootReducer';
import { loadProducts, setGroupedProducts } from '../../redux/slices/productSlice';
import { groupProductsByCategory } from '../../utils/groupProducts';
import { formatCurrency } from '../../utils/formatCurrency';
import ChatModal from "../../components/chat-box/ChatModal";

const GuestHomeScreen = ({ navigation }: any) => {
  const { method } = useOrder();
  const dispatch = useDispatch();

  // Lấy dữ liệu sản phẩm đã nhóm từ redux
  const { groupedProducts } = useSelector((state: RootState) => state.product);

  // Load dữ liệu khi vào Home
  useEffect(() => {
    const fetchAndGroupProducts = async () => {
      try {
        const resultAction = await dispatch(loadProducts() as any);
        if (loadProducts.fulfilled.match(resultAction)) {
          const products = resultAction.payload;
          const grouped = groupProductsByCategory(products);
          dispatch(setGroupedProducts(grouped));
        }
      } catch (error) {
        console.error('❌ Error fetching products for GuestHomeScreen', error);
      }
    };
    fetchAndGroupProducts();
  }, [dispatch]);

  // Đưa category "Món Mới Phải Thử" lên đầu
  const sortedGroupedProducts = React.useMemo(() => {
    if (!groupedProducts || groupedProducts.length === 0) return [];
    const specialCategoryName = "Món Mới Phải Thử";
    const specialIndex = groupedProducts.findIndex(cat => cat.category === specialCategoryName);
    if (specialIndex > 0) {
      const newArr = [...groupedProducts];
      const [special] = newArr.splice(specialIndex, 1);
      newArr.unshift(special);
      return newArr;
    }
    return groupedProducts;
  }, [groupedProducts]);


  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LoginBanner />

        <OrderMethodBlock />
        {method === 'delivery' && <DeliveryAddressBlock />}
        {method === 'pickup' && <PickupStoreBlock />}

        <PromoBanner />
        <CategoryCardBlock />

        {/* Hiển thị từng category và sản phẩm bằng ProductSection hoặc FlatList */}
        {sortedGroupedProducts.map((cat) =>
          cat.drinks.length > 0 && (
            <View key={cat._id} style={styles.section}>
              <Text style={styles.categoryTitle}>{cat.category}</Text>
              <FlatList
                data={cat.drinks}
                keyExtractor={(drink) => drink._id}
                numColumns={2}
                scrollEnabled={false}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                renderItem={({ item: drink }) => (
                  <ProductCard
                    product={{
                      id: drink._id,
                      name: drink.name,
                      category: drink.categoryId,
                      image: drink.image,
                      description: drink.description,
                      basePrice: drink.basePrice,
                      sizeOptions: drink.sizeOptions,
                      toppingOptions: drink.toppingOptions,
                      price: formatCurrency(drink.basePrice),
                    }}
                    onPress={() =>
                      navigation.navigate('DrinkDetailScreen', {
                        drink: {
                          id: drink._id,
                          name: drink.name,
                          category: drink.categoryId,
                          image: drink.image,
                          description: drink.description,
                          basePrice: drink.basePrice,
                          sizeOptions: drink.sizeOptions,
                          toppingOptions: drink.toppingOptions,
                        },
                      })
                    }
                  />
                )}
              />
            </View>
          )
        )}

    
      </ScrollView>
      <ChatModal/>
    </View>
  );
};


export default GuestHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  section: {
    paddingVertical: 10, // Có thể điều chỉnh khoảng cách giữa các ProductSection
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
});