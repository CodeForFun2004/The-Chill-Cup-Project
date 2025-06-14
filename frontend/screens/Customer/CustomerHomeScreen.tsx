import React from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import Header from "../../components/hompage/Header";
import LoginBanner from "../../components/hompage/LoginBanner";
import PromoBanner from "../../components/hompage/PromoBanner";
import CategoryCardBlock from "../../components/hompage/search-card/CategoryCardBlock";
import ProductSection from "../../components/hompage/ProductSection";
import AfterLoginBanner from "../../components/hompage/AfterLoginBanner";

const CustomerHomeScreen = () => {
  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AfterLoginBanner/>
        <PromoBanner />
        <CategoryCardBlock />

        {/* MUST TRY */}
        <ProductSection
          title="Món Mới Phải Thử"
          products={[
            {
              image: require("../../assets/images/search-box/matcha-latte.png"),
              name: "Matcha Đá Xay",
              price: "65,000đ",
            },
            {
              image: require("../../assets/images/search-box/matcha-latte.png"),
              name: "Matcha Latte",
              price: "59,000đ",
            },
            {
              image: require("../../assets/images/search-box/matcha-latte.png"),
              name: "Matcha Đào",
              price: "55,000đ",
            },
          ]}
        />
        
        {/* MATCHA */}
        <ProductSection
          title="Matcha"
          products={[
            {
              image: require("../../assets/images/matcha/matcha-latte.png"),
              name: "Matcha Latte",
              price: "65,000đ",
            },
            {
              image: require("../../assets/images/matcha/matcha-sua-dua.png"),
              name: "Matcha Sữa Dừa",
              price: "59,000đ",
            },
            {
              image: require("../../assets/images/matcha/matcha-yuzu.png"),
              name: "Matcha Yuzu",
              price: "55,000đ",
            },
            {
              image: require("../../assets/images/matcha/matcha-tran-chau-duong-den.png"),
              name: "Matcha Trân Châu Đường Đen",
              price: "65,000đ",
            },
            {
              image: require("../../assets/images/matcha/matcha-xoai.png"),
              name: "Matcha Xoài",
              price: "59,000đ",
            },
            {
              image: require("../../assets/images/matcha/matcha-tinh-khiet.png"),
              name: "Matcha Tinh Khiết",
              price: "55,000đ",
            },
          ]}
        />


        {/* COFFEE */}
        <ProductSection
          title="Coffee"
          products={[
            {
              image: require("../../assets/images/coffee/dirty chai latte.png"),
              name: "Dirty Chai Latte",
              price: "65,000đ",
            },
            {
              image: require("../../assets/images/coffee/latte-caramel.png"),
              name: "Latte Caremel",
              price: "59,000đ",
            },
            {
              image: require("../../assets/images/coffee/bac-xiu.png"),
              name: "Bạc xĩu",
              price: "55,000đ",
            },
            {
              image: require("../../assets/images/coffee/cafe-trung.png"),
              name: "Cafe trứng",
              price: "65,000đ",
            },
            {
              image: require("../../assets/images/coffee/cafe-muoi.png"),
              name: "Cafe muối",
              price: "59,000đ",
            },
            {
              image: require("../../assets/images/coffee/capuchino.png"),
              name: "Capuchino",
              price: "55,000đ",
            },
          ]}
        />


        {/* BUBBLE TEA */}
        <ProductSection
          title="Trà Sữa"
          products={[
            {
              image: require("../../assets/images/bubble-tea/tra-sua-truyen-thong.png"),
              name: "Trà Sữa Truyền Thống",
              price: "65,000đ",
            },
            {
              image: require("../../assets/images/bubble-tea/tra-sua-tran-chau-duong-den.png"),
              name: "Trà Sữa Trân Châu Đường Đen",
              price: "59,000đ",
            },
            {
              image: require("../../assets/images/bubble-tea/hong-tra-sua-tran-chau.png"),
              name: "Hồng Trà Sữa Trân Châu",
              price: "55,000đ",
            },
            {
              image: require("../../assets/images/bubble-tea/tra-sua-oolong-kem-trung-nuong.png"),
              name: "Trà Sữa Oolong Kem Trứng Nướng",
              price: "65,000đ",
            },
            {
              image: require("../../assets/images/bubble-tea/tra-sua-thai-do.png"),
              name: "Trà Sữa Thái Đỏ",
              price: "59,000đ",
            },
            {
              image: require("../../assets/images/bubble-tea/tra-sua-kem-cheese.png"),
              name: "Trà Sữa Kem Cheese",
              price: "55,000đ",
            },
          ]}
        />


        {/* FRUIT TEA */}
        <ProductSection
          title="Trà Trái Cây"
          products={[
            {
              image: require("../../assets/images/fruit-tea/tra-dao-cam-sa.png"),
              name: "Trà Đào Cam Sả",
              price: "65,000đ",
            },
            {
              image: require("../../assets/images/fruit-tea/tra-tac.png"),
              name: "Trà Tắc",
              price: "59,000đ",
            },
            {
              image: require("../../assets/images/fruit-tea/tra-vai.png"),
              name: "Trà Vải",
              price: "55,000đ",
            },
            {
              image: require("../../assets/images/fruit-tea/tra-dua-luoi.png"),
              name: "Trà Dưa Lưới",
              price: "65,000đ",
            },
            {
              image: require("../../assets/images/fruit-tea/tra-mang-cau.png"),
              name: "Trà Mãng Cầu",
              price: "59,000đ",
            },
            {
              image: require("../../assets/images/fruit-tea/tra-chanh-gia-tay.png"),
              name: "Trà Chanh Giã Tay",
              price: "55,000đ",
            },
          ]}
        />


        {/* HOT DRINKS */}
        <ProductSection
          title="Món Nóng"
          products={[
            {
              image: require("../../assets/images/hot-drink/americano-nong.png"),
              name: "Americano Nóng",
              price: "65,000đ",
            },
            {
              image: require("../../assets/images/hot-drink/espresso-nong.png"),
              name: "Espresso Nóng",
              price: "59,000đ",
            },
            {
              image: require("../../assets/images/hot-drink/cacao-nong.png"),
              name: "Cacao Nóng",
              price: "55,000đ",
            },
            {
              image: require("../../assets/images/hot-drink/cafe-den-nong.png"),
              name: "Cafe Đen Nóng",
              price: "65,000đ",
            },
            {
              image: require("../../assets/images/hot-drink/cafe-sua-nong.png"),
              name: "Cafe Sữa Nóng",
              price: "59,000đ",
            },
            {
              image: require("../../assets/images/hot-drink/bac-xiu-nong.png"),
              name: "Bạc Xĩu Nóng",
              price: "55,000đ",
            },
          ]}
        />
         <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

export default CustomerHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  scrollContent: {
    paddingBottom: 16,
  },
});
