import type React from "react"
import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  TextInput,
} from "react-native"

// Định nghĩa interface cho dữ liệu
interface OrderItem {
  id: number
  name: string
  quantity: number
  price: number
}

interface Order {
  id: number
  status: string
  createdAt: string
  total: number
  items: OrderItem[]
}

const ManageOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState<string>("")
  const [cancelModalVisible, setCancelModalVisible] = useState<boolean>(false)
  const [pendingCancelOrderId, setPendingCancelOrderId] = useState<number | null>(null)

  // Fetch orders với TypeScript
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://192.168.11.108:8080/api/orders/admin", {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`)
        }

        const data = await response.json()
        // Map API data to match Order interface
        const mappedOrders: Order[] = (data ?? []).map((order: any) => ({
          id: order._id, // Map _id to id
          status: order.status,
          createdAt: order.createdAt,
          total: order.total,
          items: order.items.map((item: any) => ({
            id: item._id, // Map item _id to id
            name: item.name,
            quantity: item.quantity,
            price: item.price || 0, // Add price if available, or default to 0
          })),
        }))

        // Filter valid orders (optional, as mapping ensures correct structure)
        const validOrders = mappedOrders.filter(
          (order): order is Order => typeof order.id === "string" && order.id !== null,
        )
        setOrders(validOrders)
        setLoading(false)
      } catch (error) {
        console.error("Lỗi khi lấy danh sách đơn hàng:", error)
        setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại.")
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Cập nhật trạng thái đơn hàng
  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const requestBody: any = { status: newStatus }

      // Nếu status là cancelled, cần thêm cancelReason
      if (newStatus === "cancelled" && !cancelReason.trim()) {
        setError("Vui lòng nhập lý do hủy đơn hàng")
        return
      }

      if (newStatus === "cancelled") {
        requestBody.cancelReason = cancelReason.trim()
      }

      const response = await fetch(`http://192.168.11.108:8080/api/orders/admin/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Không thể cập nhật trạng thái đơn hàng")
      }

      const result = await response.json()

      if (result.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)),
        )

        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus })
        }

        // Reset cancel reason sau khi cập nhật thành công
        setCancelReason("")
        setError(null)
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error)
      if (error instanceof Error) {
        setError(error.message || "Không thể cập nhật trạng thái đơn hàng")
      } else {
        setError("Không thể cập nhật trạng thái đơn hàng")
      }
    }
  }

  // Xử lý khi click vào button cancelled
  const handleCancelOrder = (orderId: number) => {
    setPendingCancelOrderId(orderId)
    setCancelModalVisible(true)
  }

  // Confirm cancel order với reason
  const confirmCancelOrder = async () => {
    if (!pendingCancelOrderId || !cancelReason.trim()) {
      setError("Vui lòng nhập lý do hủy đơn hàng")
      return
    }

    try {
      const response = await fetch(`http://192.168.11.108:8080/api/orders/admin/${pendingCancelOrderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          status: "cancelled",
          cancelReason: cancelReason.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Không thể hủy đơn hàng")
      }

      const result = await response.json()

      if (result.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) => (order.id === pendingCancelOrderId ? { ...order, status: "cancelled" } : order)),
        )

        if (selectedOrder?.id === pendingCancelOrderId) {
          setSelectedOrder({ ...selectedOrder, status: "cancelled" })
        }

        // Reset states
        setCancelReason("")
        setCancelModalVisible(false)
        setPendingCancelOrderId(null)
        setError(null)
      }
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error)
      if (error instanceof Error) {
        setError(error.message || "Không thể hủy đơn hàng")
      } else {
        setError("Không thể hủy đơn hàng")
      }
    }
  }

  // Lấy màu sắc và icon cho trạng thái
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return { color: "#FF8C00", backgroundColor: "#FFF4E6", icon: "⏳" }
      case "processing":
        return { color: "#1E90FF", backgroundColor: "#E6F3FF", icon: "⚡" }
      case "preparing":
        return { color: "#9C27B0", backgroundColor: "#F3E5F5", icon: "👨‍🍳" }
      case "ready":
        return { color: "#4CAF50", backgroundColor: "#E8F5E8", icon: "✅" }
      case "delivering":
        return { color: "#FF9800", backgroundColor: "#FFF3E0", icon: "🚚" }
      case "completed":
        return { color: "#32CD32", backgroundColor: "#F0FFF0", icon: "🎉" }
      case "cancelled":
        return { color: "#FF6B6B", backgroundColor: "#FFE6E6", icon: "❌" }
      default:
        return { color: "#666", backgroundColor: "#F5F5F5", icon: "❓" }
    }
  }

  // Lấy tên trạng thái tiếng Việt
  const getStatusText = (status: string): string => {
    switch (status.toLowerCase()) {
      case "pending":
        return "Chờ xử lý"
      case "processing":
        return "Đang xử lý"
      case "preparing":
        return "Đang chuẩn bị"
      case "ready":
        return "Sẵn sàng"
      case "delivering":
        return "Đang giao"
      case "completed":
        return "Hoàn thành"
      case "cancelled":
        return "Đã hủy"
      default:
        return "Không xác định"
    }
  }

  // Render item đơn hàng với useCallback để tối ưu
  const renderOrderItem = useCallback(({ item }: { item: Order }) => {
    const statusStyle = getStatusStyle(item.status)

    return (
      <TouchableOpacity
        style={styles.orderItem}
        onPress={() => {
          setSelectedOrder(item)
          setModalVisible(true)
        }}
        activeOpacity={0.7}
      >
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View style={styles.orderIdContainer}>
              <Text style={styles.orderIdLabel}>Đơn hàng</Text>
              <Text style={styles.orderId}>#{item.id}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
              <Text style={styles.statusIcon}>{statusStyle.icon}</Text>
              <Text style={[styles.orderStatus, { color: statusStyle.color }]}>{getStatusText(item.status)}</Text>
            </View>
          </View>

          <View style={styles.orderInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📅</Text>
              <Text style={styles.orderDate}>
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>💰</Text>
              <Text style={styles.orderTotal}>{(item.total ?? 0).toLocaleString("vi-VN")} VNĐ</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📦</Text>
              <Text style={styles.itemCount}>{item.items?.length || 0} sản phẩm</Text>
            </View>
          </View>

          <View style={styles.viewDetailsContainer}>
            <Text style={styles.viewDetailsText}>Xem chi tiết →</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }, [])

  // Render chi tiết đơn hàng trong modal
  const renderOrderDetails = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {selectedOrder ? (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
                  <Text style={styles.modalOrderId}>#{selectedOrder.id}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Trạng thái đơn hàng</Text>
                  <View style={styles.statusButtonsContainer}>
                    {[
                      { key: "pending", label: "Chờ xử lý", icon: "⏳" },
                      { key: "processing", label: "Đang xử lý", icon: "⚡" },
                      { key: "preparing", label: "Đang chuẩn bị", icon: "👨‍🍳" },
                      { key: "ready", label: "Sẵn sàng", icon: "✅" },
                      { key: "delivering", label: "Đang giao", icon: "🚚" },
                      { key: "completed", label: "Hoàn thành", icon: "🎉" },
                    ].map((status) => {
                      const isSelected = selectedOrder.status === status.key
                      const statusStyle = getStatusStyle(status.key)

                      return (
                        <TouchableOpacity
                          key={status.key}
                          style={[
                            styles.statusButton,
                            {
                              backgroundColor: isSelected ? statusStyle.color : statusStyle.backgroundColor,
                              borderColor: statusStyle.color,
                            },
                            isSelected && styles.selectedStatusButton,
                          ]}
                          onPress={() => updateOrderStatus(selectedOrder.id, status.key)}
                          disabled={isSelected}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.statusButtonIcon}>{status.icon}</Text>
                          <Text style={[styles.statusButtonText, { color: isSelected ? "#fff" : statusStyle.color }]}>
                            {status.label}
                          </Text>
                        </TouchableOpacity>
                      )
                    })}

                    {/* Cancel button riêng */}
                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        styles.cancelButton,
                        {
                          backgroundColor: selectedOrder.status === "cancelled" ? "#FF6B6B" : "#FFE6E6",
                          borderColor: "#FF6B6B",
                        },
                        selectedOrder.status === "cancelled" && styles.selectedStatusButton,
                      ]}
                      onPress={() => handleCancelOrder(selectedOrder.id)}
                      disabled={selectedOrder.status === "cancelled"}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.statusButtonIcon}>❌</Text>
                      <Text
                        style={[
                          styles.statusButtonText,
                          {
                            color: selectedOrder.status === "cancelled" ? "#fff" : "#FF6B6B",
                          },
                        ]}
                      >
                        Đã hủy
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
                  <View style={styles.infoCard}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>📅 Ngày đặt:</Text>
                      <Text style={styles.infoValue}>
                        {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString("vi-VN") : "N/A"}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>💰 Tổng tiền:</Text>
                      <Text style={[styles.infoValue, styles.totalAmount]}>
                        {(selectedOrder.total ?? 0).toLocaleString("vi-VN")} VNĐ
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Danh sách sản phẩm</Text>
                  {selectedOrder.items?.length > 0 ? (
                    <View style={styles.itemsList}>
                      {selectedOrder.items.map((item, index) => (
                        <View key={item.id ?? index} style={styles.productItem}>
                          <View style={styles.productInfo}>
                            <Text style={styles.productName}>{item.name || "Không xác định"}</Text>
                            <View style={styles.productDetails}>
                              <Text style={styles.productQuantity}>SL: {item.quantity ?? 0}</Text>
                              {/* <Text style={styles.productPrice}>
                                {typeof item.price === "number" ? item.price.toLocaleString("vi-VN") : "0"} VNĐ
                              </Text> */}
                            </View>
                          </View>
                          <View style={styles.productTotal}>
                            <Text style={styles.productTotalText}>
                              {typeof item.price === "number" && typeof item.quantity === "number"
                                ? (item.price * item.quantity).toLocaleString("vi-VN")
                                : "0"}{" "}
                              VNĐ
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyIcon}>📦</Text>
                      <Text style={styles.emptyText}>Không có sản phẩm</Text>
                    </View>
                  )}
                </View>
              </>
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Đang tải...</Text>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)} activeOpacity={0.8}>
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )

  // Thêm Cancel Modal
  const renderCancelModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={cancelModalVisible}
      onRequestClose={() => setCancelModalVisible(false)}
    >
      <View style={styles.cancelModalContainer}>
        <View style={styles.cancelModalContent}>
          <Text style={styles.cancelModalTitle}>Hủy đơn hàng</Text>
          <Text style={styles.cancelModalSubtitle}>Vui lòng nhập lý do hủy đơn hàng #{pendingCancelOrderId}</Text>

          <TextInput
            style={styles.cancelReasonInput}
            placeholder="Nhập lý do hủy đơn hàng..."
            value={cancelReason}
            onChangeText={setCancelReason}
            multiline={true}
            numberOfLines={3}
            textAlignVertical="top"
          />

          <View style={styles.cancelModalButtons}>
            <TouchableOpacity
              style={styles.cancelModalButtonSecondary}
              onPress={() => {
                setCancelModalVisible(false)
                setCancelReason("")
                setPendingCancelOrderId(null)
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelModalButtonSecondaryText}>Hủy bỏ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelModalButtonPrimary} onPress={confirmCancelOrder} activeOpacity={0.7}>
              <Text style={styles.cancelModalButtonPrimaryText}>Xác nhận hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý đơn hàng</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải danh sách đơn hàng...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id?.toString() ?? `fallback-${Math.random().toString()}`}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>Không tìm thấy đơn hàng</Text>
              <Text style={styles.emptySubtext}>Các đơn hàng sẽ xuất hiện ở đây</Text>
            </View>
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          style={{ marginBottom: 32 }}
        />
      )}

      {modalVisible && renderOrderDetails()}
      {cancelModalVisible && renderCancelModal()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#007AFF",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6C757D",
    fontWeight: "400",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  orderItem: {
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F3F4",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  orderIdContainer: {
    flex: 1,
  },
  orderIdLabel: {
    fontSize: 14,
    color: "#6C757D",
    fontWeight: "500",
    marginBottom: 2,
  },
  orderId: {
    fontSize: 20,
    fontWeight: "700",
    color: "#212529",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 12,
  },
  statusIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: "600",
  },
  orderInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  orderDate: {
    fontSize: 15,
    color: "#495057",
    flex: 1,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "600",
    color: "#28A745",
    flex: 1,
  },
  itemCount: {
    fontSize: 15,
    color: "#495057",
    flex: 1,
  },
  viewDetailsContainer: {
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F3F4",
  },
  viewDetailsText: {
    fontSize: 15,
    color: "#007AFF",
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "100%",
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F4",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#212529",
    marginBottom: 4,
  },
  modalOrderId: {
    fontSize: 18,
    color: "#6C757D",
    fontWeight: "500",
  },
  modalSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F8F9FA",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 16,
  },
  statusButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: "47%",
    justifyContent: "center",
  },
  selectedStatusButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: "#495057",
    fontWeight: "500",
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    color: "#212529",
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },
  totalAmount: {
    color: "#28A745",
    fontSize: 16,
  },
  itemsList: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 4,
  },
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 6,
  },
  productDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  productQuantity: {
    fontSize: 14,
    color: "#6C757D",
  },
  productPrice: {
    fontSize: 14,
    color: "#495057",
    fontWeight: "500",
  },
  productTotal: {
    alignItems: "flex-end",
  },
  productTotalText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#28A745",
  },
  closeButton: {
    backgroundColor: "#007AFF",
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: "#6C757D",
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#ADB5BD",
    textAlign: "center",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3CD",
    borderColor: "#FFEAA7",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 16,
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#856404",
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#6C757D",
    marginTop: 12,
    fontWeight: "500",
  },
  cancelReasonInput: {
    borderWidth: 1,
    borderColor: "#CED4DA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#495057",
    backgroundColor: "#F8F9FA",
  },
  cancelButton: {
    width: "100%",
    marginTop: 8,
  },
  cancelModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  cancelModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  cancelModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#212529",
    textAlign: "center",
    marginBottom: 8,
  },
  cancelModalSubtitle: {
    fontSize: 14,
    color: "#6C757D",
    textAlign: "center",
    marginBottom: 20,
  },
  cancelModalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelModalButtonSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CED4DA",
    alignItems: "center",
  },
  cancelModalButtonSecondaryText: {
    fontSize: 16,
    color: "#6C757D",
    fontWeight: "500",
  },
  cancelModalButtonPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
  },
  cancelModalButtonPrimaryText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
})

export default ManageOrders
