import React, { useEffect, useState } from 'react';
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
  DeviceEventEmitter,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminStoreStackParamList } from '../../navigation/admin/AdminStoreNavigator';
import { STORES } from '../../data/stores';

type ManageStoreNavigationProp = StackNavigationProp<AdminStoreStackParamList, 'ManageStores'>;

export interface Store {
  id: string;
  name: string;
  address: string;
  openHours: string;
  phone?: string;
  contact: string;
  distance?: string;
  latitude?: number;
  longitude?: number;
  image: any;
  isActive: boolean;
  staff?: string;
}

const staffList = [
  { id: 'nv001', name: 'Nguyễn Văn A' },
  { id: 'nv002', name: 'Trần Thị B' },
  { id: 'nv003', name: 'Lê Văn C' },
];

const ManageStore: React.FC = () => {
  const navigation = useNavigation<ManageStoreNavigationProp>();

  const [stores, setStores] = useState<Store[]>(
    STORES.map(store => ({
      ...store,
      contact: store.phone ?? '',
      openHours: store.openTime,
      isActive: true,
      staff: 'nv001',
    }))
  );

  const [form, setForm] = useState<Partial<Store>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [openTime, setOpenTime] = useState<Date>(new Date());
  const [closeTime, setCloseTime] = useState<Date>(new Date());
  const [showOpenPicker, setShowOpenPicker] = useState(false);
  const [showClosePicker, setShowClosePicker] = useState(false);

  // 🔄 Lắng nghe sự kiện cập nhật từ StoreDetail
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('storeUpdated', (updated: Store) => {
      setStores(prev => prev.map(s => (s.id === updated.id ? updated : s)));
    });
    return () => subscription.remove();
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets.length > 0) {
      setForm({ ...form, image: { uri: result.assets[0].uri } });
    }
  };

  const handleSave = () => {
    if (!form.name || !form.address || !form.contact || !form.image || !form.staff) {
      Alert.alert('Validation', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const openHoursFormatted = `${formatTime(openTime)} - ${formatTime(closeTime)}`;

    if (editingId) {
      setStores(prev =>
        prev.map(store =>
          store.id === editingId
            ? { ...store, ...form, openHours: openHoursFormatted }
            : store
        )
      );
    } else {
      const newStore: Store = {
        id: Date.now().toString(),
        name: form.name!,
        address: form.address!,
        contact: form.contact!,
        openHours: openHoursFormatted,
        isActive: form.isActive ?? true,
        image: form.image!,
        staff: form.staff!,
      };
      setStores(prev => [...prev, newStore]);
    }

    resetForm();
    setModalVisible(false);
  };

  const handleEdit = (store: Store) => {
    const [open, close] = store.openHours.split(' - ');
    const [openH, openM] = open.split(':').map(Number);
    const [closeH, closeM] = close.split(':').map(Number);
    setOpenTime(new Date(0, 0, 0, openH, openM));
    setCloseTime(new Date(0, 0, 0, closeH, closeM));
    setForm(store);
    setEditingId(store.id);
    setModalVisible(true);
  };

  const resetForm = () => {
    setForm({});
    setEditingId(null);
    setOpenTime(new Date());
    setCloseTime(new Date());
  };

  const renderItem = ({ item }: { item: Store }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('StoreDetail', {
          store: item,
        })
      }
      onLongPress={() => handleEdit(item)}
      style={[styles.card, !item.isActive && { opacity: 0.4 }]}
    >
      <Image
        source={typeof item.image === 'number' ? item.image : { uri: item.image.uri }}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.address}>{item.address}</Text>
        <Text style={styles.openTime}>🕒 {item.openHours}</Text>
        <Text style={styles.contact}>📞 {item.contact}</Text>
        <Text style={styles.status}>Trạng thái: {item.isActive ? 'Hoạt động' : 'Ngưng hoạt động'}</Text>
        <Text style={styles.status}>
          Nhân viên: {staffList.find(s => s.id === item.staff)?.name ?? 'Không rõ'}
        </Text>
        {item.distance && <Text style={styles.status}>Khoảng cách: {item.distance}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <Text style={styles.header}>Quản lý cửa hàng</Text>
        <FlatList
          data={stores}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
        />

        <Modal visible={modalVisible} animationType="slide">
          <SafeAreaView style={styles.modalWrapper}>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
            >
              <ScrollView
                style={styles.modalContainer}
                contentContainerStyle={{ paddingBottom: 100 }}
              >
                <Text style={styles.header}>Thêm / Chỉnh sửa cửa hàng</Text>
                <TextInput
                  placeholder="Tên cửa hàng"
                  style={styles.input}
                  value={form.name}
                  onChangeText={text => setForm({ ...form, name: text })}
                />
                <TextInput
                  placeholder="Địa chỉ"
                  style={styles.input}
                  value={form.address}
                  onChangeText={text => setForm({ ...form, address: text })}
                />
                <TextInput
                  placeholder="Số liên hệ"
                  style={styles.input}
                  value={form.contact}
                  onChangeText={text => setForm({ ...form, contact: text })}
                />

                <View style={styles.timeRow}>
                  <TouchableOpacity style={styles.timeBtn} onPress={() => setShowOpenPicker(true)}>
                    <Text>Giờ mở: {formatTime(openTime)}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.timeBtn} onPress={() => setShowClosePicker(true)}>
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

                <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                  <Text style={{ color: '#3E6EF3', fontWeight: '600' }}>
                    {form.image ? 'Đổi ảnh' : 'Tải ảnh lên'}
                  </Text>
                </TouchableOpacity>
                {form.image && (
                  <Image
                    source={typeof form.image === 'number' ? form.image : { uri: form.image.uri }}
                    style={{ width: '100%', height: 160, marginTop: 10, borderRadius: 8 }}
                  />
                )}

                <View style={[styles.input, { height: 54, justifyContent: 'center', marginBottom: 12 }]}>
                  <Picker
                    selectedValue={form.staff}
                    onValueChange={(itemValue) => setForm({ ...form, staff: itemValue })}
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

                <View style={styles.switchRow}>
                  <Text>Hoạt động:</Text>
                  <Switch
                    value={form.isActive ?? true}
                    onValueChange={val => setForm({ ...form, isActive: val })}
                  />
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.buttonText}>{editingId ? 'Cập nhật' : 'Thêm'} cửa hàng</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    Alert.alert('Xác nhận', 'Bạn có chắc muốn huỷ và xoá dữ liệu đã nhập?', [
                      { text: 'Không', style: 'cancel' },
                      {
                        text: 'Có',
                        style: 'destructive',
                        onPress: () => {
                          resetForm();
                          setModalVisible(false);
                        },
                      },
                    ]);
                  }}
                >
                  <Text style={styles.buttonText}>Huỷ</Text>
                </TouchableOpacity>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>

        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  modalWrapper: { flex: 1, backgroundColor: '#fff', paddingTop: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalContainer: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 24 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 12, backgroundColor: '#fdfdfd', fontSize: 15 },
  uploadBtn: { borderWidth: 1, borderColor: '#4AA366', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 12, backgroundColor: '#e6f5ee' },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, gap: 8 },
  timeBtn: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: '#f2f2f2' },
  saveButton: { backgroundColor: '#4AA366', padding: 14, borderRadius: 12, marginBottom: 12 },
  cancelButton: { backgroundColor: '#ccc', padding: 14, borderRadius: 12 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  card: { backgroundColor: '#f9f9f9', borderRadius: 12, overflow: 'hidden', marginBottom: 30 },
  image: { width: '100%', height: 160 },
  info: { padding: 16 },
  name: { fontSize: 18, fontWeight: '600', color: '#4AA366', marginBottom: 4 },
  address: { fontSize: 14, color: '#555' },
  openTime: { fontSize: 13, color: '#888', marginTop: 4 },
  contact: { fontSize: 13, color: '#888', marginTop: 2 },
  status: { fontSize: 13, color: '#888', marginTop: 2 },
  fab: { position: 'absolute', right: 20, bottom: 80, backgroundColor: '#3E6EF3', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
});

export default ManageStore;
