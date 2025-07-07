import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useOrder } from "../../contexts/OrderContext";
import { useNavigation } from "@react-navigation/native";

export default function OrderInfoBar() {
  const { method, deliveryAddress, store } = useOrder();
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        navigation.navigate("DeliveryAddressBlock", {});
      }}
    >
      <Ionicons
        name={method === "delivery" ? "bicycle" : "storefront"}
        size={18}
        color="#10b981"
      />
      <Text style={styles.text}>
        {method === "delivery"
          ? deliveryAddress?.text || "Chọn địa chỉ giao hàng"
          : store?.name || "Chọn cửa hàng mang đi"}
      </Text>
      <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    margin: 12,
  },
  text: { marginLeft: 8, flex: 1, fontSize: 14 },
});
