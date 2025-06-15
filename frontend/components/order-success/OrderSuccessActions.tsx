import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const OrderSuccessActions = () => {
  const navigation = useNavigation();

  const handleBackToHome = () => {
    const parentNav = navigation.getParent();
    parentNav?.navigate('CustomerHomeStack', {
      screen: 'CustomerHomeScreen',
    });
  };
  

  const handleTrackOrder = () => {
    const parentNav = navigation.getParent();
    parentNav?.navigate('CartStack', {
      screen: 'Cart',
    });
  };
  
  return (
    <View>
      <TouchableOpacity
        style={[styles.button, styles.outlineButton]}
        onPress={handleBackToHome}
      >
        <Text style={styles.outlineText}>← Back to Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handleTrackOrder}
      >
        <MaterialIcons name="local-shipping" size={20} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.primaryText}>Track Order</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OrderSuccessActions;

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  outlineButton: {
    backgroundColor: '#fff0f0',
  },
  outlineText: {
    color: '#e53935',
    fontWeight: 'bold',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#e53935',
  },
  primaryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
