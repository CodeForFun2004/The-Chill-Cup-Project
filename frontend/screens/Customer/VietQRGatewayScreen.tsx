import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { RootState } from '../../redux/rootReducer';
import { fetchOrderById } from '../../redux/slices/orderSlice';
import { CustomerStackParamList } from '../../navigation/customer/CustomerStackNavigator';
import CheckoutHeader from '../../components/checkout/CheckoutHeader';
import { Ionicons } from '@expo/vector-icons'; // Import icon từ Expo

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

    const navigatedRef = useRef(false);

    useEffect(() => {
        if (orderId) {
            console.log('Fetching order details for VietQR payment:', orderId);
            dispatch(fetchOrderById(orderId));
        }
    }, [dispatch, orderId]);

    useEffect(() => {
        if (currentOrder && !loading && !navigatedRef.current) { 
            console.log('Order details loaded. Starting payment gateway timer.');
            const interval = setInterval(() => {
                setTimer(prevTimer => {
                    if (prevTimer <= 1) {
                        clearInterval(interval);
                        if (!navigatedRef.current) { 
                            console.log('Timer finished. Simulating successful payment and navigating.');
                            navigatedRef.current = true;
                            navigation.replace('OrderSuccess', { orderId: currentOrder._id });
                        }
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [currentOrder, loading, navigation]);

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
                    <ActivityIndicator size="large" color="#4AA366" />
                    <Text style={styles.loadingText}>Đang tạo mã QR, vui lòng chờ...</Text>
                </View>
            </View>
        );
    }
    
    return (
        <View style={styles.container}>
            <CheckoutHeader />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.qrSection}>
                    <Text style={styles.title}>Quét mã VietQR để thanh toán</Text>
                    
                    {currentOrder.qrCodeUrl ? (
                        <Image 
                            source={{ uri: currentOrder.qrCodeUrl }} 
                            style={styles.qrImage} 
                        />
                    ) : (
                        <Text style={styles.errorText}>Không tìm thấy mã QR</Text>
                    )}
                </View>

                <View style={styles.summarySection}>
                    <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
                    <View style={styles.infoRow}>
                        <Ionicons name="receipt-outline" size={20} color="#888" />
                        <Text style={styles.infoText}>Mã đơn hàng: <Text style={styles.boldText}>{currentOrder.orderNumber}</Text></Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="wallet-outline" size={20} color="#888" />
                        <Text style={styles.infoText}>Tổng tiền: <Text style={styles.totalText}>{currentOrder.total?.toLocaleString('vi-VN')} VNĐ</Text></Text>
                    </View>
                </View>

                <View style={styles.bankInfoContainer}>
                    <Text style={styles.sectionTitle}>Thông tin chuyển khoản</Text>
                    <View style={styles.bankInfoItem}>
                        <Text style={styles.bankInfoLabel}>Ngân hàng:</Text>
                        <Text style={styles.bankInfoValue}>Vietcombank</Text>
                    </View>
                    <View style={styles.bankInfoItem}>
                        <Text style={styles.bankInfoLabel}>Số tài khoản:</Text>
                        <Text style={styles.bankInfoValue}>19036735544018</Text>
                    </View>
                    <View style={styles.bankInfoItem}>
                        <Text style={styles.bankInfoLabel}>Chủ tài khoản:</Text>
                        <Text style={styles.bankInfoValue}>Dinh Quoc Huy</Text>
                    </View>
                </View>

                <View style={styles.noteSection}>
                    <Ionicons name="timer-outline" size={20} color="#fff" style={styles.timerIcon} />
                    <View style={styles.timerContent}>
                        <Text style={styles.timerText}>Tự động chuyển màn hình sau:</Text>
                        <Text style={styles.timerValue}>{timer}s</Text>
                    </View>
                </View>

                <Text style={styles.instructionText}>
                    Vui lòng chuyển khoản đúng số tiền và ghi rõ mã đơn hàng ({currentOrder.orderNumber}) vào nội dung để hệ thống tự động xác nhận.
                </Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7', // Màu nền nhẹ nhàng
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#4AA366',
        fontWeight: '500',
    },
    content: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#F7F7F7',
    },
    qrSection: {
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#4AA366',
        marginBottom: 15,
    },
    qrImage: {
        width: 250,
        height: 250,
        resizeMode: 'contain',
        marginBottom: 10,
        borderRadius: 8,
    },
    summarySection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    infoText: {
        fontSize: 16,
        color: '#555',
        marginLeft: 10,
    },
    boldText: {
        fontWeight: 'bold',
        color: '#4AA366',
    },
    totalText: {
        fontWeight: 'bold',
        color: '#E53935', // Màu đỏ nổi bật cho tổng tiền
        fontSize: 18,
    },
    bankInfoContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    bankInfoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    bankInfoLabel: {
        fontSize: 16,
        color: '#888',
    },
    bankInfoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    noteSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4AA366', // Màu chủ đạo
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    timerIcon: {
        marginRight: 10,
    },
    timerContent: {
        flex: 1,
    },
    timerText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
    },
    timerValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 5,
    },
    instructionText: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        lineHeight: 20,
        fontStyle: 'italic',
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        marginTop: 20,
        textAlign: 'center',
    },
});

export default VietQRGatewayScreen;