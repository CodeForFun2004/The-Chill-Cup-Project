import React from 'react';
import { View, Image, StyleSheet, Dimensions, ScrollView } from 'react-native';

const { width } = Dimensions.get('window');
const horizontalPadding = 12;
const bannerWidth = width - horizontalPadding * 2;

const bannerImages = [
  require('../../assets/images/promo-banner/promo-banner1.png'),
  require('../../assets/images/promo-banner/promo-banner2.png'),
  require('../../assets/images/promo-banner/promo-banner3.png'),
  require('../../assets/images/promo-banner/promo-banner4.png'),
];

const PromoBanner = () => {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
      >
        {bannerImages.map((imgSrc, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image
              source={imgSrc}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default PromoBanner;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    marginLeft: -horizontalPadding, // 👈 Tràn sang trái
  },
  scrollView: {
    paddingLeft: horizontalPadding, // 👈 Đảm bảo ảnh không dính sát mép trái
  },
  scrollContainer: {
    paddingRight: 0,
  },
  imageContainer: {
    width: bannerWidth,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  bannerImage: {
    width: '100%',
    height: 180,
  },
});
