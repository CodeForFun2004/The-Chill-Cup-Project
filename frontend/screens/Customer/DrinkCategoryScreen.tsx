import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, FlatList,
  TextInput, StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { drinkData } from '../../data/drinks';
import ProductCard from '../../components/hompage/ProductCard';

// Navigation types
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';

import { DrinkStackParamList } from '../../navigation/DrinkStackNavigator';
import { CustomerTabParamList } from '../../navigation/CustomerNavigator';
import { GuestDrinkStackParamList } from '../../navigation/GuestDrinkStackNavigator';

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
      console.log("🚀 navigation state:", JSON.stringify(navigation.getState(), null, 2));
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

  const filteredData = drinkData
    .map(category => ({
      ...category,
      drinks: category.drinks.filter(drink =>
        drink.name.toLowerCase().includes(searchText.toLowerCase())
      ),
    }))
    .filter(category => category.drinks.length > 0);

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

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {filteredData.map((cat, index) => (
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
                    console.log('➡️ Navigating to DrinkDetailScreen with:', item);
                    console.log('🧭 Navigation state:', JSON.stringify(navigation.getState(), null, 2));
              
                    navigation.navigate('DrinkDetailScreen', {
                      drink: item 
                    });
                  }}
                />
              )}
            />
          </View>
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
  section: { padding: 16 },
  categoryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 12,
  },
});

export default DrinkCategoryScreen;
