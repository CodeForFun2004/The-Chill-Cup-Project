import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { STORES } from "../../data/stores";
import { useOrder } from "../../contexts/OrderContext";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function StoreSelectorModal({ visible, onClose }: Props) {
  const { setStore } = useOrder();

  const handleSelectStore = (store: any) => {
    setStore(store);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Chọn cửa hàng</Text>
          <FlatList
            data={STORES}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.storeItem}
                onPress={() => handleSelectStore(item)}
              >
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.address}>{item.address}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  storeItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  name: { fontSize: 16, fontWeight: "600" },
  address: { fontSize: 13, color: "#64748b" },
  closeBtn: { marginTop: 20, alignItems: "center" },
  closeText: { fontSize: 15, color: "#6366f1" },
});
