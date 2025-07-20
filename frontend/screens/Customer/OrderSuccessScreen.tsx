// import React from 'react';
// import {  StyleSheet, ScrollView } from 'react-native';
// import OrderSuccessHeader from '../../components/order-success/OrderSuccessHeader';
// import OrderSummaryDetails from '../../components/order-success/OrderSummaryDetails';
// import OrderSuccessActions from '../../components/order-success/OrderSuccessActions';


// const OrderSuccessScreen = () => {
//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <OrderSuccessHeader />
//       <OrderSummaryDetails />
//       <OrderSuccessActions />
//     </ScrollView>
//   );
// };

// export default OrderSuccessScreen;

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 24,
//     backgroundColor: '#fff',
//     justifyContent: 'space-between',
//     paddingBottom: 100,
//   },
// });




// frontend/screens/Customer/OrderSuccessScreen.tsx
// import React, { useEffect } from 'react';
// import { StyleSheet, ScrollView, Text, ActivityIndicator, View } from 'react-native';
// import { useRoute, RouteProp } from '@react-navigation/native';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../redux/rootReducer';
// import { CustomerStackParamList } from '../../navigation/customer/CustomerStackNavigator';

// import OrderSuccessHeader from '../../components/order-success/OrderSuccessHeader';
// import OrderSummaryDetails from '../../components/order-success/OrderSummaryDetails';
// import OrderSuccessActions from '../../components/order-success/OrderSuccessActions';
// import { useAppDispatch } from '../../redux/hooks';
// import { fetchOrderById } from '../../redux/slices/orderSlice';

// // Định nghĩa kiểu cho route của OrderSuccessScreen
// type OrderSuccessScreenRouteProp = RouteProp<CustomerStackParamList, 'OrderSuccess'>;

// const OrderSuccessScreen = () => {
//   const route = useRoute<OrderSuccessScreenRouteProp>();
//   const { orderId } = route.params; // Lấy orderId từ params

//   const dispatch = useAppDispatch();

//   // Lấy currentOrder từ orderSlice
//   const { currentOrder, loading, error } = useSelector((state: RootState) => state.order);

//   // useEffect để đảm bảo order được fetch nếu chưa có (trường hợp load lại screen hoặc deep link)
//   useEffect(() => {
//     // Chỉ fetch nếu orderId tồn tại VÀ (chưa có currentOrder HOẶC currentOrder._id không khớp với orderId)
//     if (orderId && (!currentOrder || currentOrder._id !== orderId)) {
//       dispatch(fetchOrderById(orderId));
//     }
//   }, [orderId, currentOrder, dispatch]);

//   // Xử lý trạng thái loading/error/no data
//   if (loading && !currentOrder) {
//     return (
//       <View style={styles.centeredContainer}>
//         <ActivityIndicator size="large" color="#e53935" />
//         <Text style={styles.loadingText}>Đang tải chi tiết đơn hàng...</Text>
//       </View>
//     );
//   }

//   if (error && !currentOrder) {
//     return (
//       <View style={styles.centeredContainer}>
//         <Text style={styles.errorText}>Lỗi: Không thể tải chi tiết đơn hàng. {error}</Text>
//       </View>
//     );
//   }

//   // Nếu đã có orderId nhưng currentOrder chưa khớp hoặc chưa load xong
//   // hoặc currentOrder đã load nhưng không có dữ liệu (ví dụ orderId không hợp lệ)
//   if (!currentOrder || currentOrder._id !== orderId) {
//     return (
//       <View style={styles.centeredContainer}>
//         <Text style={styles.loadingText}>Đang chờ thông tin đơn hàng...</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <OrderSuccessHeader />
//       {/* ✅ Truyền đối tượng order đầy đủ xuống OrderSummaryDetails */}
//       <OrderSummaryDetails order={currentOrder} /> 
//       {/* ✅ Đảm bảo OrderSuccessActions nhận prop orderId nếu nó cần */}
//       <OrderSuccessActions  /> 
//     </ScrollView>
//   );
// };

// export default OrderSuccessScreen;

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 24,
//     backgroundColor: '#fff',
//     justifyContent: 'space-between',
//     paddingBottom: 100,
//   },
//   centeredContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#333',
//   },
//   errorText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: 'red',
//     textAlign: 'center',
//   },
// });



// frontend/screens/Customer/OrderSuccessScreen.tsx
import React, { useEffect } from 'react';
import { StyleSheet, ScrollView, Text, ActivityIndicator, View } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/rootReducer';
import { CustomerStackParamList } from '../../navigation/customer/CustomerStackNavigator';

import OrderSuccessHeader from '../../components/order-success/OrderSuccessHeader';
import OrderSummaryDetails from '../../components/order-success/OrderSummaryDetails';
import OrderSuccessActions from '../../components/order-success/OrderSuccessActions';
import { useAppDispatch } from '../../redux/hooks';
import { fetchOrderById } from '../../redux/slices/orderSlice';

type OrderSuccessScreenRouteProp = RouteProp<CustomerStackParamList, 'OrderSuccess'>;

const OrderSuccessScreen = () => {
  const route = useRoute<OrderSuccessScreenRouteProp>();
  const { orderId } = route.params; 

  const dispatch = useAppDispatch();

  const { currentOrder, loading, error } = useSelector((state: RootState) => state.order);

  // ✅ Thêm log để theo dõi orderId và trạng thái order
  useEffect(() => {
    console.log('OrderSuccessScreen: orderId from params:', orderId);
    console.log('OrderSuccessScreen: currentOrder in Redux state:', currentOrder);
    console.log('OrderSuccessScreen: loading state:', loading);
    console.log('OrderSuccessScreen: error state:', error);

    if (orderId && (!currentOrder || currentOrder._id !== orderId)) {
      console.log('OrderSuccessScreen: Dispatching fetchOrderById for:', orderId);
      dispatch(fetchOrderById(orderId));
    }
  }, [orderId, currentOrder, dispatch, loading, error]); // Thêm loading, error vào dependency array để theo dõi

  // ... (phần loading/error/no data display vẫn giữ nguyên)
  if (loading && !currentOrder) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#e53935" />
        <Text style={styles.loadingText}>Đang tải chi tiết đơn hàng...</Text>
      </View>
    );
  }

  if (error && !currentOrder) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Lỗi: Không thể tải chi tiết đơn hàng. {error}</Text>
      </View>
    );
  }

  if (!currentOrder || currentOrder._id !== orderId) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.loadingText}>Đang chờ thông tin đơn hàng...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <OrderSuccessHeader />
      <OrderSummaryDetails order={currentOrder} /> 
      {/* <OrderSuccessActions orderId={currentOrder._id} />  */}
       <OrderSuccessActions /> 
    </ScrollView>
  );
};

export default OrderSuccessScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    paddingBottom: 100,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});