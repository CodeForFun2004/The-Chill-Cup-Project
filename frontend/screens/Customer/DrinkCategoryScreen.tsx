import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, FlatList,
  TextInput, StyleSheet, Image, ActivityIndicator
} from 'react-native';
import ProductCard from '../../components/hompage/ProductCard';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GuestDrinkStackParamList } from '../../navigation/guest/GuestDrinkStackNavigator';
import { SizeOption, ToppingOption } from '../../navigation/CustomerDrinkStackNavigator';

// Navigation type
type DrinkCategoryNavigationProp = NativeStackNavigationProp<
  GuestDrinkStackParamList,
  'DrinkCategoryScreen'
>;

type Category = {
  _id: string;
  category: string;
  icon: string;
};

type Product = {
  _id: string;
  name: string;
  basePrice: number;
  image: string;
  sizes: SizeOption[];
  toppingOptions: ToppingOption[];
  categoryId: string[];
};

const DrinkCategoryScreen = ({ navigation }: { navigation: DrinkCategoryNavigationProp }) => {
  const [searchText, setSearchText] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sizes, setSizes] = useState<SizeOption[]>([]);
  const [loading, setLoading] = useState(true);

  const scrollViewRef = useRef<ScrollView>(null);
  const sectionRefs = useRef<(View | null)[]>([]);
  const [categoryPositions, setCategoryPositions] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes, sizeRes] = await Promise.all([
          fetch(`http://192.168.11.108:8080/api/categories`),
          fetch(`http://192.168.11.108:8080/api/products`),
          fetch(`http://192.168.11.108:8080/api/sizes`),
        ]);
        const [catData, prodData, sizeData] = await Promise.all([
          catRes.json(), prodRes.json(), sizeRes.json()
        ]);
        setCategories(catData);
        setProducts(prodData);
        setSizes(sizeData);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
  }, [searchText, categories, products]);

  const scrollToCategory = (index: number) => {
    setActiveTab(index);
    if (categoryPositions[index] !== undefined) {
      scrollViewRef.current?.scrollTo({ y: categoryPositions[index] - 10, animated: true });
    }
  };

  // Group product theo category
  const groupedData = categories.map(cat => ({
    ...cat,
    drinks: products.filter(p =>
      p.categoryId.some((c: any) => c._id === cat._id) &&
      p.name.toLowerCase().includes(searchText.toLowerCase())
    ),
  }));

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#D17842" />
      </View>
    );
  }

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

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
          {groupedData.map((cat, index) => (
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
          ))}
        </ScrollView>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {groupedData.map((cat, index) => (
          cat.drinks.length > 0 && (
            <View
              key={cat._id}
              ref={ref => { sectionRefs.current[index] = ref; }}
              style={styles.section}
            >
              <Text style={styles.categoryTitle}>{cat.category}</Text>
              <FlatList
                data={cat.drinks}
                keyExtractor={item => item._id}
                numColumns={2}
                scrollEnabled={false}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                renderItem={({ item }) => (
                  <ProductCard
                    key={item._id}
                    image={{ uri: item.image }}
                    name={item.name}
                    price={`${item.basePrice.toLocaleString()}₫`}
                    onPress={() => {
                      navigation.navigate('DrinkDetailScreen', {
                        drink: {
                          id: item._id,
                          name: item.name,
                          image: item.image,
                          basePrice: Number(item.basePrice),
                          sizes: sizes,
                          toppingOptions: item.toppingOptions ?? [],
                        },
                      });
                    }}
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
  categoryIcon: { width: 50, height: 50, borderRadius: 25, marginBottom: 4 },
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
