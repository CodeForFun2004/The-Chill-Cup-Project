"use client"

import type React from "react"
import { useState, useCallback } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  type ListRenderItem,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSelector, useDispatch } from "react-redux"
import { useFocusEffect } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { StaffOrder } from "../../redux/slices/staffSlice"
import {
  fetchStaffOrders,
  updateOrderStatusByStaff,
  assignShipperToOrder,
  fetchAvailableShippers,
  setFilterStatus,
} from "../../redux/slices/staffSlice"

// Types
type StaffStackParamList = {
  StaffDashboard: undefined
  OrderManagement: undefined
}

type OrderManagementNavigationProp = NativeStackNavigationProp<StaffStackParamList, "OrderManagement">

interface OrderManagementScreenProps {
  navigation: OrderManagementNavigationProp
}

interface RootState {
  staff: {
    orders: StaffOrder[]
    filterStatus: "All" | "pending" | "processing" | "preparing" | "ready" | "delivering" | "completed" | "cancelled"
    loading: boolean
    error: string | null
    shippers: Array<{
      _id: string
      fullname: string
      staffId: string
      status: "available" | "assigned"
    }>
    shippersLoading: boolean
  }
}

const OrderManagementScreen: React.FC<OrderManagementScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch()
  const { orders, filterStatus, shippers, shippersLoading } = useSelector((state: RootState) => state.staff)

  const [selectedOrder, setSelectedOrder] = useState<StaffOrder | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showShipperModal, setShowShipperModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState("")

  // Focus effect để fetch orders
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchStaffOrders({}) as any)
    }, [dispatch])
  )

  // Filter options (sử dụng status viết thường như backend)
  const filterOptions = [
    { key: "All", title: "Tất cả", color: "#6B7280" },
    { key: "pending", title: "Chờ xử lý", color: "#F59E0B" },
    { key: "processing", title: "Đã xác nhận", color: "#3B82F6" },
    { key: "preparing", title: "Đang pha chế", color: "#8B5CF6" },
    { key: "ready", title: "Sẵn sàng", color: "#06B6D4" },
    { key: "delivering", title: "Đang giao", color: "#F97316" },
    { key: "completed", title: "Hoàn thành", color: "#10B981" },
    { key: "cancelled", title: "Đã hủy", color: "#DC2626" },
  ]

  // Status options for updating (sử dụng status viết thường)
  const statusOptions = [
    { key: "processing", title: "Xác nhận đơn hàng", icon: "checkmark-outline" },
    { key: "preparing", title: "Bắt đầu pha chế", icon: "restaurant-outline" },
    { key: "ready", title: "Sẵn sàng lấy", icon: "bag-check-outline" },
    { key: "delivering", title: "Đang giao hàng", icon: "bicycle-outline" },
    { key: "completed", title: "Hoàn thành", icon: "checkmark-circle-outline" },
  ]

  // Get filtered orders
  const getFilteredOrders = (): StaffOrder[] => {
    if (filterStatus === "All") {
      return orders
    }
    return orders.filter((order) => order.status === filterStatus)
  }

  // Get status color
  const getStatusColor = (status: StaffOrder["status"]): string => {
    const statusMap: Record<StaffOrder["status"], string> = {
      pending: "#F59E0B",
      processing: "#3B82F6",
      preparing: "#8B5CF6",
      ready: "#06B6D4",
      delivering: "#F97316",
      completed: "#10B981",
      cancelled: "#DC2626",
    }
    return statusMap[status] || "#6B7280"
  }

  // Get status title in Vietnamese
  const getStatusTitle = (status: StaffOrder["status"]): string => {
    const statusMap: Record<StaffOrder["status"], string> = {
      pending: "Chờ xử lý",
      processing: "Đang xử lý",
      preparing: "Đang pha chế",
      ready: "Sẵn sàng",
      delivering: "Đang giao",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    }
    return statusMap[status] || status
  }

  // Handle status update using API
  const handleStatusUpdate = (status: StaffOrder["status"]) => {
    if (selectedOrder) {
      handleStatusChange(selectedOrder, status)
      setSelectedOrder(null)
    }
  }

  // Handle confirm order
  const handleConfirmOrder = (orderId: string) => {
    dispatch(updateOrderStatusByStaff({ orderId, status: 'processing' }) as any)
  }

  // Handle status change with special logic for shipper assignment and cancel reason
  const handleStatusChange = async (order: StaffOrder, newStatus: string) => {
    if (newStatus === 'cancelled') {
      setSelectedOrder(order)
      setShowCancelModal(true)
    } else if (newStatus === 'delivering' && order.status === 'ready') {
      setSelectedOrder(order)
      dispatch(fetchAvailableShippers() as any)
      setShowShipperModal(true)
    } else {
      try {
        await dispatch(updateOrderStatusByStaff({ orderId: order._id, status: newStatus }) as any)
        dispatch(fetchStaffOrders({}) as any)
      } catch (error) {
        console.error('Error updating order status:', error)
      }
    }
    setShowStatusModal(false)
  }

  const handleAssignShipper = async (shipperId: string) => {
    if (selectedOrder) {
      // Tìm shipper được chọn
      const shipper = shippers.find(s => s._id === shipperId)
      if (shipper && shipper.status === 'available') {
        try {
          // Gán shipper và cập nhật trạng thái đơn hàng thành 'delivering'
          await dispatch(assignShipperToOrder({ orderId: selectedOrder._id, assignShipperId: shipper.staffId }) as any)
          await dispatch(updateOrderStatusByStaff({ orderId: selectedOrder._id, status: 'delivering' }) as any)
          dispatch(fetchStaffOrders({}) as any)
          setShowShipperModal(false)
        } catch (error) {
          console.error('Error assigning shipper:', error)
        }
      } else {
        Alert.alert('Chỉ có thể chọn shipper đang có sẵn!')
      }
    }
  }

  const handleCancelOrder = async () => {
    if (selectedOrder && cancelReason.trim()) {
      try {
        await dispatch(updateOrderStatusByStaff({ 
          orderId: selectedOrder._id, 
          status: 'cancelled',
          cancelReason: cancelReason.trim()
        }) as any)
        dispatch(fetchStaffOrders({}) as any)
        setShowCancelModal(false)
        setCancelReason("")
      } catch (error) {
        console.error('Error canceling order:', error)
      }
    }
  }

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const renderFilterTab = (filter: any) => {
    const isActive = filterStatus === filter.key
    const count = filter.key === "All" ? orders.length : orders.filter((o) => o.status === filter.key).length

    return (
      <TouchableOpacity
        key={filter.key}
        style={[styles.filterTab, isActive && { backgroundColor: filter.color + "15", borderColor: filter.color }]}
        onPress={() => dispatch(setFilterStatus(filter.key))}
        activeOpacity={0.7}
      >
        <Text style={[styles.filterTabText, { color: isActive ? filter.color : "#6B7280" }]}>{filter.title}</Text>
        {count > 0 && (
          <View style={[styles.filterBadge, { backgroundColor: filter.color }]}>
            <Text style={styles.filterBadgeText}>{count}</Text>
          </View>
        )}
      </TouchableOpacity>
    )
  }

  const renderOrderItem: ListRenderItem<StaffOrder> = ({ item }) => {
    const statusColor = getStatusColor(item.status)

    return (
      <View style={styles.orderCard}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
            <Text style={styles.customerName}>{item.customerName}</Text>
            <Text style={styles.orderTime}>
              {item.orderTime} • {item.orderType}
            </Text>
          </View>
          <View style={styles.orderStatus}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{getStatusTitle(item.status)}</Text>
            </View>
            <Text style={styles.orderTotal}>{formatCurrency(item.total)}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.orderItems}>
          {item.items.map((orderItem, index) => (
            <Text key={index} style={styles.orderItem}>
              {orderItem.quantity}x {orderItem.name}
            </Text>
          ))}
        </View>

        {/* Notes */}
        {item.notes && (
          <View style={styles.notesContainer}>
            <Ionicons name="document-text-outline" size={16} color="#6B7280" />
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {item.status === "pending" && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#10B981" }]}
                onPress={() => handleConfirmOrder(item._id)}
              >
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Xác nhận</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#DC2626" }]}
                onPress={() => {
                  setSelectedOrder(item)
                  setShowCancelModal(true)
                }}
              >
                <Ionicons name="close" size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Hủy</Text>
              </TouchableOpacity>
            </>
          )}
          {/* Button chọn shipper khi đơn hàng ở trạng thái 'ready' */}
          {item.status === "ready" && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#06B6D4" }]}
              onPress={() => {
                setSelectedOrder(item)
                dispatch(fetchAvailableShippers() as any)
                setShowShipperModal(true)
              }}
            >
              <Ionicons name="bicycle-outline" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Chọn shipper</Text>
            </TouchableOpacity>
          )}

          {item.status !== "completed" && item.status !== "cancelled" && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#3B82F6" }]}
              onPress={() => {
                setSelectedOrder(item)
                setShowStatusModal(true)
              }}
            >
              <Ionicons name="refresh" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Cập nhật</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    )
  }

  const filteredOrders = getFilteredOrders()

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý đơn hàng</Text>
        <View style={styles.headerRight}>
          <Text style={styles.orderCount}>{filteredOrders.length} đơn</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FlatList
          data={filterOptions}
          renderItem={({ item }) => renderFilterTab(item)}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabs}
        />
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.ordersList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Không có đơn hàng</Text>
            <Text style={styles.emptySubtitle}>Chưa có đơn hàng nào trong danh mục này</Text>
          </View>
        }
      />

      {/* Status Update Modal */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cập nhật trạng thái</Text>
              <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status.key}
                style={styles.statusOption}
                onPress={() => handleStatusUpdate(status.key as StaffOrder["status"])}
              >
                <Ionicons name={status.icon as any} size={20} color="#10B981" />
                <Text style={styles.statusOptionText}>{status.title}</Text>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Shipper Selection Modal */}
      <Modal visible={showShipperModal} transparent animationType="slide" onRequestClose={() => setShowShipperModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn shipper</Text>
              <TouchableOpacity onPress={() => setShowShipperModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {shippersLoading ? (
              <ActivityIndicator size="large" color="#0066CC" style={{ marginVertical: 20 }} />
            ) : (
              <ScrollView style={{ maxHeight: 300 }}>
                {shippers.map((shipper) => (
                  <TouchableOpacity
                    key={shipper._id}
                    style={styles.shipperItem}
                    onPress={() => handleAssignShipper(shipper._id)}
                  >
                    <View style={styles.shipperInfo}>
                      <Text style={styles.shipperName}>{shipper.fullname}</Text>
                      <Text style={styles.shipperDetails}>ID: {shipper.staffId}</Text>
                      <Text style={[styles.shipperStatus, 
                        { color: shipper.status === 'available' ? '#10B981' : '#F59E0B' }]}>
                        {shipper.status === 'available' ? 'Có sẵn' : 'Đang giao hàng'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowShipperModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cancel Reason Modal */}
      <Modal visible={showCancelModal} transparent animationType="slide" onRequestClose={() => setShowCancelModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lý do hủy đơn</Text>
              <TouchableOpacity onPress={() => setShowCancelModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.noteInput}
              placeholder="Nhập lý do hủy đơn hàng..."
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCancelModal(false)
                  setCancelReason("")
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton, 
                  !cancelReason.trim() && { backgroundColor: '#D1D5DB' }]} 
                onPress={handleCancelOrder}
                disabled={!cancelReason.trim()}
              >
                <Text style={styles.saveButtonText}>Xác nhận hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  orderCount: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  filterContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filterTabs: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
    marginRight: 8,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  filterBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  ordersList: {
    padding: 16,
    flexGrow: 1,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  customerName: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  orderTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  orderStatus: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  notesContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F9FAFB",
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 6,
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  statusOptionText: {
    fontSize: 16,
    color: "#1F2937",
    marginLeft: 12,
    flex: 1,
  },
  noteInput: {
    margin: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    fontSize: 16,
    minHeight: 100,
  },
  modalActions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  saveButton: {
    backgroundColor: "#10B981",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  shipperItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  shipperInfo: {
    flex: 1,
  },
  shipperName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  shipperDetails: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  shipperStatus: {
    fontSize: 12,
    fontWeight: "500",
  },
})

export default OrderManagementScreen
