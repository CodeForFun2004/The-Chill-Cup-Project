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
  Platform,
  KeyboardAvoidingView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Store = {
  id: string;
  name: string;
  address: string;
  contact: string;
  openHours: string;
  isActive: boolean;
  mapUrl?: string;
  image: any;
  staff?: string;
};

const staffList = [
  { id: 'nv001', name: 'Nguyễn Văn A', avatar: 'https://api.dicebear.com/9.x/adventurer/png?seed=Kingston' },
  { id: 'nv002', name: 'Trần Thị B', avatar: 'https://api.dicebear.com/9.x/adventurer/png?seed=Ryker' },
  { id: 'nv003', name: 'Lê Văn C', avatar: 'https://api.dicebear.com/9.x/adventurer/png?seed=Sawyer' },
];

type StoreDetailRouteProp = RouteProp<
  { StoreDetail: { store: Store } },
  'StoreDetail'
>;

const StoreDetail: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<StoreDetailRouteProp>();
  const { store } = route.params;

  const [storeDetail, setStoreDetail] = useState<Store>(store);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Store>>(storeDetail);

  // Modal chọn nhân viên
  const [staffModalVisible, setStaffModalVisible] = useState(false);

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
    if (storeDetail.mapUrl) {
      Linking.openURL(storeDetail.mapUrl);
    } else {
      Alert.alert('Thông báo', 'Chưa có link bản đồ.');
    }
  };

  // --- UI ---
  const staffObj = staffList.find(s => s.id === storeDetail.staff);

  return (
    <ScrollView style={styles.container}>
      <Image source={storeDetail.image} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <Text style={styles.name}>{storeDetail.name}</Text>

        {/* Địa chỉ */}
        <View style={styles.row}>
          <Ionicons name="location-outline" size={20} color="#3E6EF3" style={{marginRight: 7}} />
          <Text style={styles.labelBold}>Địa chỉ:</Text>
        </View>
        <Text style={styles.value}>{storeDetail.address}</Text>

        {/* Giờ hoạt động */}
        <View style={styles.row}>
          <Ionicons name="time-outline" size={20} color="#4AA366" style={{marginRight: 7}} />
          <Text style={styles.labelBold}>Giờ hoạt động:</Text>
        </View>
        <Text style={styles.value}>{storeDetail.openHours}</Text>

        {/* Liên hệ */}
        <View style={styles.row}>
          <Ionicons name="call-outline" size={20} color="#f7b731" style={{marginRight: 7}} />
          <Text style={styles.labelBold}>Liên hệ:</Text>
        </View>
        <Text style={styles.value}>{storeDetail.contact}</Text>

        {/* Nhân viên quản lý */}
        <View style={styles.row}>
          <Ionicons name="person-circle-outline" size={20} color="#9b59b6" style={{marginRight: 7}} />
          <Text style={styles.labelBold}>Nhân viên quản lý:</Text>
        </View>
        {staffObj ? (
          <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 8}}>
            <Image source={{ uri: staffObj.avatar }} style={styles.staffAvatar} />
            <Text style={{marginLeft: 10, fontSize: 16, color: '#444'}}>{staffObj.name}</Text>
          </View>
        ) : (
          <Text style={styles.value}>Không rõ</Text>
        )}

        {/* Xem bản đồ */}
        {storeDetail.mapUrl && (
          <TouchableOpacity style={styles.mapButton} onPress={openMap}>
            <Ionicons name="navigate-circle-outline" size={22} color="#fff" />
            <Text style={styles.mapText}>Xem bản đồ</Text>
          </TouchableOpacity>
        )}

        {/* Trạng thái hoạt động */}
        <View style={styles.switchRow}>
          <Text style={[styles.labelBold, {color: storeDetail.isActive ? '#4AA366' : 'red'}]}>
            Trạng thái hoạt động:
          </Text>
          <Switch
            value={storeDetail.isActive}
            onValueChange={toggleActive}
            trackColor={{ false: "#ccc", true: "#4AA366" }}
          />
        </View>

        {!storeDetail.isActive && (
          <Text style={styles.inactiveWarning}>⚠️ Cửa hàng này đã ngưng hoạt động</Text>
        )}

        {/* Nút chỉnh sửa */}
        <TouchableOpacity
          style={[styles.mapButton, { backgroundColor: '#FFA500', marginTop: 22 }]}
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
      <Modal visible={editModalVisible} animationType="slide" transparent>
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
                <Text style={styles.header}>Chỉnh sửa cửa hàng</Text>
                {/* Tên cửa hàng */}
                <View style={styles.inputGroup}>
                  <Ionicons name="storefront-outline" size={20} color="#4AA366" style={styles.icon} />
                  <TextInput
                    placeholder="Tên cửa hàng"
                    style={styles.inputPopup}
                    value={editForm.name}
                    onChangeText={text => setEditForm({ ...editForm, name: text })}
                    placeholderTextColor="#aaa"
                  />
                </View>
                {/* Địa chỉ */}
                <View style={styles.inputGroup}>
                  <Ionicons name="location-outline" size={20} color="#3E6EF3" style={styles.icon} />
                  <TextInput
                    placeholder="Địa chỉ"
                    style={styles.inputPopup}
                    value={editForm.address}
                    onChangeText={text => setEditForm({ ...editForm, address: text })}
                    placeholderTextColor="#aaa"
                  />
                </View>
                {/* Liên hệ */}
                <View style={styles.inputGroup}>
                  <Ionicons name="call-outline" size={20} color="#f7b731" style={styles.icon} />
                  <TextInput
                    placeholder="Số liên hệ"
                    style={styles.inputPopup}
                    keyboardType="phone-pad"
                    value={editForm.contact}
                    onChangeText={text => setEditForm({ ...editForm, contact: text })}
                    placeholderTextColor="#aaa"
                  />
                </View>
                {/* Giờ hoạt động */}
                <View style={styles.inputGroup}>
                  <Ionicons name="time-outline" size={20} color="#4AA366" style={styles.icon} />
                  <TextInput
                    placeholder="Giờ hoạt động"
                    style={styles.inputPopup}
                    value={editForm.openHours}
                    onChangeText={text => setEditForm({ ...editForm, openHours: text })}
                    placeholderTextColor="#aaa"
                  />
                </View>
                {/* Link bản đồ */}
                <View style={styles.inputGroup}>
                  <Ionicons name="map-outline" size={20} color="#18a1e9" style={styles.icon} />
                  <TextInput
                    placeholder="Link bản đồ (Google Maps)"
                    style={[styles.inputPopup, { paddingRight: 36 }]}
                    value={editForm.mapUrl}
                    onChangeText={text => setEditForm({ ...editForm, mapUrl: text })}
                    placeholderTextColor="#aaa"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {!!editForm.mapUrl && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(editForm.mapUrl!)}
                      style={{ position: 'absolute', right: 12 }}
                    >
                      <Ionicons name="navigate-circle-outline" size={24} color="#18a1e9" />
                    </TouchableOpacity>
                  )}
                </View>
                {/* Chọn nhân viên */}
                <View style={styles.inputGroup}>
                  <Ionicons name="person-outline" size={20} color="#9b59b6" style={styles.icon} />
                  <TouchableOpacity
                    style={[styles.staffPickerBtn, { flex: 1 }]}
                    onPress={() => setStaffModalVisible(true)}
                    activeOpacity={0.8}
                  >
                    {editForm.staff ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                          source={{ uri: staffList.find(s => s.id === editForm.staff)?.avatar }}
                          style={styles.staffAvatarMini}
                        />
                        <Text style={{ marginLeft: 8, color: '#222', fontSize: 15 }}>
                          {staffList.find(s => s.id === editForm.staff)?.name}
                        </Text>
                      </View>
                    ) : (
                      <Text style={{ color: '#aaa', fontSize: 15 }}>Chọn nhân viên quản lý</Text>
                    )}
                  </TouchableOpacity>
                </View>
                {/* Modal chọn nhân viên */}
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
                          const isSelected = editForm.staff === item.id;
                          return (
                            <TouchableOpacity
                              style={[
                                styles.staffCard,
                                isSelected && { borderColor: '#3E6EF3', backgroundColor: '#eef6ff' },
                              ]}
                              onPress={() => {
                                setEditForm({ ...editForm, staff: item.id });
                                setStaffModalVisible(false);
                              }}
                            >
                              <Image source={{ uri: item.avatar }} style={styles.staffAvatar} />
                              <View style={{ flex: 1 }}>
                                <Text style={styles.staffName}>{item.name}</Text>
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

                <TouchableOpacity style={styles.saveButton} onPress={handleEditSave}>
                  <Text style={styles.saveText}>Lưu thay đổi</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.cancelText}>Huỷ</Text>
                </TouchableOpacity>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 200, borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  content: { padding: 20 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#4AA366', marginBottom: 12, marginTop: 8, textAlign: 'center', letterSpacing: 0.2 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  labelBold: { fontSize: 16, fontWeight: '600', color: '#444' },
  value: { fontSize: 15, color: '#666', marginTop: 3, marginLeft: 2 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  inactiveWarning: {
    color: 'red',
    marginTop: 14,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3E6EF3',
    padding: 12,
    borderRadius: 9,
    marginTop: 16,
    alignSelf: 'center',
    minWidth: 160,
    justifyContent: 'center',
  },
  mapText: { color: '#fff', marginLeft: 8, fontWeight: '500', fontSize: 15 },
  backButton: {
    marginTop: 30,
    backgroundColor: '#eee',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  backText: { color: '#333', fontSize: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 18, color: '#3E6EF3', textAlign: 'center' },

  // Popup & input
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 24,
    minHeight: '68%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
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
  icon: { marginRight: 6 },
  inputPopup: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    paddingVertical: 13,
    paddingHorizontal: 2,
    backgroundColor: 'transparent',
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
  staffAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bbb',
    backgroundColor: '#eee',
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
    maxHeight: '68%',
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
  staffName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
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

  saveButton: {
    backgroundColor: '#4AA366',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 5,
  },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
  },
  cancelText: { color: '#555', fontWeight: '600', fontSize: 15 },
});

export default StoreDetail;
