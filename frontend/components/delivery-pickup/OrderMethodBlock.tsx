import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useOrder } from "../../contexts/OrderContext";

export default function OrderMethodBlock() {
  const { method, setMethod, setStore, setDeliveryAddress } = useOrder();

  const handleSelect = (newMethod: "delivery" | "pickup") => {
    if (newMethod === "delivery") {
      setStore(null);
    } else {
      setDeliveryAddress(null);
    }
    setMethod(newMethod);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bạn muốn đặt hàng như thế nào?</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.methodBtn, method === "delivery" && styles.active]}
          onPress={() => handleSelect("delivery")}
        >
          <Ionicons name="bicycle" size={18} color="#10b981" />
          <Text style={styles.methodText}>Giao hàng</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.methodBtn, method === "pickup" && styles.active]}
          onPress={() => handleSelect("pickup")}
        >
          <Ionicons name="storefront-outline" size={18} color="#6366f1" />
          <Text style={styles.methodText}>Mang đi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 16 },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  row: { flexDirection: "row", gap: 12 },
  methodBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  active: { borderColor: "#10b981", backgroundColor: "#dcfce7" },
  methodText: { fontSize: 14, fontWeight: "600" },
});
