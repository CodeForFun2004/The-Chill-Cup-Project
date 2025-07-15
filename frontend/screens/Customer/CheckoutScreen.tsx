import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/rootReducer'; // Đảm bảo đường dẫn này đúng

import LocationInfo from '../../components/checkout/LocationInfo';
import OrderSummary from '../../components/checkout/OrderSummary';
import PaymentMethod from '../../components/checkout/PaymentMethod';
import PlaceOrderButton from '../../components/checkout/PlaceOrderButton';
import CheckoutHeader from '../../components/checkout/CheckoutHeader';

const CheckoutScreen = () => {
  const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'cod'>('cod');
  // Khởi tạo state location và phone với giá trị mặc định rỗng hoặc 'N/A'
  // Chúng ta sẽ cập nhật chúng bằng dữ liệu từ Redux sau
  const [location, setLocation] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  // Lấy thông tin profile từ Redux store
  const userProfile = useSelector((state: RootState) => state.user.profile);
  const { subtotal, delivery, discountAmount, total } = useSelector((state: RootState) => state.cart);

  // Sử dụng useEffect để cập nhật location và phone khi userProfile có dữ liệu
  useEffect(() => {
    if (userProfile) {
      // Cập nhật địa chỉ và số điện thoại từ profile, nếu có
      // Nếu không có, có thể để giá trị mặc định là rỗng hoặc một thông báo
      setLocation(userProfile.address || 'Chưa có địa chỉ');
      setPhone(userProfile.phone || 'Chưa có số điện thoại');
    }
  }, [userProfile]); // Dependency array: chạy lại khi userProfile thay đổi

  console.log('===== CHECKOUT SCREEN =====');
  console.log('Tạm tính: ', subtotal);
  console.log('Phí ship: ', delivery);
  console.log('Tổng tiền: ', total);
  console.log('Current username: ', userProfile?.username);
  
  console.log('Địa chỉ hiện tại:', location);
  console.log('Số điện thoại hiện tại:', phone);


  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <CheckoutHeader />
        <LocationInfo
          location={location}
          phone={phone}
          setLocation={setLocation}
          setPhone={setPhone}
        />
        <OrderSummary subTotal={subtotal} delivery={delivery} discountAmount={discountAmount} total={total} />
        <PaymentMethod selected={paymentMethod} onSelect={setPaymentMethod} />
        <PlaceOrderButton
          paymentMethod={paymentMethod}
          location={location}
          phone={phone}
        />
      </ScrollView>
    </View>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
    padding: 16,
  },
});