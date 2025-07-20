import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useOrder } from "../../contexts/OrderContext";

export default function DeliveryAddressBlock() {
  const { deliveryAddress, setDeliveryAddress } = useOrder();
  const [loading, setLoading] = useState(false);

  const handleDetect = async () => {
    setLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Không có quyền truy cập vị trí");
      setLoading(false);
      return;
    }
    let loc = await Location.getCurrentPositionAsync({});
    let addr = await Location.reverseGeocodeAsync(loc.coords);
    const first = addr[0];
  
    // GHÉP CHUỖI AN TOÀN
    const text = [first.street, first.district, first.city]
      .filter(Boolean)
      .join(", ");
  
    setDeliveryAddress({
      text,
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
  
    setLoading(false);
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

      <TouchableOpacity
        style={styles.addressBlock}
        onPress={handleDetect}
        disabled={loading}
      >
        <Ionicons name="location" size={20} color="#10b981" style={styles.icon} />
        <View style={{ flex: 1 }}>
          <Text style={styles.addressText}>
            {deliveryAddress?.text
              ? deliveryAddress.text
              : loading
              ? "Đang xác định vị trí..."
              : "Nhấn để tự động xác định vị trí của bạn"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
      </TouchableOpacity>

      {deliveryAddress?.latitude && (
        <TouchableOpacity style={styles.openMapBtn} onPress={handleOpenMap}>
          <Ionicons name="navigate" size={18} color="#6366f1" />
          <Text style={styles.openMapText}>Xem trên Google Maps</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  addressBlock: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  icon: {
    marginRight: 10,
  },
  addressText: {
    fontSize: 14,
    color: "#0f172a",
  },
  openMapBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 6,
  },
  openMapText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6366f1",
  },
});
