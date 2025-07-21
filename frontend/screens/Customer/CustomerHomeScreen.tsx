import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, FlatList, Text } from 'react-native';
import Header from '../../components/hompage/Header';
import AfterLoginBanner from '../../components/hompage/AfterLoginBanner';
import PromoBanner from '../../components/hompage/PromoBanner';
import CategoryCardBlock from '../../components/hompage/search-card/CategoryCardBlock';
import ProductCard from '../../components/hompage/ProductCard';
import OrderMethodBlock from '../../components/delivery-pickup/OrderMethodBlock';
import DeliveryAddressBlock from '../../components/delivery-pickup/DeliveryAddressBlock';
import PickupStoreBlock from '../../components/delivery-pickup/PickupStoreBlock';
import { useOrder } from '../../contexts/OrderContext';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/rootReducer';
import { formatCurrency } from '../../utils/formatCurrency';
import { loadProducts, setGroupedProducts } from '../../redux/slices/productSlice';
import { loadCategories } from '../../redux/slices/categorySlice';
import { groupProductsByCategory } from '../../utils/groupProducts';

export default function CustomerHomeScreen({ navigation }: any) {
  const { method } = useOrder();
  const dispatch = useDispatch();

  // Lấy dữ liệu sản phẩm từ redux
  const { groupedProducts } = useSelector((state: RootState) => state.product);

  // Load dữ liệu khi vào Home
  useEffect(() => {
    dispatch(loadCategories() as any);
    const fetchAndGroupProducts = async () => {
      try {
        const resultAction = await dispatch(loadProducts() as any);
        if (loadProducts.fulfilled.match(resultAction)) {
          const products = resultAction.payload;
          const grouped = groupProductsByCategory(products);
          dispatch(setGroupedProducts(grouped));
        }
      } catch (error) {
        console.error('❌ Error fetching products', error);
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
        <AfterLoginBanner />
        <OrderMethodBlock />
        {method === 'delivery' && <DeliveryAddressBlock />}
        {method === 'pickup' && <PickupStoreBlock />}
        <PromoBanner />
        <CategoryCardBlock />

        {/* Hiển thị từng category và sản phẩm bằng ProductCard */}
        {sortedGroupedProducts.map((cat) =>
          cat.drinks.length > 0 && (
            <View key={cat._id} style={styles.section}>
              <FlatList
                data={cat.drinks}
                keyExtractor={(drink) => drink._id}
                numColumns={2}
                scrollEnabled={false}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                ListHeaderComponent={
                  <View>
                    <Text style={styles.categoryTitle}>{cat.category}</Text>
                  </View>
                }
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

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  scrollContent: { paddingBottom: 20 },
  section: { padding: 16 },
  categoryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
});
