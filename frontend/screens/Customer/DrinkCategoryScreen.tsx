import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, FlatList,
  TextInput, StyleSheet, Image
} from 'react-native';
import { drinkData } from '../../data/drinks';
import ProductCard from '../../components/hompage/ProductCard';

// Navigation types
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GuestDrinkStackParamList } from '../../navigation/guest/GuestDrinkStackNavigator';

// Combine Stack + Tab
type DrinkCategoryNavigationProp = NativeStackNavigationProp<
  GuestDrinkStackParamList,
  'DrinkCategoryScreen'
>;

const DrinkCategoryScreen = ({ navigation }: { navigation: DrinkCategoryNavigationProp }) => {
  const [searchText, setSearchText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionRefs = useRef<(View | null)[]>([]);
  const [categoryPositions, setCategoryPositions] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);

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
  }, [searchText]);

  const scrollToCategory = (index: number) => {
    setActiveTab(index);
    if (categoryPositions[index] !== undefined) {
      scrollViewRef.current?.scrollTo({ y: categoryPositions[index] - 10, animated: true });
    }
  };

  // Modified filteredData to preserve all categories, even if drinks are filtered out
  const filteredData = drinkData.map(category => ({
    ...category,
    drinks: category.drinks.filter(drink =>
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

      {/* Category Tabs with Icons */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {filteredData.map((cat, index) => (
            <TouchableOpacity
              key={cat.category}
              style={[styles.categoryItem, activeTab === index && styles.activeCategory]}
              onPress={() => scrollToCategory(index)}
            >
              <Image
                source={cat.icon} // Icon is preserved from original drinkData
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
        {filteredData.map((cat, index) => (
          cat.drinks.length > 0 && ( // Only render sections with drinks
            <View
              key={cat.category}
              ref={ref => { sectionRefs.current[index] = ref; }}
              style={styles.section}
            >
              <Text style={styles.categoryTitle}>{cat.category}</Text>
              <FlatList
                data={cat.drinks}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                scrollEnabled={false}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                renderItem={({ item }) => (
                  <ProductCard
                    key={item.id}
                    image={item.image}
                    name={item.name}
                    price={item.price}
                    onPress={() => {
                      navigation.navigate('DrinkDetailScreen', {
                        drink: item 
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
  green: '#4CAF50',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  searchContainer: {
    padding: 12,
    backgroundColor: '#fff',
  },
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
  tabScrollContent: {
    paddingHorizontal: 12,
  },
  categoryItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 12,
  },
  activeCategory: {
    backgroundColor: theme.primary,
  },
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
  activeCategoryText: {
    color: '#fff',
  },
  section: { padding: 16 },
  categoryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 12,
  },
});

export default DrinkCategoryScreen;