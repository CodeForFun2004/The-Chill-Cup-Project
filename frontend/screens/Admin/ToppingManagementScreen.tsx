import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import apiInstance from '../../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RefreshControl } from 'react-native';

interface Topping {
  _id: string;
  name: string;
  price: number;
  icon: string;
  createdAt?: string;
  updatedAt?: string;
}

// API Service Functions
const toppingApiService = {
  async getAllToppings() {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await apiInstance.get('/toppings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching toppings:', error);
      throw error;
    }
  },

  async createTopping(toppingData: { name: string; price: number; icon: string }) {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await apiInstance.post('/toppings', toppingData, {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating topping:', error);
      throw error;
    }
  },

  async updateTopping(id: string, toppingData: { name: string; price: number; icon: string }) {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await apiInstance.put(`/toppings/${id}`, toppingData, {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating topping:', error);
      throw error;
    }
  },

  async deleteTopping(id: string) {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await apiInstance.delete(`/toppings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting topping:', error);
      throw error;
    }
  },
};

export default function ToppingManagementScreen() {
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [icon, setIcon] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load toppings on component mount
  useEffect(() => {
    loadToppings();
  }, []);

  const loadToppings = async () => {
    try {
      setLoading(true);
      const toppingsData = await toppingApiService.getAllToppings();
      setToppings(toppingsData);
    } catch (error: any) {
      if (error.response?.status === 401) {
        Alert.alert('Lỗi xác thực', 'Vui lòng đăng nhập lại');
      } else {
        Alert.alert('Lỗi', 'Không thể tải danh sách topping');
      }
      console.error('Error loading toppings:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTopping = async () => {
    if (!name.trim() || !price.trim() || !icon.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    const priceNumber = parseInt(price);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      Alert.alert('Lỗi', 'Giá phải là số dương');
      return;
    }

    try {
      setLoading(true);
      const newTopping = await toppingApiService.createTopping({
        name: name.trim(),
        price: priceNumber,
        icon: icon.trim(),
      });
      
      setToppings([...toppings, newTopping]);
      resetForm();
      Alert.alert('Thành công', 'Thêm topping thành công');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Không thể thêm topping';
      Alert.alert('Lỗi', errorMessage);
      console.error('Error adding topping:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEditTopping = (topping: Topping) => {
    setEditId(topping._id);
    setName(topping.name);
    setPrice(topping.price.toString());
    setIcon(topping.icon);
    setShowEditModal(true);
  };

  const updateTopping = async () => {
    if (!editId) return;

    if (!name.trim() || !price.trim() || !icon.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    const priceNumber = parseInt(price);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      Alert.alert('Lỗi', 'Giá phải là số dương');
      return;
    }

    try {
      setLoading(true);
      const updatedTopping = await toppingApiService.updateTopping(editId, {
        name: name.trim(),
        price: priceNumber,
        icon: icon.trim(),
      });

      setToppings(toppings.map((t) =>
        t._id === editId ? { ...t, ...updatedTopping } : t
      ));
      
      resetForm();
      setShowEditModal(false);
      Alert.alert('Thành công', 'Cập nhật topping thành công');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Không thể cập nhật topping';
      Alert.alert('Lỗi', errorMessage);
      console.error('Error updating topping:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    resetForm();
    setShowEditModal(false);
  };

  const confirmDeleteTopping = (id: string) => {
    setPendingDeleteId(id);
    setShowConfirmDelete(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!pendingDeleteId) return;

    try {
      setLoading(true);
      await toppingApiService.deleteTopping(pendingDeleteId);
      
      setToppings(toppings.filter((t) => t._id !== pendingDeleteId));
      Alert.alert('Thành công', 'Xoá topping thành công');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Không thể xoá topping';
      Alert.alert('Lỗi', errorMessage);
      console.error('Error deleting topping:', error);
    } finally {
      setLoading(false);
      setPendingDeleteId(null);
      setShowConfirmDelete(false);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setName('');
    setPrice('');
    setIcon('');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadToppings();
    setRefreshing(false);
  };

  // Common emoji suggestions for toppings
  const emojiSuggestions = ['⚫', '⚪', '🍓', '🍮', '🧀', '🍵', '🥥', '🍯', '🍊', '🍋'];

  if (loading && toppings.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      <Text style={styles.title}>Quản lý Topping</Text>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Tên topping *"
          value={name}
          onChangeText={setName}
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Giá (VNĐ) *"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Biểu tượng (emoji) *"
          value={icon}
          onChangeText={setIcon}
          editable={!loading}
        />
        
        {/* Emoji suggestions */}
        <View style={styles.emojiSuggestions}>
          <Text style={styles.suggestionLabel}>Gợi ý biểu tượng:</Text>
          <View style={styles.emojiRow}>
            {emojiSuggestions.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={styles.emojiButton}
                onPress={() => setIcon(emoji)}
                disabled={loading}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.addBtn, loading && styles.disabledBtn]}
          onPress={editId ? updateTopping : addTopping}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addBtnText}>
              {editId ? 'Cập nhật' : 'Thêm topping'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.subtitle}>Danh sách topping ({toppings.length})</Text>
        <TouchableOpacity onPress={onRefresh} disabled={loading}>
          <Text style={styles.refreshText}>🔄 Làm mới</Text>
        </TouchableOpacity>
      </View>

      {toppings.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Chưa có topping nào</Text>
          <Text style={styles.emptySubtext}>Thêm topping đầu tiên của bạn</Text>
        </View>
      ) : (
        toppings.map((topping) => (
          <View key={topping._id} style={styles.card}>
            <Text style={styles.icon}>{topping.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{topping.name}</Text>
              <Text style={styles.cardText}>
                Giá: {topping.price.toLocaleString()}đ
              </Text>
              {topping.createdAt && (
                <Text style={styles.cardDate}>
                  Tạo: {new Date(topping.createdAt).toLocaleDateString('vi-VN')}
                </Text>
              )}
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => startEditTopping(topping)}
                style={styles.editBtn}
                disabled={loading}
              >
                <Text style={styles.editText}>Sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => confirmDeleteTopping(topping._id)}
                style={styles.deleteBtn}
                disabled={loading}
              >
                <Text style={styles.deleteText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* Modal xác nhận xoá */}
      {showConfirmDelete && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>Bạn có chắc muốn xoá topping này?</Text>
            <Text style={styles.warningText}>
              Hành động này không thể hoàn tác và có thể ảnh hưởng đến các sản phẩm đang sử dụng topping này.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity 
                onPress={() => setShowConfirmDelete(false)} 
                style={styles.cancelBtn}
                disabled={loading}
              >
                <Text style={styles.cancelText}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleDeleteConfirmed} 
                style={styles.confirmBtn}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.confirmText}>Xoá</Text>
                )}
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
              placeholder="Tên topping *"
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder="Giá (VNĐ) *"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder="Biểu tượng (emoji) *"
              value={icon}
              onChangeText={setIcon}
              editable={!loading}
            />
            
            {/* Emoji suggestions in modal */}
            <View style={styles.emojiSuggestions}>
              <Text style={styles.suggestionLabel}>Gợi ý:</Text>
              <View style={styles.emojiRow}>
                {emojiSuggestions.map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.emojiButton}
                    onPress={() => setIcon(emoji)}
                    disabled={loading}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                onPress={cancelEdit} 
                style={styles.cancelBtn}
                disabled={loading}
              >
                <Text style={styles.cancelText}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={updateTopping} 
                style={styles.confirmBtn}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.confirmText}>Lưu</Text>
                )}
              </TouchableOpacity>
            </View>
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
    color: '#333',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  refreshText: {
    color: '#007AFF',
    fontSize: 14,
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
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  emojiSuggestions: {
    marginBottom: 12,
  },
  suggestionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emojiButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  emojiText: {
    fontSize: 18,
  },
  addBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledBtn: {
    backgroundColor: '#ccc',
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    fontSize: 28,
    marginRight: 12,
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#222',
    marginBottom: 4,
  },
  cardText: { 
    color: '#555', 
    fontSize: 14,
    marginBottom: 2,
  },
  cardDate: {
    color: '#999',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#007AFF',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#ccc',
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
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
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});