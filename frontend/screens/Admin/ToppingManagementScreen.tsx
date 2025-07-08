import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const availableToppings = [
  { id: '1', name: 'Trân châu đen', price: 5000, icon: '⚫' },
  { id: '2', name: 'Thạch trái cây', price: 7000, icon: '🍓' },
  { id: '3', name: 'Pudding trứng', price: 6000, icon: '🍮' },
  { id: '4', name: 'Kem cheese', price: 7000, icon: '🧀' },
  { id: '5', name: 'Thạch matcha', price: 6000, icon: '🍵' },
  { id: '6', name: 'Trân châu trắng', price: 6000, icon: '⚪' },
];

export default function ToppingManagementScreen() {
  const [toppings, setToppings] = useState(availableToppings);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [icon, setIcon] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeText, setNoticeText] = useState('');

  const addTopping = () => {
    if (!name || !price || !icon) return;
    setToppings([
      ...toppings,
      {
        id: Date.now().toString(),
        name,
        price: parseInt(price),
        icon,
      },
    ]);
    resetForm();
  };

  const startEditTopping = (topping: any) => {
    setEditId(topping.id);
    setName(topping.name);
    setPrice(topping.price.toString());
    setIcon(topping.icon);
    setShowEditModal(true);
  };

  const updateTopping = () => {
    if (!editId) return;
    setToppings(
      toppings.map((t) =>
        t.id === editId ? { ...t, name, price: parseInt(price), icon } : t
      )
    );
    resetForm();
    setShowEditModal(false);
    showNotice('Đã lưu thay đổi topping');
  };

  const cancelEdit = () => {
    resetForm();
    setShowEditModal(false);
    showNotice('Đã hủy chỉnh sửa topping');
  };

  const confirmDeleteTopping = (id: string) => {
    setPendingDeleteId(id);
    setShowConfirmDelete(true);
  };

  const handleDeleteConfirmed = () => {
    if (pendingDeleteId) {
      removeTopping(pendingDeleteId);
      showNotice('Đã xoá topping');
    }
    setPendingDeleteId(null);
    setShowConfirmDelete(false);
  };

  const removeTopping = (id: string) => {
    setToppings(toppings.filter((t) => t.id !== id));
  };

  const resetForm = () => {
    setEditId(null);
    setName('');
    setPrice('');
    setIcon('');
  };

  const showNotice = (msg: string) => {
    setNoticeText(msg);
    setShowNoticeModal(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={styles.title}>Quản lý Topping</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Tên topping"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Giá"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Biểu tượng (emoji)"
          value={icon}
          onChangeText={setIcon}
        />
        <TouchableOpacity
          style={styles.addBtn}
          onPress={editId ? updateTopping : addTopping}
        >
          <Text style={styles.addBtnText}>
            {editId ? 'Cập nhật' : 'Thêm topping'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Danh sách topping</Text>
      {toppings.map((topping) => (
        <View key={topping.id} style={styles.card}>
          <Text style={styles.icon}>{topping.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{topping.name}</Text>
            <Text style={styles.cardText}>
              Giá: {topping.price.toLocaleString()}đ
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => startEditTopping(topping)}
              style={styles.editBtn}
            >
              <Text style={styles.editText}>Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => confirmDeleteTopping(topping.id)}
              style={styles.deleteBtn}
            >
              <Text style={styles.deleteText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Modal xác nhận xoá */}
      {showConfirmDelete && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>Bạn có chắc muốn xoá topping này?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowConfirmDelete(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteConfirmed} style={styles.confirmBtn}>
                <Text style={styles.confirmText}>Xoá</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Modal chỉnh sửa topping */}
      {showEditModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Chỉnh sửa Topping</Text>
            <TextInput
              style={styles.input}
              placeholder="Tên topping"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Giá"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Biểu tượng (emoji)"
              value={icon}
              onChangeText={setIcon}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={cancelEdit} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={updateTopping} style={styles.confirmBtn}>
                <Text style={styles.confirmText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Modal thông báo */}
      {showNoticeModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.noticeBox}>
            <Text style={styles.modalText}>{noticeText}</Text>
            <TouchableOpacity onPress={() => setShowNoticeModal(false)} style={styles.confirmBtn}>
              <Text style={styles.confirmText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 16,
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
    color: '#333',
  },
  form: {
    marginBottom: 16,
    backgroundColor: '#f5f6fa',
    borderRadius: 10,
    padding: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  addBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  icon: {
    fontSize: 28,
    marginRight: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  cardText: { color: '#555', fontSize: 14 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  editBtn: {
    backgroundColor: '#e3f0ff',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginRight: 8,
  },
  editText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  deleteBtn: {
    backgroundColor: '#ffeaea',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  deleteText: {
    color: '#ff3b30',
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 100,
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '100%',
  },
  noticeBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#ccc',
    borderRadius: 8,
  },
  cancelText: {
    color: '#333',
    fontWeight: 'bold',
  },
  confirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
