import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const CheckoutHeader = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Checkout</Text>

      <View style={{ width: 24 }} /> 
    </View>
  );
};

export default CheckoutHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',  // 👈 Chỉnh icon lên trên
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 8,
    backgroundColor: '#F4F4F4',
  },
  backButton: {
    paddingLeft: 0,             // 👈 Nhích icon lên gần top hơn
    paddingRight: 20,
    marginLeft: -20
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
});
