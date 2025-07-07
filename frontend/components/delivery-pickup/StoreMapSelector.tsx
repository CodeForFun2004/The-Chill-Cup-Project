import React, { useEffect, useState } from "react";
import { Modal, View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import * as Location from "expo-location";
import { useOrder } from "../../contexts/OrderContext";
import { STORES } from "../../data/stores";
// import MapView, { Marker } from "react-native-maps";

const { width, height } = Dimensions.get("window");

export default function StoreMapSelector({ visible, onClose }: { visible: boolean; onClose: () => void; }) {
  const { setStore } = useOrder();
  const [region, setRegion] = useState({
    latitude: 21.0285,
    longitude: 105.8542,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });
  const [selected, setSelected] = useState<any>(null);

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
    })();
  }, []);

  const handleSelect = () => {
    if (selected) {
      setStore(selected);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Chọn cửa hàng trên bản đồ</Text>

          {selected && (
            <View style={styles.detail}>
              <Text style={styles.name}>{selected.name}</Text>
              <Text style={styles.addr}>{selected.address}</Text>
              <TouchableOpacity style={styles.confirm} onPress={handleSelect}>
                <Text style={styles.confirmText}>Chọn cửa hàng này</Text>
              </TouchableOpacity>
            </View>
          )}

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
  container: { backgroundColor: "#fff", borderRadius: 16, padding: 12, width: width * 0.9, maxHeight: height * 0.85 },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  map: { width: "100%", height: 350, borderRadius: 12 },
  detail: { marginTop: 12 },
  name: { fontSize: 16, fontWeight: "700" },
  addr: { fontSize: 13, color: "#64748b" },
  confirm: { marginTop: 8, backgroundColor: "#10b981", padding: 10, borderRadius: 8, alignItems: "center" },
  confirmText: { color: "#fff", fontWeight: "700" },
  cancel: { textAlign: "center", marginTop: 10, color: "#64748b" },
});
