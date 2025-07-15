// import React from 'react';
// import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState } from '../../redux/store';
// import { setOrderInfo } from '../../redux/slices/orderSlice';
// import uuid from 'react-native-uuid';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { CustomerStackParamList } from '../../navigation/customer/CustomerStackNavigator';

// import { addOrder } from '../../data/orders';

// const PlaceOrderButton = ({
//   location,
//   phone,
//   paymentMethod,
// }: {
//   location: string;
//   phone: string;
//   paymentMethod: 'cod' | 'vnpay';
// }) => {
//   const navigation = useNavigation<NativeStackNavigationProp<CustomerStackParamList>>();
//   const dispatch = useDispatch();
//   const cart = useSelector((state: RootState) => state.cart);

//   const handlePlaceOrder = () => {
//     if (!cart.items.length) {
//       Alert.alert('Cart is empty');
//       return;
//     }

//     const now = new Date();
//     const id = String(uuid.v4()); // ✅ generate uuid
//     const orderNumber = `#ORD-${id.slice(0, 6)}`; // ✅ generate orderNumber
//     const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
//     const tax = Math.round(subtotal * cart.taxRate);
//     const total = subtotal + tax + cart.delivery;

//     const order = {
//       id,
//       orderNumber,
//       items: cart.items,
//       total,
//       address: location,
//       paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'VNPAY',
//       deliveryTime: '25–35 mins',
//       date: now.toLocaleDateString('en-CA'),
//       time: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
//       status: 'Processing' as const,
//       estimatedDelivery: '25–35 mins',
//       deliveryAddress: location,
//       phoneNumber: phone,
//     };

//     dispatch(setOrderInfo(order));
//     addOrder(order); // ✅ thêm order vào danh sách hiện tại
//     navigation.navigate('OrderSuccess');
//   };

//   return (
//     <TouchableOpacity style={styles.button} onPress={handlePlaceOrder}>
//       <Text style={styles.buttonText}>Đặt Hàng</Text>
//     </TouchableOpacity>
//   );
// };

// export default PlaceOrderButton;

// const styles = StyleSheet.create({
//   button: {
//     backgroundColor: '#e53935',
//     paddingVertical: 14,
//     borderRadius: 28,
//     alignItems: 'center',
//     marginVertical: 10,
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native'; // Thêm ActivityIndicator
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '../../redux/hooks'; // ✅ Import useAppDispatch
import { useSelector } from 'react-redux'; // Giữ lại useSelector
import { RootState } from '../../redux/rootReducer'; // Sử dụng RootState từ rootReducer
import { createOrder, fetchOrderById, resetOrderState } from '../../redux/slices/orderSlice'; // ✅ Import thunks và action từ orderSlice
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../navigation/customer/CustomerStackNavigator'; // Đảm bảo đúng đường dẫn

type Props = {
  location: string;
  phone: string;
  paymentMethod: 'cod' | 'vnpay';
  onPress: () => void; // ✅ Đảm bảo dòng này CÓ
  isLoading: boolean; // ✅ Đảm bảo dòng này CÓ
};

const PlaceOrderButton: React.FC<Props> = ({
  location,
  phone,
  paymentMethod,
  onPress, // Destructure nó ra đây
  isLoading, // Destructure nó ra đây
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<CustomerStackParamList, 'OrderSuccess'>>();
  const dispatch = useAppDispatch(); // ✅ Sử dụng useAppDispatch
  const cart = useSelector((state: RootState) => state.cart);
  const userProfile = useSelector((state: RootState) => state.user.profile); // Lấy userProfile để kiểm tra

  const handlePlaceOrder = async () => {
    // Kiểm tra giỏ hàng trống
    if (!cart.items || cart.items.length === 0) {
      Alert.alert('Lỗi', 'Giỏ hàng của bạn đang trống.');
      return;
    }

    // Kiểm tra thông tin người dùng và storeId
    // Đây là các kiểm tra cần có trước khi gọi API
    if (!userProfile) {
        Alert.alert('Lỗi', 'Thông tin người dùng chưa được tải. Vui lòng thử lại.');
        return;
    }
    // Giả định storeId có trong cart state (như đã bàn luận trước)
    if (!cart.storeId) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin cửa hàng trong giỏ hàng. Vui lòng thử lại.');
        return;
    }

    // ✅ Dispatch thunk để tạo đơn hàng
    // LƯU Ý: createOrder thunk sẽ trả về orderId khi thành công
    const resultAction = await dispatch(createOrder({
      deliveryAddress: location, // Địa chỉ giao hàng
      phone: phone,             // Số điện thoại
      paymentMethod: paymentMethod, // Phương thức thanh toán
      storeId: cart.storeId,    // ID cửa hàng từ giỏ hàng
    }));

    // Kiểm tra kết quả của action createOrder
    if (createOrder.fulfilled.match(resultAction)) {
      const newOrderId = resultAction.payload; // Payload của fulfilled action là orderId
      // Ngay lập tức fetch chi tiết đơn hàng sau khi tạo thành công
      dispatch(fetchOrderById(newOrderId));
      // Điều hướng sẽ được xử lý trong CheckoutScreen sau khi fetchOrderById thành công
      // navigation.navigate('OrderSuccess', { orderId: newOrderId }); // Comment out này vì CheckoutScreen sẽ xử lý điều hướng
    } else if (createOrder.rejected.match(resultAction)) {
      // Xử lý lỗi nếu createOrder thất bại (Alert đã có trong CheckoutScreen)
      // Alert.alert('Đặt hàng thất bại', resultAction.payload as string);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, isLoading && styles.buttonDisabled]}
      onPress={handlePlaceOrder}
      disabled={isLoading} // Vô hiệu hóa nút khi đang tải
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" /> // Hiển thị spinner
      ) : (
        <Text style={styles.buttonText}>Đặt Hàng</Text>
      )}
    </TouchableOpacity>
  );
};

export default PlaceOrderButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#e53935',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    marginVertical: 10,
    elevation: 3, // Thêm elevation cho hiệu ứng nổi
  },
  buttonDisabled: {
    backgroundColor: '#e5393580', // Màu mờ hơn khi disabled
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
