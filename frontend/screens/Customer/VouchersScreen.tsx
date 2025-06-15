import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type Voucher = {
  id: string;
  title: string;
  description: string;
  discount: string;
  expiryDate: string;
  minOrder: string;
  isUsed: boolean;
  image?: any;
};

const VouchersScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'available' | 'used'>('available');

  // Mock data for vouchers
  const vouchers: Voucher[] = [
    {
      id: '1',
      title: 'Giảm 20% cho đơn hàng đầu tiên',
      description: 'Áp dụng cho tất cả sản phẩm',
      discount: '20%',
      expiryDate: '31/12/2024',
      minOrder: '100,000đ',
      isUsed: false,
      image: require('../../assets/images/voucher/discount-20.png'),
    },
    {
      id: '2',
      title: 'Mua 1 tặng 1',
      description: 'Áp dụng cho menu Matcha',
      discount: 'Mua 1 tặng 1',
      expiryDate: '30/06/2024',
      minOrder: '50,000đ',
      isUsed: false,
      image: require('../../assets/images/voucher/discount-20.png'),
    },
    {
      id: '3',
      title: 'Giảm 50K cho đơn từ 200K',
      description: 'Áp dụng cho tất cả sản phẩm',
      discount: '50,000đ',
      expiryDate: '15/05/2024',
      minOrder: '200,000đ',
      isUsed: true,
      image: require('../../assets/images/voucher/discount-20.png'),
    },
  ];

  const filteredVouchers = vouchers.filter(voucher => 
    activeTab === 'available' ? !voucher.isUsed : voucher.isUsed
  );

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

  const VoucherCard = ({ voucher }: { voucher: Voucher }) => (
    <TouchableOpacity 
      style={[styles.voucherCard, voucher.isUsed && styles.usedVoucher]}
      onPress={() => !voucher.isUsed && navigation.navigate('ProductList' as never)}
    >
      <View style={styles.voucherContent}>
        <View style={styles.voucherLeft}>
          {voucher.image && (
            <Image source={voucher.image} style={styles.voucherImage} />
          )}
          <View style={styles.voucherInfo}>
            <Text style={styles.voucherTitle}>{voucher.title}</Text>
            <Text style={styles.voucherDescription}>{voucher.description}</Text>
            <View style={styles.voucherDetails}>
              <View style={styles.detailItem}>
                <MaterialIcons name="shopping-cart" size={14} color="#666" />
                <Text style={styles.detailText}>Đơn tối thiểu: {voucher.minOrder}</Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialIcons name="event" size={14} color="#666" />
                <Text style={styles.detailText}>HSD: {voucher.expiryDate}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.voucherRight}>
          <Text style={styles.discountText}>{voucher.discount}</Text>
          {!voucher.isUsed && (
            <TouchableOpacity style={styles.useButton}>
              <Text style={styles.useButtonText}>Sử dụng</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {voucher.isUsed && (
        <View style={styles.usedOverlay}>
          <MaterialIcons name="check-circle" size={24} color="#4AA366" />
          <Text style={styles.usedText}>Đã sử dụng</Text>
        </View>
      )}
    </TouchableOpacity>
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

      <ScrollView style={styles.voucherList}>
        {filteredVouchers.length > 0 ? (
          filteredVouchers.map(voucher => (
            <VoucherCard key={voucher.id} voucher={voucher} />
          ))
        ) : (
          <EmptyState />
        )}
      </ScrollView>
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
    flex: 1,
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
});

export default VouchersScreen; 