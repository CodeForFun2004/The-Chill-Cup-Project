// Header.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, Entypo } from '@expo/vector-icons';

const Header = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Chào bạn mới 👋</Text>
      <View style={styles.icons}>
        <TouchableOpacity style={styles.iconWrapper}>
          <Entypo name="ticket" size={18} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconWrapper}>
          <Feather name="bell" size={18} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
  },
  icons: {
    flexDirection: 'row',
  },
  iconWrapper: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    marginLeft: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
});
