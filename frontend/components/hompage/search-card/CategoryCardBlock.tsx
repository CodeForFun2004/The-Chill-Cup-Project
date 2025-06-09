import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import SearchBar from './SearchBar';
import CategoryScroll from './CategoryScroll';
import PageIndicator from './PageIndicator';

const CategoryCardBlock = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0); // Gán kiểu number cho activeIndex

  const handlePageChange = (index: number) => {  // Gán kiểu number cho tham số index
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <SearchBar />
      <CategoryScroll activeIndex={activeIndex} />
      <PageIndicator total={6} active={activeIndex} onChange={handlePageChange} />
    </View>
  );
};

export default CategoryCardBlock;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: 10,
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
});
