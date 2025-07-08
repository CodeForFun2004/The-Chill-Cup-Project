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
  Linking,
  DeviceEventEmitter,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

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
  { StoreDetail: { store: Store } },
  'StoreDetail'
>;

const staffList = [
  { id: 'nv001', name: 'Nguyễn Văn A' },
  { id: 'nv002', name: 'Trần Thị B' },
  { id: 'nv003', name: 'Lê Văn C' },
];

const StoreDetail: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<StoreDetailRouteProp>();
  const { store } = route.params;

  const [storeDetail, setStoreDetail] = useState<Store>(store);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Store>>(storeDetail);

  const emitUpdate = (updated: Store) => {
    DeviceEventEmitter.emit('storeUpdated', updated);
    setStoreDetail(updated);
  };

  const toggleActive = () => {
    const updated = { ...storeDetail, isActive: !storeDetail.isActive };
    emitUpdate(updated);
  };

  const handleEditSave = () => {
    if (
      editForm.name &&
      editForm.address &&
      editForm.contact &&
      editForm.openHours &&
      editForm.mapUrl &&
      editForm.staff
    ) {
      const updated = { ...storeDetail, ...editForm };
      emitUpdate(updated);
      setEditModalVisible(false);
    } else {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
    }
  };

  const openMap = () => {
    Alert.alert('Mở bản đồ', 'Bạn có muốn xem trên Google Maps?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'OK', onPress: () => Linking.openURL(storeDetail.mapUrl) },
    ]);
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
        <Text style={styles.value}>
          {staffList.find(s => s.id === storeDetail.staff)?.name || 'Không rõ'}
        </Text>

        <TouchableOpacity style={styles.mapButton} onPress={openMap}>
          <Ionicons name="location-outline" size={20} color="#fff" />
          <Text style={styles.mapText}>Xem bản đồ</Text>
        </TouchableOpacity>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Trạng thái hoạt động:</Text>
          <Switch
            value={storeDetail.isActive}
            onValueChange={() => toggleActive()}
          />
        </View>

        {!storeDetail.isActive && (
          <Text style={styles.inactiveWarning}>⚠️ Cửa hàng này đã ngưng hoạt động</Text>
        )}

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

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
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

          <View style={[styles.input, { height: 54, justifyContent: 'center', marginBottom: 12 }]}>
            <Picker
              selectedValue={editForm.staff}
              onValueChange={(itemValue) => setEditForm({ ...editForm, staff: itemValue })}
              style={{ height: 50 }}
            >
              <Picker.Item label="Chọn nhân viên quản lý" value={undefined} />
              {staffList.map(staff => (
                <Picker.Item
                  key={staff.id}
                  label={`${staff.name} (${staff.id})`}
                  value={staff.id}
                />
              ))}
            </Picker>
          </View>

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
