import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, RefreshControl, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { ShipperStackParamList } from "../../navigation/shipper/ShipperNavigator"
import { shipperAPI } from "../../api/axios"

type NavigationProp = StackNavigationProp<ShipperStackParamList, "DeliveryHistory">

interface HistoryOrder {
  _id: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  status: "completed" | "cancelled"
  total: number
  deliveryAddress: string
  phone: string
  createdAt: string
  deliveryFee: number
  cancelReason?: string
}

interface HistoryStats {
  totalCompleted: number
  totalCancelled: number
}

const DeliveryHistory = () => {
  const navigation = useNavigation<NavigationProp>()
  const [orders, setOrders] = useState<HistoryOrder[]>([])
  const [stats, setStats] = useState<HistoryStats>({ totalCompleted: 0, totalCancelled: 0 })
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<"day" | "week" | "month">("day")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchHistory = async (pageNum = 1, filterType = filter, reset = false) => {
    try {
      if (pageNum === 1) setLoading(true)

      const response = await shipperAPI.getDeliveryHistory({
        page: pageNum,
        limit: 10,
        filter: filterType,
      })

      if (reset || pageNum === 1) {
        setOrders(response.orders || [])
      } else {
        setOrders((prev) => [...prev, ...(response.orders || [])])
      }

      setStats(response.stats || { totalCompleted: 0, totalCancelled: 0 })
      setHasMore(response.pagination?.currentPage < response.pagination?.totalPages)
    } catch (error) {
      console.error("Error fetching delivery history:", error)
      Alert.alert("Lỗi", "Không thể tải lịch sử giao hàng")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchHistory(1, filter, true)
    setPage(1)
  }, [filter])

  const onRefresh = () => {
    setRefreshing(true)
    setPage(1)
    fetchHistory(1, filter, true)
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchHistory(nextPage, filter, false)
    }
  }

  const handleFilterChange = (newFilter: "day" | "week" | "month") => {
    setFilter(newFilter)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getCustomerName = (phone: string) => {
    return `Khách hàng ${phone.slice(-4)}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#4CAF50"
      case "cancelled":
        return "#FF5722"
      default:
        return "#666666"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Đã giao"
      case "cancelled":
        return "Đã hủy"
      default:
        return status
    }
  }

  const getFilterText = (filterType: string) => {
    switch (filterType) {
      case "day":
        return "Hôm nay"
      case "week":
        return "Tuần này"
      case "month":
        return "Tháng này"
      default:
        return filterType
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử giao hàng</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: "#4CAF50" }]}>{stats.totalCompleted}</Text>
          <Text style={styles.statLabel}>Đã giao</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: "#FF5722" }]}>{stats.totalCancelled}</Text>
          <Text style={styles.statLabel}>Đã hủy</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalCompleted + stats.totalCancelled}</Text>
          <Text style={styles.statLabel}>Tổng đơn</Text>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {(["day", "week", "month"] as const).map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[styles.filterButton, filter === filterType && styles.filterButtonActive]}
            onPress={() => handleFilterChange(filterType)}
          >
            <Text style={[styles.filterText, filter === filterType && styles.filterTextActive]}>
              {getFilterText(filterType)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.ordersList}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20
          if (isCloseToBottom) {
            loadMore()
          }
        }}
        scrollEventThrottle={400}
      >
        {loading && orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Đang tải...</Text>
          </View>
        ) : (
          <>
            {orders.map((order) => (
              <View key={order._id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.customerName}>{getCustomerName(order.phone)}</Text>
                    <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                  </View>
                  <View style={styles.statusContainer}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                      <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.addressContainer}>
                  <Text style={styles.addressLabel}>Địa chỉ giao:</Text>
                  <Text style={styles.addressText}>{order.deliveryAddress}</Text>
                </View>

                <View style={styles.orderDetails}>
                  <Text style={styles.orderItems}>
                    {order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}
                  </Text>
                </View>

                {order.cancelReason && (
                  <View style={styles.cancelReasonContainer}>
                    <Text style={styles.cancelReasonLabel}>Lý do hủy:</Text>
                    <Text style={styles.cancelReasonText}>{order.cancelReason}</Text>
                  </View>
                )}

                <View style={styles.orderFooter}>
                  <View style={styles.orderMeta}>
                    <Text style={styles.phoneText}>{order.phone}</Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.totalAmount}>Tổng: {order.total.toLocaleString("vi-VN")}đ</Text>
                    <Text style={styles.deliveryFee}>Phí GH: {order.deliveryFee.toLocaleString("vi-VN")}đ</Text>
                  </View>
                </View>
              </View>
            ))}

            {orders.length === 0 && !loading && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Không có lịch sử giao hàng</Text>
                <Text style={styles.emptySubtext}>Các đơn hàng đã giao sẽ xuất hiện ở đây</Text>
              </View>
            )}

            {loading && orders.length > 0 && (
              <View style={styles.loadingMore}>
                <Text style={styles.loadingText}>Đang tải thêm...</Text>
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerRight: {
    width: 24,
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
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterButtonActive: {
    backgroundColor: "#FF6B35",
    borderColor: "#FF6B35",
  },
  filterText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  ordersList: {
    flex: 1,
    paddingHorizontal: 20,
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
    marginBottom: 12,
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
  orderDate: {
    fontSize: 12,
    color: "#666666",
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  addressContainer: {
    marginBottom: 12,
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
    marginBottom: 12,
  },
  orderItems: {
    fontSize: 14,
    color: "#333333",
    lineHeight: 20,
  },
  cancelReasonContainer: {
    backgroundColor: "#FFF3E0",
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  cancelReasonLabel: {
    fontSize: 12,
    color: "#E65100",
    fontWeight: "600",
    marginBottom: 2,
  },
  cancelReasonText: {
    fontSize: 12,
    color: "#E65100",
    fontStyle: "italic",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  orderMeta: {
    flex: 1,
  },
  phoneText: {
    fontSize: 12,
    color: "#666666",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 2,
  },
  deliveryFee: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
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
  loadingMore: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: "#666666",
  },
})

export default DeliveryHistory
