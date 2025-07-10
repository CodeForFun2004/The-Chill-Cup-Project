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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  mapUrl?: string; // thêm trường mapUrl
}

const staffList = [
  { id: 'nv001', name: 'Nguyễn Văn A', avatar: 'https://api.dicebear.com/9.x/adventurer/png?seed=Kingston' },
  { id: 'nv002', name: 'Trần Thị B', avatar: 'https://api.dicebear.com/9.x/adventurer/png?seed=Ryker' },
  { id: 'nv003', name: 'Lê Văn C', avatar: 'https://api.dicebear.com/9.x/adventurer/png?seed=Sawyer' },
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
  const [modalVisible, setModalVisible] = useState(false);
  const [openTime, setOpenTime] = useState<Date>(new Date());
  const [closeTime, setCloseTime] = useState<Date>(new Date());
  const [showOpenPicker, setShowOpenPicker] = useState(false);
  const [showClosePicker, setShowClosePicker] = useState(false);

  // Modal chọn nhân viên
  const [staffModalVisible, setStaffModalVisible] = useState(false);

  // Lắng nghe sự kiện cập nhật từ StoreDetail
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
    if (!form.name || !form.address || !form.contact || !form.image || !form.staff || !form.mapUrl) {
      Alert.alert('Validation', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const openHoursFormatted = `${formatTime(openTime)} - ${formatTime(closeTime)}`;

    const newStore: Store = {
      id: Date.now().toString(),
      name: form.name!,
      address: form.address!,
      contact: form.contact!,
      openHours: openHoursFormatted,
      isActive: form.isActive ?? true,
      image: form.image!,
      staff: form.staff!,
      mapUrl: form.mapUrl!, // thêm trường mapUrl
    };
    setStores(prev => [...prev, newStore]);

    resetForm();
    setModalVisible(false);
  };

  const resetForm = () => {
    setForm({});
    setOpenTime(new Date());
    setCloseTime(new Date());
  };

  // Lấy tên store mà staff đang phụ trách
  const getStaffStore = (staffId: string) => {
    const store = stores.find(s => s.staff === staffId);
    if (store) return store.name;
    return null;
  };

  const renderItem = ({ item }: { item: Store }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('StoreDetail', {
          store: item,
        })
      }
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

        {/* MODAL POPUP TẠO STORE */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalBackdrop}>
            <SafeAreaView style={styles.modalContent}>
              <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
              >
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={{ paddingBottom: 60 }}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.popupTitle}>Thêm cửa hàng mới</Text>
                  {/* Tên cửa hàng */}
                  <View style={styles.inputGroup}>
                    <Ionicons name="storefront-outline" size={20} color="#4AA366" style={styles.icon} />
                    <TextInput
                      placeholder="Tên cửa hàng"
                      style={styles.inputPopup}
                      value={form.name}
                      onChangeText={text => setForm({ ...form, name: text })}
                      placeholderTextColor="#aaa"
                    />
                  </View>
                  {/* Địa chỉ */}
                  <View style={styles.inputGroup}>
                    <Ionicons name="location-outline" size={20} color="#3E6EF3" style={styles.icon} />
                    <TextInput
                      placeholder="Địa chỉ"
                      style={styles.inputPopup}
                      value={form.address}
                      onChangeText={text => setForm({ ...form, address: text })}
                      placeholderTextColor="#aaa"
                    />
                  </View>
                  {/* Số liên hệ */}
                  <View style={styles.inputGroup}>
                    <Ionicons name="call-outline" size={20} color="#f7b731" style={styles.icon} />
                    <TextInput
                      placeholder="Số liên hệ"
                      style={styles.inputPopup}
                      keyboardType="phone-pad"
                      value={form.contact}
                      onChangeText={text => setForm({ ...form, contact: text })}
                      placeholderTextColor="#aaa"
                    />
                  </View>
                  {/* Link bản đồ */}
                  <View style={styles.inputGroup}>
                    <Ionicons name="map-outline" size={20} color="#18a1e9" style={styles.icon} />
                    <TextInput
                      placeholder="Link bản đồ (Google Maps)"
                      style={[styles.inputPopup, { paddingRight: 36 }]}
                      value={form.mapUrl}
                      onChangeText={text => setForm({ ...form, mapUrl: text })}
                      placeholderTextColor="#aaa"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {!!form.mapUrl && (
                      <TouchableOpacity
                        onPress={() => Linking.openURL(form.mapUrl!)}
                        style={{ position: 'absolute', right: 12 }}
                      >
                        <Ionicons name="navigate-circle-outline" size={24} color="#18a1e9" />
                      </TouchableOpacity>
                    )}
                  </View>
                  {/* Chọn giờ mở - đóng */}
                  <View style={styles.timeRowPopup}>
                    <TouchableOpacity style={styles.timeBtnPopup} onPress={() => setShowOpenPicker(true)}>
                      <Ionicons name="time-outline" size={18} color="#4AA366" />
                      <Text style={{ marginLeft: 4 }}>Giờ mở: {formatTime(openTime)}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.timeBtnPopup} onPress={() => setShowClosePicker(true)}>
                      <Ionicons name="time-outline" size={18} color="#d35400" />
                      <Text style={{ marginLeft: 4 }}>Giờ đóng: {formatTime(closeTime)}</Text>
                    </TouchableOpacity>
                  </View>
                  {showOpenPicker && (
                    <DateTimePicker
                      value={openTime}
                      mode="time"
                      is24Hour
                      display="spinner"
                      onChange={(event, selectedDate) => {
                        setShowOpenPicker(false);
                        if (selectedDate) setOpenTime(selectedDate);
                      }}
                      style={{ backgroundColor: '#fff' }}
                    />
                  )}
                  {showClosePicker && (
                    <DateTimePicker
                      value={closeTime}
                      mode="time"
                      is24Hour
                      display="spinner"
                      onChange={(event, selectedDate) => {
                        setShowClosePicker(false);
                        if (selectedDate) setCloseTime(selectedDate);
                      }}
                      style={{ backgroundColor: '#fff' }}
                    />
                  )}

                  {/* Ảnh */}
                  <TouchableOpacity style={styles.uploadBtnPopup} onPress={pickImage}>
                    <Ionicons name="image-outline" size={20} color="#3E6EF3" />
                    <Text style={{ color: '#3E6EF3', fontWeight: '600', marginLeft: 8 }}>
                      {form.image ? 'Đổi ảnh' : 'Tải ảnh lên'}
                    </Text>
                  </TouchableOpacity>
                  {form.image && (
                    <Image
                      source={typeof form.image === 'number' ? form.image : { uri: form.image.uri }}
                      style={styles.imagePreview}
                    />
                  )}

                  {/* Chọn nhân viên (custom) */}
                  <View style={styles.inputGroup}>
                    <Ionicons name="person-outline" size={20} color="#9b59b6" style={styles.icon} />
                    <TouchableOpacity
                      style={[styles.staffPickerBtn, { flex: 1 }]}
                      onPress={() => setStaffModalVisible(true)}
                      activeOpacity={0.8}
                    >
                      {form.staff ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Image
                            source={{ uri: staffList.find(s => s.id === form.staff)?.avatar }}
                            style={styles.staffAvatarMini}
                          />
                          <Text style={{ marginLeft: 8, color: '#222', fontSize: 15 }}>
                            {staffList.find(s => s.id === form.staff)?.name}
                          </Text>
                        </View>
                      ) : (
                        <Text style={{ color: '#aaa', fontSize: 15 }}>Chọn nhân viên quản lý</Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* MODAL CHỌN NHÂN VIÊN */}
                  <Modal
                    visible={staffModalVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setStaffModalVisible(false)}
                  >
                    <View style={styles.staffModalOverlay}>
                      <View style={styles.staffModalContainer}>
                        <Text style={styles.staffModalTitle}>Chọn nhân viên phụ trách</Text>
                        <FlatList
                          data={staffList}
                          keyExtractor={item => item.id}
                          renderItem={({ item }) => {
                            const staffStore = getStaffStore(item.id);
                            const isSelected = form.staff === item.id;
                            const isDisabled = !!staffStore;
                            return (
                              <TouchableOpacity
                                style={[
                                  styles.staffCard,
                                  isSelected && { borderColor: '#3E6EF3', backgroundColor: '#eef6ff' },
                                  isDisabled && { opacity: 0.4 },
                                ]}
                                onPress={() => {
                                  if (!isDisabled) {
                                    setForm({ ...form, staff: item.id });
                                    setStaffModalVisible(false);
                                  }
                                }}
                                disabled={isDisabled}
                              >
                                <Image source={{ uri: item.avatar }} style={styles.staffAvatar} />
                                <View style={{ flex: 1 }}>
                                  <Text style={styles.staffName}>{item.name}</Text>
                                  {staffStore ? (
                                    <Text style={styles.staffStatus}>{`Đang phụ trách: ${staffStore}`}</Text>
                                  ) : (
                                    <Text style={[styles.staffStatus, { color: '#4AA366' }]}>Chưa phụ trách cửa hàng nào</Text>
                                  )}
                                </View>
                                {isSelected && <Ionicons name="checkmark-circle" size={26} color="#3E6EF3" />}
                              </TouchableOpacity>
                            );
                          }}
                          contentContainerStyle={{ paddingBottom: 20 }}
                        />
                        <TouchableOpacity onPress={() => setStaffModalVisible(false)} style={styles.closeStaffModalBtn}>
                          <Text style={{ color: '#3E6EF3', fontWeight: 'bold', fontSize: 16 }}>Đóng</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>

                  {/* Switch Hoạt động */}
                  <View style={styles.switchRowPopup}>
                    <Text style={{ fontSize: 15, color: '#555', marginRight: 8 }}>Hoạt động:</Text>
                    <Switch
                      value={form.isActive ?? true}
                      onValueChange={val => setForm({ ...form, isActive: val })}
                      trackColor={{ false: "#ccc", true: "#4AA366" }}
                      thumbColor={form.isActive ? "#fff" : "#eee"}
                    />
                  </View>

                  {/* Nút thao tác */}
                  <TouchableOpacity style={styles.saveButtonPopup} onPress={handleSave}>
                    <Text style={styles.saveText}>Thêm cửa hàng</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButtonPopup}
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
                    <Text style={styles.cancelText}>Huỷ</Text>
                  </TouchableOpacity>
                </ScrollView>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </View>
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
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  card: { backgroundColor: '#f9f9f9', borderRadius: 12, overflow: 'hidden', marginBottom: 30 },
  image: { width: '100%', height: 160 },
  info: { padding: 16 },
  name: { fontSize: 18, fontWeight: '600', color: '#4AA366', marginBottom: 4 },
  address: { fontSize: 14, color: '#555' },
  openTime: { fontSize: 13, color: '#888', marginTop: 4 },
  contact: { fontSize: 13, color: '#888', marginTop: 2 },
  status: { fontSize: 13, color: '#888', marginTop: 2 },
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
    shadowColor: "#3E6EF3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 3,
    elevation: 5,
  },

  // Popup styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 24,
    minHeight: '75%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
  },
  popupTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#3E6EF3',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 14,
    backgroundColor: '#f9fafd',
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 6,
  },
  inputPopup: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    paddingVertical: 13,
    paddingHorizontal: 2,
    backgroundColor: 'transparent',
  },
  timeRowPopup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  timeBtnPopup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f6ef',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#dbeaf4',
    marginHorizontal: 2,
  },
  uploadBtnPopup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3E6EF3',
    backgroundColor: '#f4f8ff',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    marginTop: 4,
  },
  imagePreview: {
    width: '100%',
    height: 170,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  // Staff picker
  staffPickerBtn: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  staffAvatarMini: {
    width: 30,
    height: 30,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  // Staff modal styles
  staffModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-end',
  },
  staffModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingHorizontal: 18,
    paddingVertical: 24,
    elevation: 8,
  },
  staffModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#3E6EF3',
  },
  staffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    backgroundColor: '#f6faff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#eee',
    marginBottom: 10,
    opacity: 1,
  },
  staffAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 14,
    backgroundColor: '#eee',
  },
  staffName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  staffStatus: {
    fontSize: 13,
    color: '#f7b731',
    marginTop: 3,
  },
  closeStaffModalBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 6,
    borderRadius: 8,
    backgroundColor: '#f6faff',
    borderWidth: 1,
    borderColor: '#e2e2e2',
  },
  pickerWrapper: {
    flex: 1,
    marginLeft: 2,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f9fafd',
  },
  switchRowPopup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
    paddingLeft: 2,
  },
  saveButtonPopup: {
    backgroundColor: '#3E6EF3',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    marginTop: 10,
    shadowColor: "#3E6EF3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 7,
    elevation: 3,
  },
  saveText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  cancelButtonPopup: {
    backgroundColor: '#e1e1e1',
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
  },
  cancelText: {
    color: '#555',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default ManageStore;
