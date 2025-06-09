import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

export const PromoCodeInput = () => {
    return (
      <View style={styles.promoContainer}>
        <TextInput placeholder="Promo code" style={styles.promoInput} />
        <TouchableOpacity style={styles.promoButton}>
          <Text style={styles.promoButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 12,
      marginBottom: 12,
      alignItems: 'center',
      elevation: 2,
    },
    image: {
      width: 64,
      height: 64,
      borderRadius: 8,
      marginRight: 12,
    },
    info: {
      flex: 1,
    },
    name: {
      fontWeight: 'bold',
      fontSize: 16,
    },
    brand: {
      fontSize: 13,
      color: '#999',
    },
    price: {
      fontSize: 15,
      marginTop: 4,
    },
    quantityBox: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    qtyButton: {
      backgroundColor: '#EDEDED',
      padding: 6,
      borderRadius: 6,
    },
    qtyText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    qtyCount: {
      marginHorizontal: 8,
      fontSize: 16,
    },
    promoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      padding: 12,
      borderRadius: 16,
      marginBottom: 16,
      elevation: 2,
    },
    promoInput: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderColor: '#ccc',
      borderWidth: 1,
      marginRight: 10,
    },
    promoButton: {
      backgroundColor: '#4AA366',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    promoButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    summaryContainer: {
      backgroundColor: '#fff',
      padding: 16,
      borderRadius: 16,
      elevation: 2,
      marginBottom: 16,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    checkoutButton: {
      backgroundColor: '#4AA366',
      paddingVertical: 16,
      borderRadius: 24,
      alignItems: 'center',
      marginBottom: 20,
    },
    checkoutText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
  