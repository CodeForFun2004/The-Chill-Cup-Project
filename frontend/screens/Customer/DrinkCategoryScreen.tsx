import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, FlatList,
  TextInput, StyleSheet, Image, ActivityIndicator
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { RootState } from '../../redux/rootReducer';
import { GuestDrinkStackParamList } from '../../navigation/guest/GuestDrinkStackNavigator';
import ProductCard from '../../components/hompage/ProductCard';
import { Category, GroupedProduct } from '../../types/types';
import { loadProducts, setGroupedProducts } from '../../redux/slices/productSlice';
import { loadCategories } from '../../redux/slices/categorySlice';
import { groupProductsByCategory } from '../../utils/groupProducts';
import { formatCurrency } from '../../utils/formatCurrency';

type DrinkCategoryNavigationProp = NativeStackNavigationProp<
  GuestDrinkStackParamList,
  'DrinkCategoryScreen'
>;

const DrinkCategoryScreen = ({ navigation }: { navigation: DrinkCategoryNavigationProp }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionRefs = useRef<(View | null)[]>([]);
  const [categoryPositions, setCategoryPositions] = useState<number[]>([]);

  const { categories, loading: catLoading } = useSelector((state: RootState) => state.category);
  const { groupedProducts } = useSelector((state: RootState) => state.product);

  // 🛠 Load categories + products on mount
  useEffect(() => {
    dispatch(loadCategories());
    const fetchAndGroupProducts = async () => {
      try {
        const resultAction = await dispatch(loadProducts());
        if (loadProducts.fulfilled.match(resultAction)) {
          const products = resultAction.payload;
          const grouped = groupProductsByCategory(products);
          dispatch(setGroupedProducts(grouped));
        } else {
          console.error('❌ Failed to load products');
        }
      } catch (error) {
        console.error('❌ Error fetching products', error);
      }
    };
    fetchAndGroupProducts();
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const positions: number[] = [];
      sectionRefs.current.forEach((ref, index) => {
        ref?.measureLayout(
          scrollViewRef.current as any,
          (x, y) => {
            positions[index] = y;
            if (index === sectionRefs.current.length - 1) {
              setCategoryPositions(positions);
            }
          },
          () => { }
        );
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [groupedProducts]);

  const scrollToCategory = (index: number) => {
    setActiveTab(index);
    if (categoryPositions[index] !== undefined) {
      scrollViewRef.current?.scrollTo({ y: categoryPositions[index] - 10, animated: true });
    }
  };

  const filteredProducts = groupedProducts.map(cat => ({
    ...cat,
    drinks: cat.drinks.filter(drink =>
      drink.name.toLowerCase().includes(searchText.toLowerCase())
    ),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="🔍 Tìm đồ uống yêu thích..."
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {catLoading ? (
            <ActivityIndicator size="small" color="#D17842" />
          ) : (
            categories.map((cat, index) => (
              <TouchableOpacity
                key={cat._id}
                style={[styles.categoryItem, activeTab === index && styles.activeCategory]}
                onPress={() => scrollToCategory(index)}
              >
                <Image
                  source={{ uri: cat.icon }}
                  style={styles.categoryIcon}
                  resizeMode="cover"
                />
                <Text style={[styles.categoryText, activeTab === index && styles.activeCategoryText]}>
                  {cat.category}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {filteredProducts.map((cat, index) => (
          cat.drinks.length > 0 && (
            <View
              key={cat._id}
              ref={ref => { sectionRefs.current[index] = ref; }}
              style={styles.section}
            >
              <Text style={styles.categoryTitle}>{cat.category}</Text>
              <FlatList
                data={cat.drinks}
                keyExtractor={(drink) => drink._id}
                numColumns={2}
                scrollEnabled={false}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                renderItem={({ item: drink }) => (
                  <ProductCard
                    image={{ uri: drink.image }}
                    name={drink.name}
                    price={formatCurrency(drink.basePrice)}
                    onPress={() =>
                      navigation.navigate('DrinkDetailScreen', {
                        drink: {
                          id: drink._id,
                          name: drink.name,
                          image: drink.image,
                          description: drink.description,
                          basePrice: drink.basePrice,
                          sizeOptions: drink.sizeOptions, // [{ size: 'S', name: 'Small', multiplier: 1, volume: '250ml' }]
                          toppingOptions: drink.toppingOptions, // [{ _id, name, price, icon }]
                        },
                      })
                      
                    }
                  />
                )}
              />
            </View>
          )
        ))}
      </ScrollView>
    </View>
  );
};

const theme = {
  primary: '#D17842',
  background: '#ffffff',
  text: '#333',
  gray: '#ccc',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  searchContainer: { padding: 12, backgroundColor: '#fff' },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  tabContainer: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.gray,
  },
  tabScrollContent: { paddingHorizontal: 12 },
  categoryItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 12,
  },
  activeCategory: { backgroundColor: theme.primary },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: theme.text,
    textAlign: 'center',
  },
  activeCategoryText: { color: '#fff' },
  section: { padding: 16 },
  categoryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 12,
  },
});

export default DrinkCategoryScreen;
