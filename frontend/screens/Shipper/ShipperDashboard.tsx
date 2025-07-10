import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, Switch, Alert } from "react-native"
import { useNavigation, CommonActions } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { ShipperStackParamList } from "../../navigation/shipper/ShipperNavigator"
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';

type NavigationProp = StackNavigationProp<ShipperStackParamList, "ShipperDashboard">

interface DeliveryOrder {
  id: string
  customerName: string
  customerPhone: string
  pickupAddress: string
  deliveryAddress: string
  distance: string
  estimatedTime: string
  fee: number
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  status: "pending" | "accepted" | "picked_up" | "delivered"
  orderTime: string
  totalAmount: number
}

const ShipperDashboard = () => {
  const navigation = useNavigation<NavigationProp>()
  const [isOnline, setIsOnline] = useState(true)
  const [currentEarnings, setCurrentEarnings] = useState(125000)
  const [completedOrders, setCompletedOrders] = useState(8)
  const dispatch = useDispatch();

  const pendingOrders: DeliveryOrder[] = [
    {
      id: "1",
      customerName: "Nguyễn Văn A",
      customerPhone: "0901234567",
      pickupAddress: "The Coffee House - 123 Nguyễn Huệ, Q1",
      deliveryAddress: "456 Lê Lợi, Quận 1, TP.HCM",
      distance: "2.5 km",
      estimatedTime: "15 phút",
      fee: 25000,
      items: [
        { name: "Trà sữa truyền thống", quantity: 2, price: 45000 },
        { name: "Bánh flan", quantity: 1, price: 15000 },
      ],
      status: "pending",
      orderTime: "14:30",
      totalAmount: 105000,
    },
    {
      id: "2",
      customerName: "Trần Thị B",
      customerPhone: "0907654321",
      pickupAddress: "Highlands Coffee - 789 Đồng Khởi, Q1",
      deliveryAddress: "321 Pasteur, Quận 3, TP.HCM",
      distance: "3.2 km",
      estimatedTime: "20 phút",
      fee: 30000,
      items: [
        { name: "Cà phê đen đá", quantity: 1, price: 25000 },
        { name: "Bánh croissant", quantity: 2, price: 35000 },
      ],
      status: "pending",
      orderTime: "14:45",
      totalAmount: 95000,
    },
  ]

  const handleAcceptOrder = (orderId: string) => {
    Alert.alert("Xác nhận", "Bạn có muốn nhận đơn hàng này không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Nhận đơn",
        onPress: () => {
          navigation.navigate("DeliveryDetail", { deliveryId: orderId })
        },
      },
    ])
  }

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline)
    if (!isOnline) {
      Alert.alert("Thông báo", "Bạn đã online và sẵn sàng nhận đơn!")
    } else {
      Alert.alert("Thông báo", "Bạn đã offline. Sẽ không nhận được đơn mới.")
    }
  }

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Huỷ' },
      {
        text: 'Đăng xuất',
        onPress: () => {
          dispatch(logout());
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'ShipperDashboard' }],
            })
          );
        },
        style: 'destructive',
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />

      {/* Header */}
      <View style={styles.header}>
        {/* Left: Avatar + Tên */}
        <View style={styles.headerLeft}>
          <Image
            source={{
              uri: "https://cl-wpml.careerlink.vn/cam-nang-viec-lam/wp-content/uploads/2023/02/28141652/3692229-1-1024x1024.jpg",
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.greeting}>Xin chào!</Text>
            <Text style={styles.shipperName}>Shipper</Text>
          </View>
        </View>

        {/* Center: Online Toggle */}
        <View style={styles.headerCenter}>
          <Text
            style={[
              styles.statusText,
              { color: isOnline ? "#4CAF50" : "#757575" },
            ]}
          >
            {isOnline ? "Online" : "Offline"}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={toggleOnlineStatus}
            trackColor={{ false: "#E0E0E0", true: "#4CAF50" }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Right: Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{currentEarnings.toLocaleString("vi-VN")}đ</Text>
          <Text style={styles.statLabel}>Thu nhập hôm nay</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{completedOrders}</Text>
          <Text style={styles.statLabel}>Đơn đã giao</Text>
        </View>
      </View>

      {/* Orders Section */}
      <ScrollView style={styles.ordersSection} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Đơn hàng mới ({pendingOrders.length})</Text>

        {pendingOrders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <Text style={styles.customerName}>{order.customerName}</Text>
                <Text style={styles.orderTime}>{order.orderTime}</Text>
              </View>
              <View style={styles.feeContainer}>
                <Text style={styles.feeAmount}>{order.fee.toLocaleString("vi-VN")}đ</Text>
                <Text style={styles.feeLabel}>Phí giao hàng</Text>
              </View>
            </View>

            <View style={styles.addressContainer}>
              <View style={styles.addressRow}>
                <View style={styles.addressDot} />
                <View style={styles.addressContent}>
                  <Text style={styles.addressLabel}>Lấy hàng</Text>
                  <Text style={styles.addressText}>{order.pickupAddress}</Text>
                </View>
              </View>

              <View style={styles.addressLine} />

              <View style={styles.addressRow}>
                <View style={[styles.addressDot, { backgroundColor: "#FF6B35" }]} />
                <View style={styles.addressContent}>
                  <Text style={styles.addressLabel}>Giao đến</Text>
                  <Text style={styles.addressText}>{order.deliveryAddress}</Text>
                </View>
              </View>
            </View>

            <View style={styles.orderDetails}>
              <Text style={styles.orderItems}>
                {order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}
              </Text>
              <View style={styles.orderMeta}>
                <Text style={styles.metaText}>
                  {order.distance} • {order.estimatedTime}
                </Text>
                <Text style={styles.totalAmount}>Tổng: {order.totalAmount.toLocaleString("vi-VN")}đ</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.acceptButton} onPress={() => handleAcceptOrder(order.id)}>
              <Text style={styles.acceptButtonText}>Nhận đơn</Text>
            </TouchableOpacity>
          </View>
        ))}

        {pendingOrders.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Không có đơn hàng mới</Text>
            <Text style={styles.emptySubtext}>Hãy chờ đợi, đơn hàng sẽ xuất hiện sớm thôi!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  greeting: {
    color: "#FFFFFF",
    fontSize: 14,
    opacity: 0.9,
  },
  shipperName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  onlineToggle: {
    alignItems: "center",
    marginRight: 12,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666666",
  },
  ordersSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  orderInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  orderTime: {
    fontSize: 12,
    color: "#666666",
  },
  feeContainer: {
    alignItems: "flex-end",
  },
  feeAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  feeLabel: {
    fontSize: 10,
    color: "#666666",
    marginTop: 2,
  },
  addressContainer: {
    marginBottom: 16,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  addressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginTop: 6,
    marginRight: 12,
  },
  addressLine: {
    width: 1,
    height: 20,
    backgroundColor: "#E0E0E0",
    marginLeft: 4,
    marginVertical: 4,
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 2,
  },
  addressText: {
    fontSize: 14,
    color: "#333333",
    lineHeight: 20,
  },
  orderDetails: {
    marginBottom: 16,
  },
  orderItems: {
    fontSize: 14,
    color: "#333333",
    marginBottom: 8,
    lineHeight: 20,
  },
  orderMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaText: {
    fontSize: 12,
    color: "#666666",
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  acceptButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999999",
    textAlign: "center",
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
})

export default ShipperDashboard
