import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const LoginBanner = () => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    setIsPressed(!isPressed);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>
      <Text style={styles.description}>
        Sử dụng app để tích điểm và đổi những ưu đãi chỉ dành riêng cho thành viên bạn nhé!
      </Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handlePress} style={styles.linkContainer}>
        <Text style={[styles.link, isPressed && styles.linkPressed]}>
          The Coffee House's Reward →
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginBanner;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginVertical: 10,
    elevation: 2,
    alignItems: 'center', // Center all elements inside the container
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 6,
    textAlign: 'center', // Center the title
  },
  description: {
    color: '#444',
    marginBottom: 10,
    fontSize: 14,
    textAlign: 'center', // Center the description
  },
  button: {
    backgroundColor: '#4AA366',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
    width: '80%', // Ensures the button doesn't span the whole screen
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  linkContainer: {
    marginTop: 10, // Adds space between the link and the button
  },
  link: {
    color: '#000',
    fontSize: 14,
    fontStyle: 'normal', // Removed underline
    textAlign: 'center', // Center the link
  },
  linkPressed: {
    fontWeight: 'bold', // Make the link bold when pressed
  },
});
