import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Linking } from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useOrder } from "../../contexts/OrderContext";

export default function DeliveryAddressBlock() {
  const { deliveryAddress, setDeliveryAddress } = useOrder();
  const [detail, setDetail] = useState("");

  const handleDetect = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Không có quyền truy cập vị trí");
      return;
    }
    let loc = await Location.getCurrentPositionAsync({});
    let addr = await Location.reverseGeocodeAsync(loc.coords);
    const first = addr[0];
    setDeliveryAddress({
      text: `${detail} - ${first.street || ""}, ${first.district || ""}, ${first.city || ""}`,
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
  };

  const handleOpenMap = () => {
    if (deliveryAddress?.latitude) {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${deliveryAddress.latitude},${deliveryAddress.longitude}`
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Địa chỉ giao hàng</Text>
      <TextInput
        placeholder="Nhập số nhà, tên building"
        style={styles.input}
        value={detail}
        onChangeText={setDetail}
      />
      <TouchableOpacity style={styles.btn} onPress={handleDetect}>
        <Ionicons name="locate" size={18} color="#10b981" />
        <Text style={styles.btnText}>Xác định vị trí</Text>
      </TouchableOpacity>

      {deliveryAddress?.latitude && (
        <TouchableOpacity style={styles.btn} onPress={handleOpenMap}>
          <Ionicons name="navigate" size={18} color="#6366f1" />
          <Text style={styles.btnText}>Xem trên Google Maps</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.address}>Kết quả: {deliveryAddress?.text || "Chưa có"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, padding: 10, marginBottom: 10 },
  btn: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 6 },
  btnText: { fontSize: 13, fontWeight: "600" },
  address: { marginTop: 10, fontSize: 14, color: "#64748b" },
});
