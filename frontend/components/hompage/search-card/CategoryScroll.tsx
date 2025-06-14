import React, { useRef, useEffect } from 'react';
import { ScrollView, View, Text, Image, StyleSheet } from 'react-native';

const categories = [
  { label: 'Món Mới', image: require('../../../assets/images/search-box/new.png') },
  { label: 'Matcha', image: require('../../../assets/images/search-box/matcha-latte.png') },
  { label: 'Cà Phê', image: require('../../../assets/images/search-box/coffee.png') },
  { label: 'Trà Sữa', image: require('../../../assets/images/search-box/tra-sua.png') },
  { label: 'Trà Trái Cây', image: require('../../../assets/images/search-box/trà-đào.png') },
  { label: 'Món Nóng', image: require('../../../assets/images/search-box/hot-drink.png') },
];

interface CategoryScrollProps {
  activeIndex: number;
}

const CategoryScroll: React.FC<CategoryScrollProps> = ({ activeIndex }) => {
  const scrollViewRef = useRef<ScrollView | null>(null); // Gán kiểu ScrollView hoặc null

  useEffect(() => {
    if (scrollViewRef.current && categories[activeIndex]) {
      const xOffset = 100 * activeIndex; // Assuming each category has width 100
      scrollViewRef.current.scrollTo({ x: xOffset, animated: true });
    }
  }, [activeIndex]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} ref={scrollViewRef}>
      {categories.map((cat, index) => (
        <View key={index} style={styles.item}>
          <Image source={cat.image} style={styles.image} />
          <Text style={styles.label}>{cat.label}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  item: {
    alignItems: 'center',
    marginRight: 16,
  },
  image: {
    width: 60,
    height: 60,
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
  },
});

export default CategoryScroll;
