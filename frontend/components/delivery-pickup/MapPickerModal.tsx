import React, { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
// import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useOrder } from "../../contexts/OrderContext";

const { width, height } = Dimensions.get("window");

export default function MapPickerModal({ visible, onClose }: { visible: boolean; onClose: () => void; }) {
  const { setDeliveryAddress } = useOrder();
  const [region, setRegion] = useState({
    latitude: 21.0285,
    longitude: 105.8542,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const [addressText, setAddressText] = useState("");

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      let loc = await Location.getCurrentPositionAsync({});
      setRegion({
        ...region,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      fetchAddress(loc.coords.latitude, loc.coords.longitude);
    })();
  }, []);

  const fetchAddress = async (lat: number, lng: number) => {
    let res = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    const first = res[0];
    setAddressText(`${first.name || ""} ${first.street || ""}, ${first.district || ""}, ${first.city || ""}`);
  };

  const handleRegionChange = (reg: any) => {
    setRegion(reg);
    fetchAddress(reg.latitude, reg.longitude);
  };

  const handleConfirm = () => {
    setDeliveryAddress({
      text: addressText,
      latitude: region.latitude,
      longitude: region.longitude,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.label}>Chọn vị trí giao hàng</Text>
          <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={handleRegionChange}
          >
            <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
          </MapView>
          <Text style={styles.address}>{addressText || "Đang lấy địa chỉ..."}</Text>
          <TouchableOpacity style={styles.confirm} onPress={handleConfirm}>
            <Text style={styles.confirmText}>Xác nhận vị trí</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancel}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" },
  container: { backgroundColor: "#fff", borderRadius: 16, padding: 12, width: width * 0.9, maxHeight: height * 0.8 },
  label: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  map: { width: "100%", height: 300, borderRadius: 12 },
  address: { marginTop: 10, fontSize: 14, fontWeight: "500" },
  confirm: { marginTop: 14, backgroundColor: "#10b981", padding: 12, borderRadius: 8, alignItems: "center" },
  confirmText: { color: "#fff", fontWeight: "700" },
  cancel: { textAlign: "center", marginTop: 8, color: "#64748b" },
});
