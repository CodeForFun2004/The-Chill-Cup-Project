import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TextInput, StyleSheet, TouchableOpacity, Image, FlatList, LayoutChangeEvent
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/rootReducer';
import { loadCategories } from '../../redux/slices/categorySlice';
import { loadProducts } from '../../redux/slices/productSlice';
import ProductCard from '../../components/hompage/ProductCard';

const DrinkCategoryScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const scrollViewRef = useRef<ScrollView>(null);
  const [positions, setPositions] = useState<number[]>([]);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const categories = useSelector((s: RootState) => s.category.categories || []);
  const products = useSelector((s: RootState) => s.product.products || []);

  useEffect(() => {
    dispatch(loadCategories() as any);
    dispatch(loadProducts() as any);
  }, [dispatch]);

  const groupedProducts = categories.map(cat => ({
    ...cat,
    drinks: products.filter(p =>
      Array.isArray(p.categoryId)
        ? p.categoryId.some(c => c._id === cat._id)
        : p.categoryId._id === cat._id
    ),
  }));
  

  // useEffect(() => {
  //   console.log('categories', categories);
  //   console.log('products', products);
  // }, [categories, products]);
  

  const onLayout = (idx: number, e: LayoutChangeEvent) => {
    const y = e.nativeEvent.layout.y;
    setPositions(prev => {
      const arr = [...prev];
      arr[idx] = y;
      return arr;
    });
  };

  const scrollTo = (idx: number) => {
    if (positions[idx] != null) {
      setActiveTab(idx);
      scrollViewRef.current?.scrollTo({ y: positions[idx] - 10, animated: true });
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Tìm đồ uống yêu thích..."
        value={searchText}
        onChangeText={setSearchText} />

      <ScrollView horizontal style={styles.tabScroll} showsHorizontalScrollIndicator={false}>
        {categories.map((cat, i) => (
          <TouchableOpacity key={cat._id} onPress={() => scrollTo(i)} style={styles.tabItem}>
            <Image source={{ uri: cat.icon }} style={styles.icon} />
            <Text>{cat.category}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView ref={scrollViewRef}>
        {groupedProducts.map((cat, i) => (
          <View key={cat._id} style={{ padding: 10 }} onLayout={e => onLayout(i, e)}>
            <Text style={styles.sectionTitle}>{cat.category}</Text>
            {cat.drinks.length > 0 ? (
              <FlatList
                data={cat.drinks}
                keyExtractor={item => item._id}
                numColumns={2}
                scrollEnabled={false}   // ✅ quan trọng!
                renderItem={({ item }) => (
                  <ProductCard
                    image={{ uri: item.image }}
                    name={item.name}
                    price={item.basePrice?.toString() || '0'}
                    onPress={() => navigation.navigate('DrinkDetailScreen', { drink: item })}
                  />
                )}
              />
            ) : (
              <Text>Có thể chọn sản phẩm khác</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchInput: { margin: 10, padding: 10, backgroundColor: '#eee', borderRadius: 10 },
  tabScroll: { marginVertical: 10 },
  tabItem: { alignItems: 'center', marginHorizontal: 10 },
  icon: { width: 50, height: 50, borderRadius: 25 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
});

export default DrinkCategoryScreen;
