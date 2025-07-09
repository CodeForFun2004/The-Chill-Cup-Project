import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discount: string;
  minOrder: string;
  expiry: string;
  isExpired: boolean;
  isLock?: boolean; // ✅ NEW
  pointsRequired: number;
  image?: any;
}

const generatePromoCode = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `TCC-${randomNum}`;
};

const sampleVouchers: Voucher[] = [
  {
    id: '1',
    code: 'TCC-000001',
    title: 'Giảm 20% cho đơn hàng đầu tiên',
    description: 'Áp dụng cho tất cả sản phẩm',
    discount: '20%',
    minOrder: '100000đ',
    expiry: '2024-12-31',
    isExpired: false,
    isLock: false,
    pointsRequired: 200,
    image: require('../../assets/images/voucher/discount-20.png'),
  },
  {
    id: '2',
    code: 'TCC-000002',
    title: 'Giảm 30% cuối tuần',
    description: 'Chỉ áp dụng thứ 7, CN',
    discount: '30%',
    minOrder: '200000đ',
    expiry: '2024-06-30',
    isExpired: true,
    isLock: true, // ✅ Locked
    pointsRequired: 300,
    image: require('../../assets/images/voucher/discount-20.png'),
  },
  {
    id: '3',
    code: 'TCC-000003',
    title: 'Giảm 10% cho đơn từ 50k',
    description: 'Áp dụng toàn bộ cửa hàng',
    discount: '10%',
    minOrder: '50000đ',
    expiry: '2025-08-31',
    isExpired: false,
    isLock: false,
    pointsRequired: 100,
    image: require('../../assets/images/voucher/discount-20.png'),
  },
  {
    id: '4',
    code: 'TCC-000004',
    title: 'Miễn phí vận chuyển',
    description: 'Dành cho đơn hàng trên 150k',
    discount: '100%',
    minOrder: '150000đ',
    expiry: '2025-09-15',
    isExpired: false,
    isLock: false,
    pointsRequired: 250,
    image: require('../../assets/images/voucher/discount-20.png'),
  },
  {
    id: '5',
    code: 'TCC-000005',
    title: 'Giảm 50% cho khách hàng VIP',
    description: 'Chỉ áp dụng cho thành viên VIP',
    discount: '50%',
    minOrder: '300000đ',
    expiry: '2024-05-30',
    isExpired: true,
    isLock: true,
    pointsRequired: 500,
    image: require('../../assets/images/voucher/discount-20.png'),
  },
];

const ManagePromotions = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>(sampleVouchers);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [editFields, setEditFields] = useState({
    title: '',
    description: '',
    discount: '',
    minOrder: '',
    expiry: '',
    pointsRequired: '',
  });

  const isFormFilled = () => Object.values(editFields).some(val => val.trim() !== '');

  const handlePress = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setEditFields({
      title: voucher.title,
      description: voucher.description,
      discount: voucher.discount.replace('%', ''),
      minOrder: voucher.minOrder.replace(/[^\d]/g, ''),
      expiry: voucher.expiry,
      pointsRequired: String(voucher.pointsRequired),
    });
    setIsEditing(false);
    setIsCreating(false);
    setModalVisible(true);
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      setEditFields({ ...editFields, expiry: dateStr });
    }
  };

  const handleSaveEdit = () => {
    const points = parseInt(editFields.pointsRequired);
    const minOrderVal = parseInt(editFields.minOrder);
    if (points < 0 || minOrderVal < 0) {
      Alert.alert('Lỗi', 'Điểm đổi hoặc đơn tối thiểu không được là số âm.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const isExpired = editFields.expiry < today;
    const isLock = isExpired;

    const save = () => {
      if (isCreating) {
        const newVoucher: Voucher = {
          id: Date.now().toString(),
          code: generatePromoCode(),
          title: editFields.title,
          description: editFields.description,
          discount: `${editFields.discount}%`,
          minOrder: `${minOrderVal}đ`,
          expiry: editFields.expiry,
          isExpired,
          isLock,
          pointsRequired: points,
          image: require('../../assets/images/voucher/discount-20.png'),
        };
        setVouchers(prev => [...prev, newVoucher]);
        setModalVisible(false);
        setIsCreating(false);
        return;
      }

      if (!selectedVoucher) return;
      const updated = vouchers.map(v =>
        v.id === selectedVoucher.id
          ? {
              ...v,
              ...editFields,
              discount: `${editFields.discount}%`,
              isExpired,
              isLock,
              minOrder: `${minOrderVal}đ`,
              pointsRequired: points,
            }
          : v
      );
      setVouchers(updated);
      setModalVisible(false);
    };

    Alert.alert(
      'Xác nhận',
      isCreating ? 'Tạo mới voucher này?' : 'Lưu thay đổi cho voucher này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đồng ý', onPress: save },
      ]
    );
  };

  const renderVoucher = ({ item }: { item: Voucher }) => (
    <TouchableOpacity
      style={[styles.voucherCard, item.isExpired && styles.expired]}
      onPress={() => handlePress(item)}
    >
      <View style={styles.voucherContent}>
        <View style={styles.voucherLeft}>
          {item.image && <Image source={item.image} style={styles.voucherImage} />}
          <View style={styles.voucherInfo}>
            <Text style={styles.voucherTitle}>
              {item.title} - {item.code}
            </Text>
            <Text style={styles.voucherDescription}>{item.description}</Text>
            <View style={styles.voucherDetails}>
              <View style={styles.detailItem}>
                <MaterialIcons name="shopping-cart" size={14} color="#666" />
                <Text style={styles.detailText}>Đơn tối thiểu: {item.minOrder}</Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialIcons name="event" size={14} color="#666" />
                <Text style={styles.detailText}>HSD: {item.expiry}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.voucherRight}>
          <Text style={styles.discountText}>{item.discount}</Text>
        </View>
      </View>
      {item.isExpired && (
        <View style={styles.usedOverlay}>
          <MaterialIcons name="cancel" size={24} color="red" />
          <Text style={styles.usedText}>Voucher đã hết hạn</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const handleDelete = (id: string) => {
    Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa voucher này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          setVouchers(prev => prev.filter(v => v.id !== id));
          setModalVisible(false);
          setSelectedVoucher(null);
        },
      },
    ]);
  };

  const handleCancelCreate = () => {
    if (isCreating && isFormFilled()) {
      Alert.alert('Xác nhận hủy tạo', 'Bạn đã nhập thông tin. Hủy sẽ làm mất dữ liệu. Bạn có chắc chắn?', [
        { text: 'Tiếp tục chỉnh sửa', style: 'cancel' },
        {
          text: 'Hủy tạo',
          style: 'destructive',
          onPress: () => {
            setModalVisible(false);
            setIsCreating(false);
          },
        },
      ]);
    } else {
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản Lý Khuyến Mãi</Text>
      <FlatList
        data={vouchers.filter(v => !v.isLock)} // ✅ Chỉ hiển thị voucher chưa bị khóa
        keyExtractor={(item) => item.id}
        renderItem={renderVoucher}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditFields({
            title: '',
            description: '',
            discount: '',
            minOrder: '',
            expiry: new Date().toISOString().split('T')[0],
            pointsRequired: '',
          });
          setSelectedVoucher(null);
          setIsEditing(true);
          setIsCreating(true);
          setModalVisible(true);
        }}
      >
        <Text style={{ color: '#fff', fontSize: 24 }}>+</Text>
      </TouchableOpacity>

      {modalVisible && (
        <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={handleCancelCreate}>
          <View style={styles.overlay}>
            <View style={styles.card}>
              <ScrollView>
                {isEditing ? (
                  <>
                    <Text style={styles.label}>Tiêu đề</Text>
                    <TextInput style={styles.input} value={editFields.title} onChangeText={text => setEditFields({ ...editFields, title: text })} placeholder="Tiêu đề" />

                    <Text style={styles.label}>Mô tả</Text>
                    <TextInput style={styles.input} value={editFields.description} onChangeText={text => setEditFields({ ...editFields, description: text })} placeholder="Mô tả" />

                    <Text style={styles.label}>Hạn sử dụng</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                      <Text style={styles.input}>{editFields.expiry}</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker value={new Date(editFields.expiry)} mode="date" display="default" onChange={handleDateChange} />
                    )}

                    <Text style={styles.label}>Giảm giá (%)</Text>
                    <TextInput style={styles.input} value={editFields.discount} onChangeText={text => setEditFields({ ...editFields, discount: text })} keyboardType="numeric" placeholder="%" />

                    <Text style={styles.label}>Đơn tối thiểu (VNĐ)</Text>
                    <TextInput style={styles.input} value={editFields.minOrder} onChangeText={text => setEditFields({ ...editFields, minOrder: text })} keyboardType="numeric" placeholder="Đơn tối thiểu" />

                    <Text style={styles.label}>Điểm để đổi</Text>
                    <TextInput style={styles.input} value={editFields.pointsRequired} onChangeText={text => setEditFields({ ...editFields, pointsRequired: text })} keyboardType="numeric" placeholder="Điểm" />

                    <View style={styles.buttonRow}>
                      <TouchableOpacity style={[styles.viewButton, styles.successButton]} onPress={handleSaveEdit}>
                        <Text style={styles.viewButtonText}>Lưu</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.viewButton, styles.cancelButton]} onPress={handleCancelCreate}>
                        <Text style={styles.viewButtonText}>Hủy</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.label}>Tiêu đề</Text>
                    <Text style={styles.text}>{selectedVoucher?.title}</Text>

                    <Text style={styles.label}>Mô tả</Text>
                    <Text style={styles.text}>{selectedVoucher?.description}</Text>

                    <Text style={styles.label}>Hạn sử dụng</Text>
                    <Text style={styles.text}>{selectedVoucher?.expiry}</Text>

                    <Text style={styles.label}>Giảm giá</Text>
                    <Text style={styles.text}>{selectedVoucher?.discount}</Text>

                    <Text style={styles.label}>Đơn tối thiểu</Text>
                    <Text style={styles.text}>{selectedVoucher?.minOrder}</Text>

                    <Text style={styles.label}>Điểm để đổi</Text>
                    <Text style={styles.text}>{selectedVoucher?.pointsRequired}</Text>

                    <Text style={styles.label}>Mã khuyến mãi</Text>
                    <Text style={styles.text}>{selectedVoucher?.code}</Text>

                    <View style={styles.buttonRow}>
                      <TouchableOpacity style={[styles.viewButton, styles.primaryButton]} onPress={() => setIsEditing(true)}>
                        <Text style={styles.viewButtonText}>Chỉnh sửa</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.viewButton, styles.deleteButton]} onPress={() => handleDelete(selectedVoucher!.id)}>
                        <Text style={styles.viewButtonText}>Xoá</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={[styles.viewButton, styles.closeButton]} onPress={() => setModalVisible(false)}>
                      <Text style={styles.viewButtonText}>Đóng</Text>
                    </TouchableOpacity>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F4' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  voucherCard: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, padding: 16, elevation: 2 },
  expired: { opacity: 0.6 },
  voucherContent: { flexDirection: 'row', justifyContent: 'space-between' },
  voucherLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  voucherImage: { width: 60, height: 60, marginRight: 12, borderRadius: 8 },
  voucherInfo: { flex: 1 },
  voucherTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4, color: '#333' },
  voucherDescription: { fontSize: 14, color: '#666', marginBottom: 4 },
  voucherDetails: { gap: 4 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 12, color: '#666' },
  voucherRight: { alignItems: 'center', justifyContent: 'center', marginLeft: 16 },
  discountText: { fontSize: 18, fontWeight: 'bold', color: '#4AA366' },
  usedOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.85)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8 },
  usedText: { color: 'red', fontSize: 14, fontWeight: '600' },
  input: { borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 10, padding: 8, fontSize: 14, color: '#333' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: 340 },
  label: { fontSize: 15, fontWeight: '600', marginTop: 10, marginBottom: 4, color: '#333' },
  text: { fontSize: 14, color: '#555', marginBottom: 6 },
  viewButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  viewButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 16 },
  primaryButton: { backgroundColor: '#007bff' },
  successButton: { backgroundColor: '#28a745' },
  deleteButton: { backgroundColor: '#6c757d' },
  cancelButton: { backgroundColor: '#dc3545' },
  closeButton: { backgroundColor: '#17a2b8', marginTop: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333', margin: 16, textAlign: 'center' },
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
    elevation: 5,
  },
});

export default ManagePromotions;
