import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Alert, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '../../redux/hooks';
import { RootState } from '../../redux/rootReducer';
//import { createOrder, fetchOrderById, resetOrderState } from '../../redux/slices/orderSlice';
import { createOrder, resetOrderState } from '../../redux/slices/orderSlice';

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

    const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'cod'>('cod');
    const [location, setLocation] = useState<string>('');
    const [phone, setPhone] = useState<string>('');

    const userProfile = useSelector((state: RootState) => state.user.profile);
    // Bây giờ:
const cart = useSelector((state: RootState) => state.cart); 
const { subtotal, delivery, discountAmount, total, storeId: cartStoreId } = cart;

    // Lấy trạng thái từ orderSlice
    const { loading: orderLoading, error: orderError, orderCreatedSuccessfully, currentOrder } = useSelector((state: RootState) => state.order);


    // Reset trạng thái order khi vào CheckoutScreen (componentDidMount)
    useEffect(() => {
        dispatch(resetOrderState());
    }, [dispatch]);

    // Cập nhật location và phone từ userProfile
    useEffect(() => {
        if (userProfile) {
            setLocation(userProfile.address || 'Chưa có địa chỉ');
            setPhone(userProfile.phone || 'Chưa có số điện thoại');
        }
    }, [userProfile]);

    // ✅ Effect này sẽ xử lý điều hướng và thông báo lỗi
    // (Đây là phần quan trọng nhất để điều hướng đến OrderSuccessScreen)
    // Lưu lại orderId cũ để tránh điều hướng nhầm đơn cũ
    const prevOrderIdRef = useRef<string | undefined>(undefined);
    // useEffect(() => {
    //     // Nếu đơn hàng đã được tạo thành công và currentOrder mới
    //     if (orderCreatedSuccessfully && currentOrder && currentOrder._id !== prevOrderIdRef.current) {
    //         console.log('Order created and details fetched. Navigating to OrderSuccess.');
    //         prevOrderIdRef.current = currentOrder._id;
    //         navigation.navigate('OrderSuccess', { orderId: currentOrder._id });
    //     } 
    //     // Nếu có lỗi ở bất kỳ bước nào (tạo đơn hoặc fetch chi tiết)
    //     else if (orderError) {
    //         console.log('Order error:', orderError);
    //         Alert.alert('Lỗi đặt hàng', orderError);
    //         dispatch(resetOrderState()); 
    //     }
    // }, [orderCreatedSuccessfully, currentOrder, orderError, navigation, dispatch]);



    // Trong CheckoutScreen.tsx
useEffect(() => {
    // Nếu đơn hàng đã được tạo thành công và currentOrder đã có dữ liệu
    if (orderCreatedSuccessfully && currentOrder && currentOrder._id !== prevOrderIdRef.current) {
        prevOrderIdRef.current = currentOrder._id; // Lưu orderId cũ

        const { paymentMethod, _id: orderId } = currentOrder;

        if (paymentMethod === 'cod') {
            console.log('Order created with COD. Navigating to OrderSuccess.');
            // Điều hướng đến màn hình OrderSuccess với orderId
            navigation.navigate('OrderSuccess', { orderId });
        } else if (paymentMethod === 'vietqr') {
            console.log('Order created with VietQR. Navigating to VietQRGateway.');
            // Điều hướng đến màn hình VietQRGatewayScreen với orderId
            navigation.navigate('VietQRGateway', { orderId }); 
        } else {
            console.warn('Unknown payment method. Navigating to OrderSuccess as a fallback.');
            navigation.navigate('OrderSuccess', { orderId });
        }
    } 
    // Xử lý lỗi như bình thường
    else if (orderError) {
        console.log('Order error:', orderError);
        Alert.alert('Lỗi đặt hàng', orderError);
        dispatch(resetOrderState());
    }
}, [orderCreatedSuccessfully, currentOrder, orderError, navigation, dispatch]);

    // handlePlaceOrder không thay đổi nhiều, chỉ thêm một số kiểm tra
    const handlePlaceOrder = async () => {
        // Ngăn không cho gửi nhiều yêu cầu nếu đang trong quá trình xử lý
        if (orderLoading) {
            console.log('Order is already in progress. Skipping duplicate request.');
            return;
        }

        // Reset trạng thái order trước khi bắt đầu đặt hàng mới
        // Điều này đảm bảo trạng thái 'sạch' cho lần đặt hàng này
        dispatch(resetOrderState()); 

        if (!cart.items || cart.items.length === 0) {
            Alert.alert('Lỗi', 'Giỏ hàng của bạn đang trống.');
            return;
        }
        if (!userProfile) {
            Alert.alert('Lỗi', 'Thông tin người dùng chưa được tải. Vui lòng thử lại.');
            return;
        }
        // Đảm bảo storeId tồn tại (quan trọng cho API backend)
        if (!cartStoreId) {
            Alert.alert('Lỗi', 'Không tìm thấy thông tin cửa hàng trong giỏ hàng. Vui lòng kiểm tra giỏ hàng.');
            return;
        }

        // Dispatch thunk để tạo đơn hàng.
        // `await` ở đây để đảm bảo chúng ta nhận được kết quả của action `createOrder`
        const resultAction = await dispatch(createOrder({
            deliveryAddress: location,
            phone: phone,
            paymentMethod: paymentMethod,
            storeId: cartStoreId,
        }));

        // Kiểm tra xem `createOrder` có thành công hay không
        if (createOrder.fulfilled.match(resultAction)) {
            const newOrderId = resultAction.payload;
            console.log('createOrder fulfilled, new orderId:', newOrderId);
            // Tiếp tục dispatch `fetchOrderById` ngay lập tức để lấy chi tiết đơn hàng
            //dispatch(fetchOrderById(newOrderId));
        } 
        // Không cần `else if (createOrder.rejected.match(resultAction))` ở đây
        // vì `orderError` sẽ được set trong `orderSlice` và `useEffect` phía trên sẽ bắt lỗi
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
                {/* PlaceOrderButton nhận prop `isLoading` và `onPress` */}
                <PlaceOrderButton
                    location={location}
                    phone={phone}
                    paymentMethod={paymentMethod}
                    onPress={handlePlaceOrder}
                    isLoading={orderLoading}
                />
            </ScrollView>

            {/* Hiển thị overlay loading khi đang trong quá trình đặt hàng */}
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