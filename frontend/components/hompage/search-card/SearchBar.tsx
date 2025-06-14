// SearchBar.js
import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, AntDesign } from '@expo/vector-icons';

const SearchBar = () => {
  return (
    <View style={styles.searchContainer}>
      <Feather name="search" size={20} color="#aaa" />
      <TextInput style={styles.input} placeholder="Tìm kiếm" />
      <TouchableOpacity>
        <AntDesign name="hearto" size={20} color="#4AA366" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F3F3',
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    padding: 10,
  },
});

export default SearchBar;
