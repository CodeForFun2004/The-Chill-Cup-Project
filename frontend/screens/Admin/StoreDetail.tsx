import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

type Store = {
  id: string;
  name: string;
  address: string;
  contact: string;
  openHours: string;
  isActive: boolean;
  mapUrl: string;
  image: any;
  staff?: string;
};

type StoreDetailRouteProp = RouteProp<
  { StoreDetail: { store: Store; onUpdate: (store: Store) => void } },
  'StoreDetail'
>;

const StoreDetail: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<StoreDetailRouteProp>();
  const { store, onUpdate } = route.params;

  const [storeDetail, setStoreDetail] = useState<Store>(store);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Store>>(storeDetail);

  const toggleActive = () => {
    const updatedStore = { ...storeDetail, isActive: !storeDetail.isActive };
    setStoreDetail(updatedStore);
    onUpdate(updatedStore);
  };

  const handleBack = () => navigation.goBack();

  const openMap = () => {
    Alert.alert('Điều hướng đến bản đồ', 'Chức năng này sẽ mở Google Maps.', [
      {
        text: 'OK',
        onPress: () => Linking.openURL(storeDetail.mapUrl),
      },
      { text: 'Huỷ', style: 'cancel' },
    ]);
  };

  const handleEditSave = () => {
    if (
      editForm.name &&
      editForm.address &&
      editForm.contact &&
      editForm.openHours &&
      editForm.mapUrl
    ) {
      const updated = { ...storeDetail, ...editForm };
      setStoreDetail(updated);
      onUpdate(updated);
      setEditModalVisible(false);
    } else {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={storeDetail.image} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{storeDetail.name}</Text>
        <Text style={styles.label}>📍 Địa chỉ:</Text>
        <Text style={styles.value}>{storeDetail.address}</Text>

        <Text style={styles.label}>🕒 Giờ hoạt động:</Text>
        <Text style={styles.value}>{storeDetail.openHours}</Text>

        <Text style={styles.label}>📞 Liên hệ:</Text>
        <Text style={styles.value}>{storeDetail.contact}</Text>

        <Text style={styles.label}>👤 Nhân viên quản lý:</Text>
        <Text style={styles.value}>{storeDetail.staff}</Text>

        <TouchableOpacity style={styles.mapButton} onPress={openMap}>
          <Ionicons name="location-outline" size={20} color="#fff" />
          <Text style={styles.mapText}>Xem bản đồ</Text>
        </TouchableOpacity>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Trạng thái hoạt động:</Text>
          <Switch value={storeDetail.isActive} onValueChange={toggleActive} />
        </View>

        {!storeDetail.isActive && (
          <Text style={styles.inactiveWarning}>⚠️ Cửa hàng này đã ngưng hoạt động</Text>
        )}

        {/* Nút chỉnh sửa */}
        <TouchableOpacity
          style={[styles.mapButton, { backgroundColor: '#FFA500', marginTop: 20 }]}
          onPress={() => {
            setEditForm(storeDetail);
            setEditModalVisible(true);
          }}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.mapText}>Chỉnh sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backText}>⬅ Quay lại</Text>
        </TouchableOpacity>
      </View>

      {/* Modal chỉnh sửa */}
      <Modal visible={editModalVisible} animationType="slide">
        <ScrollView style={{ padding: 20 }}>
          <Text style={styles.header}>Chỉnh sửa cửa hàng</Text>
          <TextInput
            placeholder="Tên cửa hàng"
            value={editForm.name}
            onChangeText={(text) => setEditForm({ ...editForm, name: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Địa chỉ"
            value={editForm.address}
            onChangeText={(text) => setEditForm({ ...editForm, address: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Liên hệ"
            value={editForm.contact}
            onChangeText={(text) => setEditForm({ ...editForm, contact: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Giờ hoạt động"
            value={editForm.openHours}
            onChangeText={(text) => setEditForm({ ...editForm, openHours: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Link bản đồ"
            value={editForm.mapUrl}
            onChangeText={(text) => setEditForm({ ...editForm, mapUrl: text })}
            style={styles.input}
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleEditSave}>
            <Text style={styles.buttonText}>Lưu thay đổi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setEditModalVisible(false)}
          >
            <Text style={styles.buttonText}>Huỷ</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 200 },
  content: { padding: 20 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#4AA366', marginBottom: 16 },
  label: { fontSize: 16, fontWeight: '600', color: '#444', marginTop: 12 },
  value: { fontSize: 15, color: '#666', marginTop: 4 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  inactiveWarning: {
    color: 'red',
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3E6EF3',
    padding: 10,
    borderRadius: 8,
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  mapText: { color: '#fff', marginLeft: 8, fontWeight: '500' },
  backButton: {
    marginTop: 30,
    backgroundColor: '#eee',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  backText: { color: '#333', fontSize: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: '#4AA366',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default StoreDetail;
