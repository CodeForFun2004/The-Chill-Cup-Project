import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import voucherImg from "../../assets/images/voucher/discount-20.png";
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchUserVouchers, UserVoucher, clearUserVoucherError } from '../../redux/slices/userVoucherSlice';
import { RootState } from '../../redux/rootReducer';
import Toast from 'react-native-toast-message';

// Component con để hiển thị từng voucher
const VoucherCard = ({ voucher, onUseVoucher }: { voucher: UserVoucher; onUseVoucher: (id: string) => void }) => (
  <TouchableOpacity
    style={[styles.voucherCard, voucher.isUsed !== false && styles.usedVoucher]}
    onPress={() => !voucher.isUsed && onUseVoucher(voucher._id)} // Chuyển sang màn hình ProductList nếu chưa dùng
    disabled={voucher.isUsed !== false} // Vô hiệu hóa khi đã dùng hoặc chưa nhận
  >
    <View style={styles.voucherContent}>
      <View style={styles.voucherLeft}>
        {voucher.image && (
          <Image source={voucher.image ? { uri: voucher.image } : voucherImg} style={styles.voucherImage} />
        )}
        <View style={styles.voucherInfo}>
          <Text style={styles.voucherTitle}>{voucher.title}</Text>
          <Text style={styles.voucherDescription}>{voucher.description}</Text>
          <View style={styles.voucherDetails}>
            <View style={styles.detailItem}>
              <MaterialIcons name="shopping-cart" size={14} color="#666" />
              <Text style={styles.detailText}>Đơn tối thiểu: {voucher.minOrder.toLocaleString('vi-VN')}đ</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="event" size={14} color="#666" />
              <Text style={styles.detailText}>HSD: {new Date(voucher.expiryDate).toLocaleDateString()}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="local-offer" size={16} color="#e53935" />
              <Text style={[styles.detailText, styles.promotionCodeText]}>Mã: {voucher.promotionCode}</Text>
            </View>
          </View>
        </View>
      </View>
      
    </View>
    {voucher.isUsed === true && (
      <View style={styles.usedOverlay}>
        <MaterialIcons name="check-circle" size={24} color="#4AA366" />
        <Text style={styles.usedText}>Đã sử dụng</Text>
      </View>
    )}
  </TouchableOpacity>
);

const VouchersScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'available' | 'used'>('available');
  const [refreshing, setRefreshing] = useState(false);

  const { vouchers, loading, error } = useAppSelector((state: RootState) => state.userVoucher);

  // Tải danh sách voucher khi tab thay đổi
  useEffect(() => {
    if (activeTab === 'available') {
      dispatch(fetchUserVouchers('false')); // Lấy các voucher chưa dùng
    } else {
      dispatch(fetchUserVouchers('true')); // Lấy các voucher đã dùng
    }
  }, [dispatch, activeTab]);

  // Xử lý lỗi
  useEffect(() => {
    if (error) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: error });
      dispatch(clearUserVoucherError());
    }
  }, [error, dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'available') {
      await dispatch(fetchUserVouchers('false'));
    } else {
      await dispatch(fetchUserVouchers('true'));
    }
    setRefreshing(false);
  };
  
  const handleUseVoucher = (id: string) => {
    // Logic này sẽ navigate sang màn hình sản phẩm
    // Bạn có thể lưu ID voucher đã chọn vào Redux để sử dụng ở màn hình Cart
    Toast.show({
      type: 'info',
      text1: 'Sử dụng voucher',
      text2: `Bạn đã chọn voucher có ID: ${id}`,
    });
    // Ví dụ: navigation.navigate('ProductList', { voucherId: id });
    navigation.navigate('ProductList' as never);
  };

  const filteredVouchers = vouchers.filter(v => v.isUsed !== null);

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="local-offer" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>
        {activeTab === 'available' ? 'Chưa có voucher nào' : 'Chưa sử dụng voucher nào'}
      </Text>
      <Text style={styles.emptyDescription}>
        {activeTab === 'available' 
          ? 'Hãy theo dõi để nhận các voucher hấp dẫn'
          : 'Các voucher đã sử dụng sẽ hiển thị ở đây'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vouchers của bạn</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'available' && styles.activeTab]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
            Có thể sử dụng
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'used' && styles.activeTab]}
          onPress={() => setActiveTab('used')}
        >
          <Text style={[styles.tabText, activeTab === 'used' && styles.activeTabText]}>
            Đã sử dụng
          </Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4AA366" />
        </View>
      ) : (
        <FlatList
          data={filteredVouchers}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <VoucherCard voucher={item} onUseVoucher={handleUseVoucher} />}
          contentContainerStyle={styles.voucherList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<EmptyState />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4AA366',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#4AA366',
    fontWeight: '600',
  },
  voucherList: {
    padding: 16,
  },
  voucherCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  usedVoucher: {
    opacity: 0.7,
  },
  voucherContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  voucherLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  voucherImage: {
    width: 60,
    height: 60,
    marginRight: 12,
    borderRadius: 8,
  },
  voucherInfo: {
    flex: 1,
  },
  voucherTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  voucherDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  voucherDetails: {
    gap: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  promotionCodeText: {
    color: '#e53935',
    fontWeight: 'bold',
    fontSize: 14,
  },
  voucherRight: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  discountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4AA366',
    marginBottom: 8,
  },
  useButton: {
    backgroundColor: '#4AA366',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  useButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  usedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  usedText: {
    color: '#4AA366',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VouchersScreen;