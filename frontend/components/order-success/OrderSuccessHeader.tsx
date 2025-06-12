import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const OrderSuccessHeader = () => (
  <View style={styles.container}>
    <MaterialIcons name="check-circle" size={72} color="#4CAF50" />
    <Text style={styles.title}>Order Confirmed!</Text>
    <Text style={styles.subtitle}>Thank you for your order! Your food is on its way.</Text>
  </View>
);

export default OrderSuccessHeader;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
  },
  subtitle: {
    color: '#555',
    marginTop: 4,
    textAlign: 'center',
  },
});
