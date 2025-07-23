import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { RootState } from '../../redux/rootReducer';
import { fetchOrderById } from '../../redux/slices/orderSlice';
import { CustomerStackParamList } from '../../navigation/customer/CustomerStackNavigator';
import CheckoutHeader from '../../components/checkout/CheckoutHeader';

// Định nghĩa type cho route params
type VietQRGatewayRouteProp = RouteProp<CustomerStackParamList, 'VietQRGateway'>;
type VietQRGatewayNavigationProp = StackNavigationProp<CustomerStackParamList, 'VietQRGateway'>;

const VietQRGatewayScreen = () => {
    const route = useRoute<VietQRGatewayRouteProp>();
    const navigation = useNavigation<VietQRGatewayNavigationProp>();
    const dispatch = useAppDispatch();

    const { orderId } = route.params;

    const { currentOrder, loading, error } = useAppSelector((state: RootState) => state.order);
    const [timer, setTimer] = useState(30);

    // Sử dụng ref để đảm bảo việc điều hướng chỉ xảy ra một lần
    const navigatedRef = useRef(false);

    // Effect để fetch order
    useEffect(() => {
        if (orderId) {
            console.log('Fetching order details for VietQR payment:', orderId);
            dispatch(fetchOrderById(orderId));
        }
    }, [dispatch, orderId]);

    // Effect để xử lý timer và điều hướng
    useEffect(() => {
        // Chỉ chạy khi đã có order, không còn loading và chưa điều hướng
        if (currentOrder && !loading && !navigatedRef.current) { 
            console.log('Order details loaded. Starting payment gateway timer.');
            const interval = setInterval(() => {
                setTimer(prevTimer => {
                    if (prevTimer <= 1) {
                        clearInterval(interval);
                        // Chỉ điều hướng nếu chưa từng điều hướng
                        if (!navigatedRef.current) { 
                            console.log('Timer finished. Simulating successful payment and navigating.');
                            navigatedRef.current = true; // Đặt cờ là đã điều hướng
                            navigation.replace('OrderSuccess', { orderId: currentOrder._id });
                        }
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);

            return () => clearInterval(interval); // Clean-up function
        }
    }, [currentOrder, loading, navigation]);

    // Effect để xử lý lỗi
    useEffect(() => {
        if (error) {
            Alert.alert('Lỗi', `Không thể tải thông tin đơn hàng: ${error}`, [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        }
    }, [error, navigation]);

    if (loading || !currentOrder) {
        return (
            <View style={styles.container}>
                <CheckoutHeader />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.loadingText}>Đang tạo mã QR, vui lòng chờ...</Text>
                </View>
            </View>
        );
    }
    
    return (
        <View style={styles.container}>
            <CheckoutHeader />
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Quét mã VietQR để thanh toán</Text>
                
                {/* Hiển thị QR Code từ URL */}
                {currentOrder.qrCodeUrl ? (
                    <Image 
                        source={{ uri: currentOrder.qrCodeUrl }} 
                        style={styles.qrImage} 
                    />
                ) : (
                    <Text style={styles.errorText}>Không tìm thấy mã QR</Text>
                )}
                
                <Text style={styles.infoText}>Mã đơn hàng: <Text style={styles.boldText}>{currentOrder.orderNumber}</Text></Text>
                <Text style={styles.infoText}>Số tiền cần chuyển: <Text style={styles.boldText}>{currentOrder.total?.toLocaleString('vi-VN')} VNĐ</Text></Text>
                
                <View style={styles.timerContainer}>
                    <Text style={styles.timerText}>Tự động chuyển màn hình sau: </Text>
                    <Text style={styles.timerValue}>{timer}s</Text>
                </View>
                
                <Text style={styles.noteTitle}>Thông tin chuyển khoản</Text>
                <View style={styles.bankInfoContainer}>
                    <Text style={styles.bankInfoText}>Ngân hàng: <Text style={styles.bankInfoValue}>Vietcombank</Text></Text>
                    <Text style={styles.bankInfoText}>Số tài khoản: <Text style={styles.bankInfoValue}>19036735544018</Text></Text>
                    <Text style={styles.bankInfoText}>Chủ tài khoản: <Text style={styles.bankInfoValue}>Dinh Quoc Huy</Text></Text>
                </View>

                <Text style={styles.noteText}>
                    Lưu ý: Vui lòng chuyển khoản đúng số tiền và nội dung là mã đơn hàng để hệ thống tự động xác nhận.
                </Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333333',
    },
    content: {
        flexGrow: 1,
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 20,
    },
    qrImage: {
        width: 300,
        height: 300,
        resizeMode: 'contain',
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    infoText: {
        fontSize: 16,
        color: '#555555',
        marginBottom: 5,
        textAlign: 'center',
    },
    boldText: {
        fontWeight: 'bold',
        color: '#333333',
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        paddingVertical: 8,
        paddingHorizontal: 15,
        backgroundColor: '#E6F4FF',
        borderRadius: 20,
    },
    timerText: {
        fontSize: 16,
        color: '#333333',
    },
    timerValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007BFF',
    },
    noteTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginTop: 30,
        marginBottom: 10,
    },
    bankInfoContainer: {
        width: '100%',
        padding: 15,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    bankInfoText: {
        fontSize: 16,
        color: '#555555',
        marginBottom: 5,
    },
    bankInfoValue: {
        fontWeight: 'bold',
        color: '#333333',
    },
    noteText: {
        marginTop: 20,
        fontSize: 14,
        color: '#999999',
        textAlign: 'center',
        lineHeight: 20,
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        marginTop: 20,
        textAlign: 'center',
    },
});

export default VietQRGatewayScreen;