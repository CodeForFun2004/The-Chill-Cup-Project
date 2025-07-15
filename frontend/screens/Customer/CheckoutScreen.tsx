// import React, { useState, useEffect } from 'react';
// import { View, ScrollView, StyleSheet } from 'react-native';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../redux/rootReducer'; // Đảm bảo đường dẫn này đúng

// import LocationInfo from '../../components/checkout/LocationInfo';
// import OrderSummary from '../../components/checkout/OrderSummary';
// import PaymentMethod from '../../components/checkout/PaymentMethod';
// import PlaceOrderButton from '../../components/checkout/PlaceOrderButton';
// import CheckoutHeader from '../../components/checkout/CheckoutHeader';

// const CheckoutScreen = () => {
//   const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'cod'>('cod');
//   // Khởi tạo state location và phone với giá trị mặc định rỗng hoặc 'N/A'
//   // Chúng ta sẽ cập nhật chúng bằng dữ liệu từ Redux sau
//   const [location, setLocation] = useState<string>('');
//   const [phone, setPhone] = useState<string>('');

//   // Lấy thông tin profile từ Redux store
//   const userProfile = useSelector((state: RootState) => state.user.profile);
//   const { subtotal, delivery, discountAmount, total } = useSelector((state: RootState) => state.cart);

//   // Sử dụng useEffect để cập nhật location và phone khi userProfile có dữ liệu
//   useEffect(() => {
//     if (userProfile) {
//       // Cập nhật địa chỉ và số điện thoại từ profile, nếu có
//       // Nếu không có, có thể để giá trị mặc định là rỗng hoặc một thông báo
//       setLocation(userProfile.address || 'Chưa có địa chỉ');
//       setPhone(userProfile.phone || 'Chưa có số điện thoại');
//     }
//   }, [userProfile]); // Dependency array: chạy lại khi userProfile thay đổi

//   console.log('===== CHECKOUT SCREEN =====');
//   console.log('Tạm tính: ', subtotal);
//   console.log('Phí ship: ', delivery);
//   console.log('Tổng tiền: ', total);
//   console.log('Current username: ', userProfile?.username);
  
//   console.log('Địa chỉ hiện tại:', location);
//   console.log('Số điện thoại hiện tại:', phone);


//   return (
//     <View style={styles.container}>
//       <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
//         <CheckoutHeader />
//         <LocationInfo
//           location={location}
//           phone={phone}
//           setLocation={setLocation}
//           setPhone={setPhone}
//         />
//         <OrderSummary subTotal={subtotal} delivery={delivery} discountAmount={discountAmount} total={total} />
//         <PaymentMethod selected={paymentMethod} onSelect={setPaymentMethod} />
//         <PlaceOrderButton
//           paymentMethod={paymentMethod}
//           location={location}
//           phone={phone}
//         />
//       </ScrollView>
//     </View>
//   );
// };

// export default CheckoutScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F4F4F4',
//     padding: 16,
//   },
// });


import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Alert, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '../../redux/hooks';
import { RootState } from '../../redux/rootReducer';
import { createOrder, fetchOrderById, resetOrderState } from '../../redux/slices/orderSlice'; // ✅ Import fetchOrderById

import LocationInfo from '../../components/checkout/LocationInfo';
import OrderSummary from '../../components/checkout/OrderSummary';
import PaymentMethod from '../../components/checkout/PaymentMethod';
import PlaceOrderButton from '../../components/checkout/PlaceOrderButton';
import CheckoutHeader from '../../components/checkout/CheckoutHeader';
import { CustomerStackParamList } from '../../navigation/customer/CustomerStackNavigator';
import { StackNavigationProp } from '@react-navigation/stack';

const CheckoutScreen = () => {
   // ✅ Định nghĩa kiểu cho navigation
   const navigation = useNavigation<StackNavigationProp<CustomerStackParamList, 'OrderSuccess'>>(); 
  const dispatch = useAppDispatch();

  const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'cod'>('cod');
  const [location, setLocation] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  const userProfile = useSelector((state: RootState) => state.user.profile);
  const { subtotal, delivery, discountAmount, total, storeId: cartStoreId } = useSelector((state: RootState) => state.cart);

  // Lấy trạng thái từ orderSlice
  const { loading: orderLoading, error: orderError, orderCreatedSuccessfully, currentOrder } = useSelector((state: RootState) => state.order);

  // Cập nhật location và phone từ userProfile
  useEffect(() => {
    if (userProfile) {
      setLocation(userProfile.address || 'Chưa có địa chỉ');
      setPhone(userProfile.phone || 'Chưa có số điện thoại');
    }
  }, [userProfile]);

  // ✅ Xử lý sau khi tạo đơn hàng thành công (createOrder.fulfilled)
  useEffect(() => {
    if (orderCreatedSuccessfully) {
      // Nếu orderCreatedSuccessfully là true, action.payload của createOrder
      // là orderId. Chúng ta sẽ fetch chi tiết order ngay lập tức.
      // currentOrder ở đây sẽ là null vì nó chưa được cập nhật bởi fetchOrderById
      // Redux Toolkit thunk returns a Promise with the result. We can chain it.
      // Tuy nhiên, việc kiểm tra orderCreatedSuccessfully là đủ để kích hoạt fetchOrderById
      // thông qua việc theo dõi orderCreatedSuccessfully.
      // Dòng này không thực sự cần thiết ở đây vì logic fetchOrderById sẽ nằm trong useEffect tiếp theo
      // hoặc trong action khi navigate.
    }
  }, [orderCreatedSuccessfully, dispatch]);


  // ✅ Xử lý sau khi fetch chi tiết đơn hàng thành công (fetchOrderById.fulfilled)
  // hoặc khi có lỗi trong quá trình tạo/fetch.
  useEffect(() => {
    // Nếu tạo đơn hàng thành công và currentOrder (chi tiết) đã có
    if (orderCreatedSuccessfully && currentOrder) {
      navigation.navigate('OrderSuccess', { orderId: currentOrder._id });
      dispatch(resetOrderState()); // Reset trạng thái order sau khi điều hướng
    } else if (orderError) {
      // Hiển thị thông báo lỗi
      Alert.alert('Lỗi đặt hàng', orderError);
      dispatch(resetOrderState()); // Reset trạng thái lỗi
    }
  }, [orderCreatedSuccessfully, currentOrder, orderError, navigation, dispatch]);


  const handlePlaceOrder = async () => {
    if (!userProfile) {
      Alert.alert('Lỗi', 'Thông tin người dùng chưa được tải. Vui lòng thử lại.');
      return;
    }
    if (!cartStoreId) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin cửa hàng. Vui lòng kiểm tra giỏ hàng.');
      return;
    }

    // Dispatch thunk để tạo đơn hàng.
    // Sau khi createOrder thành công, nó sẽ trả về orderId.
    // Chúng ta sẽ dùng orderId này để fetch chi tiết đơn hàng.
    const resultAction = await dispatch(createOrder({
      deliveryAddress: location,
      phone: phone,
      paymentMethod: paymentMethod,
      storeId: cartStoreId,
    }));

    // Kiểm tra xem createOrder có thành công không
    if (createOrder.fulfilled.match(resultAction)) {
        const newOrderId = resultAction.payload;
        // Dispatch fetchOrderById ngay lập tức với orderId vừa nhận được
        dispatch(fetchOrderById(newOrderId));
    }
  };

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
            location={location}
            phone={phone}
            paymentMethod={paymentMethod}
            onPress={handlePlaceOrder} // Kiểm tra lại dòng này
            isLoading={orderLoading} // Và dòng này
        />
      </ScrollView>

      {orderLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Đang đặt hàng...</Text>
        </View>
      )}
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
});