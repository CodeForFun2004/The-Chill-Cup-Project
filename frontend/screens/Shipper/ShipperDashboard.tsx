import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Switch,
  Alert,
  RefreshControl,
} from "react-native"
import { useNavigation, CommonActions, useFocusEffect } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { ShipperStackParamList } from "../../navigation/shipper/ShipperNavigator"
import { useDispatch } from "react-redux"
import { logoutUser } from "../../redux/slices/authSlice"
import { shipperAPI } from "../../api/axios"

type NavigationProp = StackNavigationProp<ShipperStackParamList, "ShipperDashboard">

interface DeliveryOrder {
  _id: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  status: "ready" | "delivering" | "completed" | "cancelled"
  total: number
  deliveryAddress: string
  phone: string
  createdAt: string
  deliveryFee: number
}

const ShipperDashboard = () => {
  const navigation = useNavigation<NavigationProp>()
  const [isOnline, setIsOnline] = useState(true)
  const [currentEarnings, setCurrentEarnings] = useState(0)
  const [completedOrders, setCompletedOrders] = useState(0)
  const [pendingOrders, setPendingOrders] = useState<DeliveryOrder[]>([])
  const [deliveringOrders, setDeliveringOrders] = useState<DeliveryOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const dispatch = useDispatch()

  // Fetch dữ liệu từ API
  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch pending orders (ready)
      const pendingResponse = await shipperAPI.getOrders({
        status: "ready",
        page: 1,
        limit: 20,
      })
      setPendingOrders(pendingResponse.orders || [])

      // Fetch delivering orders
      const deliveringResponse = await shipperAPI.getOrders({
        status: "delivering",
        page: 1,
        limit: 20,
      })
      setDeliveringOrders(deliveringResponse.orders || [])

      // Fetch earnings summary
      const earningsResponse = await shipperAPI.getEarningsSummary({
        filter: "day",
      })
      setCurrentEarnings(earningsResponse.totalEarnings || 0)
      setCompletedOrders(earningsResponse.totalOrders || 0)
    } catch (error) {
      console.error("Error fetching data:", error)
      Alert.alert("Lỗi", "Không thể tải dữ liệu. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  // Load data khi component mount và khi focus
  useEffect(() => {
    fetchData()
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchData()
    }, []),
  )

  const handleAcceptOrder = (orderId: string) => {
    Alert.alert("Xác nhận", "Bạn có muốn nhận đơn hàng này không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Nhận đơn",
        onPress: async () => {
          try {
            // Cập nhật status thành delivering
            await shipperAPI.updateOrderStatus(orderId, "delivering")
            navigation.navigate("DeliveryDetail", { deliveryId: orderId })
            // Refresh data sau khi accept
            fetchData()
          } catch (error) {
            console.error("Error accepting order:", error)
            Alert.alert("Lỗi", "Không thể nhận đơn hàng. Vui lòng thử lại.")
          }
        },
      },
    ])
  }

  const toggleOnlineStatus = async () => {
    try {
      const newStatus = !isOnline
      await shipperAPI.toggleAvailability(newStatus)
      setIsOnline(newStatus)

      if (newStatus) {
        Alert.alert("Thông báo", "Bạn đã online và sẵn sàng nhận đơn!")
        // Refresh orders khi online
        fetchData()
      } else {
        Alert.alert("Thông báo", "Bạn đã offline. Sẽ không nhận được đơn mới.")
      }
    } catch (error) {
      console.error("Error toggling availability:", error)
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái. Vui lòng thử lại.")
    }
  }

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Huỷ" },
      {
        text: "Đăng xuất",
        onPress: async () => {
          await dispatch(logoutUser() as any)
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "Main" }],
            }),
          )
        },
        style: "destructive",
      },
    ])
  }

  const formatOrderTime = (createdAt: string) => {
    const date = new Date(createdAt)
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getCustomerName = (phone: string) => {
    // Tạm thời dùng số điện thoại, có thể cải thiện sau
    return `Khách hàng ${phone.slice(-4)}`
  }

  const handleContinueDelivery = (orderId: string) => {
    navigation.navigate("DeliveryDetail", { deliveryId: orderId })
  }

  const handleViewHistory = () => {
    navigation.navigate("DeliveryHistory")
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
          <Text style={[styles.statusText, { color: isOnline ? "#4CAF50" : "#757575" }]}>
            {isOnline ? "Online" : "Offline"}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={toggleOnlineStatus}
            trackColor={{ false: "#E0E0E0", true: "#4CAF50" }}
            thumbColor="#FFFFFF"
          />
        </View>
        {/* Right: History Button */}
        <TouchableOpacity style={styles.historyButton} onPress={handleViewHistory}>
          <Text style={styles.historyText}>📋</Text>
        </TouchableOpacity>
        {/* Right: Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <TouchableOpacity style={styles.statCard} onPress={handleViewHistory}>
          <Text style={styles.statValue}>{currentEarnings.toLocaleString("vi-VN")}đ</Text>
          <Text style={styles.statLabel}>Thu nhập hôm nay</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCard} onPress={handleViewHistory}>
          <Text style={styles.statValue}>{completedOrders}</Text>
          <Text style={styles.statLabel}>Đơn đã giao</Text>
        </TouchableOpacity>
      </View>

      {/* Orders Section */}
      <ScrollView
        style={styles.ordersSection}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Delivering Orders Section */}
        {deliveringOrders.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Đơn đang giao ({deliveringOrders.length})</Text>
            {deliveringOrders.map((order) => (
              <View key={order._id} style={[styles.orderCard, { borderLeftWidth: 4, borderLeftColor: "#FF6B35" }]}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.customerName}>{getCustomerName(order.phone)}</Text>
                    <Text style={styles.orderTime}>{formatOrderTime(order.createdAt)}</Text>
                  </View>
                  <View style={styles.feeContainer}>
                    <Text style={styles.feeAmount}>{order.deliveryFee.toLocaleString("vi-VN")}đ</Text>
                    <Text style={styles.feeLabel}>Phí giao hàng</Text>
                  </View>
                </View>

                <View style={styles.addressContainer}>
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
                    <Text style={styles.metaText}>{order.phone}</Text>
                    <Text style={styles.totalAmount}>Tổng: {order.total.toLocaleString("vi-VN")}đ</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.acceptButton, { backgroundColor: "#FF6B35" }]}
                  onPress={() => handleContinueDelivery(order._id)}
                >
                  <Text style={styles.acceptButtonText}>Tiếp tục giao hàng</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* Pending Orders Section */}
        <Text style={styles.sectionTitle}>Đơn hàng mới ({pendingOrders.length})</Text>

        {loading && pendingOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Đang tải...</Text>
          </View>
        ) : (
          <>
            {pendingOrders.map((order) => (
              <View key={order._id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.customerName}>{getCustomerName(order.phone)}</Text>
                    <Text style={styles.orderTime}>{formatOrderTime(order.createdAt)}</Text>
                  </View>
                  <View style={styles.feeContainer}>
                    <Text style={styles.feeAmount}>{order.deliveryFee.toLocaleString("vi-VN")}đ</Text>
                    <Text style={styles.feeLabel}>Phí giao hàng</Text>
                  </View>
                </View>

                <View style={styles.addressContainer}>
                  <View style={styles.addressRow}>
                    <View style={styles.addressDot} />
                    <View style={styles.addressContent}>
                      <Text style={styles.addressLabel}>Lấy hàng</Text>
                      <Text style={styles.addressText}>Cửa hàng</Text>
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
                    <Text style={styles.metaText}>{order.phone}</Text>
                    <Text style={styles.totalAmount}>Tổng: {order.total.toLocaleString("vi-VN")}đ</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.acceptButton} onPress={() => handleAcceptOrder(order._id)}>
                  <Text style={styles.acceptButtonText}>Nhận đơn</Text>
                </TouchableOpacity>
              </View>
            ))}

            {pendingOrders.length === 0 && !loading && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Không có đơn hàng mới</Text>
                <Text style={styles.emptySubtext}>Hãy chờ đợi, đơn hàng sẽ xuất hiện sớm thôi!</Text>
              </View>
            )}
          </>
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
    paddingTop: 50,
    paddingBottom: 16,
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
    marginRight: 4,
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
  historyButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 6,
    marginRight: 8,
  },
  historyText: {
    fontSize: 16,
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
