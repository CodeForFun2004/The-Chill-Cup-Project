import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TextInput,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import type { AdminStoreStackParamList } from '../../navigation/admin/AdminStoreNavigator';
import { API_BASE_URL } from '../../services/api';

type ManageStoreNavigationProp = StackNavigationProp<AdminStoreStackParamList, 'ManageStores'>;

// Updated interface to match API response
export interface Store {
  _id: string;
  name: string;
  address: string;
  contact: string;
  openHours: string;
  isActive: boolean;
  mapUrl: string;
  image: string;
  latitude: number;
  longitude: number;
  staff?: {
    _id: string;
    fullname: string;
    staffId: string;
    phone: string;
  };
}

const ManageStore: React.FC = () => {
  const navigation = useNavigation<ManageStoreNavigationProp>();
  
  const [stores, setStores] = useState<Store[]>([]);
  const [form, setForm] = useState<Partial<Store & { staffId: string }>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [openTime, setOpenTime] = useState<Date>(new Date());
  const [closeTime, setCloseTime] = useState<Date>(new Date());
  const [showOpenPicker, setShowOpenPicker] = useState(false);
  const [showClosePicker, setShowClosePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Fetch all stores from API
  const fetchStores = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`${API_BASE_URL}/stores`);
      if (response.ok) {
        const data = await response.json();
        setStores(data);
      } else {
        Alert.alert('Error', 'Failed to fetch stores');
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      Alert.alert('Error', 'Network error while fetching stores');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setSelectedImage(result.assets[0]);
      setForm({ ...form, image: result.assets[0].uri });
    }
  };

  const createFormData = () => {
    const formData = new FormData();
    
    formData.append('name', form.name || '');
    formData.append('address', form.address || '');
    formData.append('contact', form.contact || '');
    formData.append('openHours', `${formatTime(openTime)} - ${formatTime(closeTime)}`);
    formData.append('mapUrl', form.mapUrl || '');
    formData.append('staffId', form.staffId || '');
    formData.append('latitude', form.latitude?.toString() || '0');
    formData.append('longitude', form.longitude?.toString() || '0');

    if (selectedImage) {
      formData.append('image', {
        uri: selectedImage.uri,
        type: selectedImage.type || 'image/jpeg',
        name: selectedImage.fileName || 'store-image.jpg',
      } as any);
    }

    return formData;
  };

  const handleSave = async () => {
    if (!form.name || !form.address || !form.contact || !form.mapUrl || !form.staffId) {
      Alert.alert('Validation', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const formData = createFormData();
      
      let response;
      if (editingId) {
        // Update existing store
        response = await fetch(`${API_BASE_URL}/stores/${editingId}`, {
          method: 'PUT',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Create new store
        response = await fetch(`${API_BASE_URL}/stores`, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      if (response.ok) {
        Alert.alert('Success', editingId ? 'Store updated successfully' : 'Store created successfully');
        resetForm();
        setModalVisible(false);
        fetchStores(); // Refresh the list
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'Failed to save store');
      }
    } catch (error) {
      console.error('Error saving store:', error);
      Alert.alert('Error', 'Network error while saving store');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (store: Store) => {
    const [open, close] = store.openHours.split(' - ');
    const [openH, openM] = open.split(':').map(Number);
    const [closeH, closeM] = close.split(':').map(Number);
    
    setOpenTime(new Date(0, 0, 0, openH, openM));
    setCloseTime(new Date(0, 0, 0, closeH, closeM));
    
    setForm({
      ...store,
      staffId: store.staff?.staffId || '',
    });
    setEditingId(store._id);
    setSelectedImage(null);
    setModalVisible(true);
  };

  const handleDelete = async (storeId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this store?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/stores/${storeId}`, {
                method: 'DELETE',
              });
              
              if (response.ok) {
                Alert.alert('Success', 'Store deleted successfully');
                fetchStores();
              } else {
                Alert.alert('Error', 'Failed to delete store');
              }
            } catch (error) {
              console.error('Error deleting store:', error);
              Alert.alert('Error', 'Network error while deleting store');
            }
          },
        },
      ]
    );
  };

  const toggleStoreStatus = async (storeId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/stores/${storeId}/toggle-status`, {
        method: 'PUT',
      });
      
      if (response.ok) {
        fetchStores(); // Refresh the list
      } else {
        Alert.alert('Error', 'Failed to toggle store status');
      }
    } catch (error) {
      console.error('Error toggling store status:', error);
      Alert.alert('Error', 'Network error while updating store status');
    }
  };

  const resetForm = () => {
    setForm({});
    setEditingId(null);
    setSelectedImage(null);
    setOpenTime(new Date());
    setCloseTime(new Date());
  };

  const renderItem = ({ item }: { item: Store }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('StoreDetail', {
          store: item,
          onUpdate: (updatedStore: Store) => {
            setStores(prev => prev.map(s => (s._id === updatedStore._id ? updatedStore : s)));
          },
        })
      }
      style={[styles.card, !item.isActive && { opacity: 0.4 }]}
    >
      <Image 
        source={{ uri: item.image || '/placeholder.svg?height=160&width=400' }} 
        style={styles.image} 
      />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.address}>{item.address}</Text>
        <Text style={styles.openTime}>🕒 {item.openHours}</Text>
        <Text style={styles.contact}>📞 {item.contact}</Text>
        <Text style={styles.status}>
          Trạng thái: {item.isActive ? 'Hoạt động' : 'Ngưng hoạt động'}
        </Text>
        <Text style={styles.status}>
          Nhân viên: {item.staff?.staffId || 'Chưa phân công'}
        </Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => handleEdit(item)}
          >
            <Ionicons name="pencil" size={16} color="#fff" />
            <Text style={styles.buttonText}>Sửa</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.toggleButton, { backgroundColor: item.isActive ? '#ff6b6b' : '#4AA366' }]} 
            onPress={() => toggleStoreStatus(item._id)}
          >
            <Ionicons name={item.isActive ? 'pause' : 'play'} size={16} color="#fff" />
            <Text style={styles.buttonText}>{item.isActive ? 'Tạm dừng' : 'Kích hoạt'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={() => handleDelete(item._id)}
          >
            <Ionicons name="trash" size={16} color="#fff" />
            <Text style={styles.buttonText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Quản lý cửa hàng</Text>
      
      {refreshing ? (
        <ActivityIndicator size="large" color="#4AA366" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={stores}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
          onRefresh={fetchStores}
          refreshing={refreshing}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalWrapper}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              style={styles.modalContainer}
              contentContainerStyle={{ paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.header}>
                {editingId ? 'Chỉnh sửa cửa hàng' : 'Thêm cửa hàng mới'}
              </Text>
              
              <TextInput
                placeholder="Tên cửa hàng *"
                style={styles.input}
                value={form.name}
                onChangeText={text => setForm({ ...form, name: text })}
              />
              
              <TextInput
                placeholder="Địa chỉ *"
                style={styles.input}
                value={form.address}
                onChangeText={text => setForm({ ...form, address: text })}
              />
              
              <TextInput
                placeholder="Số liên hệ *"
                style={styles.input}
                value={form.contact}
                onChangeText={text => setForm({ ...form, contact: text })}
                keyboardType="phone-pad"
              />

              <View style={styles.coordinateRow}>
                <TextInput
                  placeholder="Latitude"
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  value={form.latitude?.toString()}
                  onChangeText={text => setForm({ ...form, latitude: parseFloat(text) || 0 })}
                  keyboardType="numeric"
                />
                <TextInput
                  placeholder="Longitude"
                  style={[styles.input, { flex: 1, marginLeft: 8 }]}
                  value={form.longitude?.toString()}
                  onChangeText={text => setForm({ ...form, longitude: parseFloat(text) || 0 })}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.timeRow}>
                <TouchableOpacity 
                  style={styles.timeBtn} 
                  onPress={() => setShowOpenPicker(true)}
                >
                  <Text>Giờ mở: {formatTime(openTime)}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.timeBtn} 
                  onPress={() => setShowClosePicker(true)}
                >
                  <Text>Giờ đóng: {formatTime(closeTime)}</Text>
                </TouchableOpacity>
              </View>

              {showOpenPicker && (
                <DateTimePicker
                  value={openTime}
                  mode="time"
                  is24Hour
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowOpenPicker(false);
                    if (selectedDate) setOpenTime(selectedDate);
                  }}
                />
              )}

              {showClosePicker && (
                <DateTimePicker
                  value={closeTime}
                  mode="time"
                  is24Hour
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowClosePicker(false);
                    if (selectedDate) setCloseTime(selectedDate);
                  }}
                />
              )}
              
              <TextInput
                placeholder="URL bản đồ *"
                style={styles.input}
                value={form.mapUrl}
                onChangeText={text => setForm({ ...form, mapUrl: text })}
              />
              
              <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                <Text style={{ color: '#3E6EF3', fontWeight: '600' }}>
                  {form.image ? 'Đổi ảnh' : 'Tải ảnh lên'}
                </Text>
              </TouchableOpacity>
              
              {form.image && (
                <Image 
                  source={{ uri: form.image }} 
                  style={{ width: '100%', height: 160, marginTop: 10, borderRadius: 8 }} 
                />
              )}
              
              <TextInput
                placeholder="Mã nhân viên quản lý *"
                style={styles.input}
                value={form.staffId}
                onChangeText={text => setForm({ ...form, staffId: text })}
                autoCapitalize="none"
              />
              
              <View style={styles.switchRow}>
                <Text>Hoạt động:</Text>
                <Switch 
                  value={form.isActive ?? true} 
                  onValueChange={val => setForm({ ...form, isActive: val })} 
                />
              </View>
              
              <TouchableOpacity 
                style={[styles.saveButton, loading && { opacity: 0.7 }]} 
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {editingId ? 'Cập nhật' : 'Thêm'} cửa hàng
                  </Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  Alert.alert(
                    'Xác nhận', 
                    'Bạn có chắc muốn huỷ và xoá dữ liệu đã nhập?', 
                    [
                      { text: 'Không', style: 'cancel' },
                      {
                        text: 'Có',
                        style: 'destructive',
                        onPress: () => {
                          resetForm();
                          setModalVisible(false);
                        },
                      },
                    ]
                  );
                }}
              >
                <Text style={styles.buttonText}>Huỷ</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  modalWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 60,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalContainer: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 24 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 12, 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    marginBottom: 12, 
    backgroundColor: '#fdfdfd', 
    fontSize: 15 
  },
  coordinateRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 12 
  },
  uploadBtn: { 
    borderWidth: 1, 
    borderColor: '#4AA366', 
    paddingVertical: 12, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginBottom: 12, 
    backgroundColor: '#e6f5ee' 
  },
  switchRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12, 
    gap: 8 
  },
  timeRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 12, 
    gap: 8 
  },
  timeBtn: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 12, 
    paddingVertical: 12, 
    alignItems: 'center', 
    backgroundColor: '#f2f2f2' 
  },
  saveButton: { 
    backgroundColor: '#4AA366', 
    padding: 14, 
    borderRadius: 12, 
    marginBottom: 12, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3 
  },
  cancelButton: { 
    backgroundColor: '#ccc', 
    padding: 14, 
    borderRadius: 12 
  },
  buttonText: { 
    color: 'white', 
    textAlign: 'center', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  card: { 
    backgroundColor: '#f9f9f9', 
    borderRadius: 12, 
    overflow: 'hidden', 
    marginBottom: 30, 
    elevation: 3 
  },
  image: { width: '100%', height: 160 },
  info: { padding: 16 },
  name: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#4AA366', 
    marginBottom: 4 
  },
  address: { fontSize: 14, color: '#555' },
  openTime: { fontSize: 13, color: '#888', marginTop: 4 },
  contact: { fontSize: 13, color: '#888', marginTop: 2 },
  status: { fontSize: 13, color: '#888', marginTop: 2 },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3E6EF3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 4,
    justifyContent: 'center',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginLeft: 4,
    justifyContent: 'center',
  },
  mapButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#4AA366', 
    padding: 10, 
    marginTop: 8, 
    borderRadius: 8, 
    alignSelf: 'flex-start' 
  },
  mapText: { 
    color: '#fff', 
    marginLeft: 6, 
    fontSize: 14, 
    fontWeight: '500' 
  },
  fab: { 
    position: 'absolute', 
    right: 20, 
    bottom: 80, 
    backgroundColor: '#3E6EF3', 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 10, 
    zIndex: 100 
  },
});

export default ManageStore;