import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useOrder } from "../../contexts/OrderContext";

export default function AddressInputModal({ visible, onClose }: { visible: boolean; onClose: () => void; }) {
  const { setDeliveryAddress } = useOrder();
  const [input, setInput] = useState("");

  const handleSave = () => {
    if (!input.trim()) return;
    setDeliveryAddress({
      text: input.trim(),
      latitude: 0, // giả định, nếu bạn muốn gắn tọa độ từ GPS thì gắn vào
      longitude: 0,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Nhập địa chỉ giao hàng</Text>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Số nhà, đường, phường, quận..."
            style={styles.input}
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Lưu</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)" },
  modal: { backgroundColor: "#fff", borderRadius: 12, padding: 20, width: "80%" },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, padding: 10, marginBottom: 12 },
  saveBtn: { backgroundColor: "#10b981", padding: 12, borderRadius: 8, alignItems: "center" },
  saveText: { color: "#fff", fontWeight: "700" },
  cancelText: { textAlign: "center", color: "#64748b", marginTop: 10 },
});
