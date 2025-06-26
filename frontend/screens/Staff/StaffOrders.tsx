"use client"

import type React from "react"
import { useState } from "react"
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
  type ListRenderItem,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSelector, useDispatch } from "react-redux"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import {
  updateOrderStatus,
  confirmOrder,
  cancelOrder,
  addOrderNote,
  setFilterStatus,
} from "../../redux/slices/staffSlice"
import type { StaffOrder } from "../../data/staffData"

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
    filterStatus: "All" | "Pending" | "Confirmed" | "Preparing" | "Ready" | "Delivering" | "Completed" | "Cancelled"
  }
}

const OrderManagementScreen: React.FC<OrderManagementScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch()
  const { orders, filterStatus } = useSelector((state: RootState) => state.staff)

  const [selectedOrder, setSelectedOrder] = useState<StaffOrder | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [noteText, setNoteText] = useState("")

  // Filter options
  const filterOptions = [
    { key: "All", title: "Tất cả", color: "#6B7280" },
    { key: "Pending", title: "Chờ xử lý", color: "#F59E0B" },
    { key: "Confirmed", title: "Đã xác nhận", color: "#3B82F6" },
    { key: "Preparing", title: "Đang pha chế", color: "#8B5CF6" },
    { key: "Ready", title: "Sẵn sàng", color: "#06B6D4" },
    { key: "Delivering", title: "Đang giao", color: "#F97316" },
    { key: "Completed", title: "Hoàn thành", color: "#10B981" },
    { key: "Cancelled", title: "Đã hủy", color: "#DC2626" },
  ]

  // Status options for updating
  const statusOptions = [
    { key: "Confirmed", title: "Xác nhận đơn hàng", icon: "checkmark-outline" },
    { key: "Preparing", title: "Bắt đầu pha chế", icon: "restaurant-outline" },
    { key: "Ready", title: "Sẵn sàng lấy", icon: "bag-check-outline" },
    { key: "Delivering", title: "Đang giao hàng", icon: "bicycle-outline" },
    { key: "Completed", title: "Hoàn thành", icon: "checkmark-circle-outline" },
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
      Pending: "#F59E0B",
      Confirmed: "#3B82F6",
      Preparing: "#8B5CF6",
      Ready: "#06B6D4",
      Delivering: "#F97316",
      Completed: "#10B981",
      Cancelled: "#DC2626",
    }
    return statusMap[status] || "#6B7280"
  }

  // Get status title in Vietnamese
  const getStatusTitle = (status: StaffOrder["status"]): string => {
    const statusMap: Record<StaffOrder["status"], string> = {
      Pending: "Chờ xử lý",
      Confirmed: "Đã xác nhận",
      Preparing: "Đang pha chế",
      Ready: "Sẵn sàng",
      Delivering: "Đang giao",
      Completed: "Hoàn thành",
      Cancelled: "Đã hủy",
    }
    return statusMap[status] || status
  }

  // Handle status update
  const handleStatusUpdate = (status: StaffOrder["status"]) => {
    if (selectedOrder) {
      dispatch(updateOrderStatus({ orderId: selectedOrder.id, status }))
      setShowStatusModal(false)
      setSelectedOrder(null)
    }
  }

  // Handle confirm order
  const handleConfirmOrder = (orderId: string) => {
    dispatch(confirmOrder(orderId))
  }

  // Handle cancel order
  const handleCancelOrder = (orderId: string) => {
    Alert.alert("Xác nhận hủy đơn", "Bạn có chắc chắn muốn hủy đơn hàng này?", [
      { text: "Không", style: "cancel" },
      {
        text: "Hủy đơn",
        style: "destructive",
        onPress: () => dispatch(cancelOrder({ orderId })),
      },
    ])
  }

  // Handle add note
  const handleAddNote = () => {
    if (selectedOrder && noteText.trim()) {
      dispatch(addOrderNote({ orderId: selectedOrder.id, note: noteText.trim() }))
      setShowNoteModal(false)
      setNoteText("")
      setSelectedOrder(null)
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
          {item.status === "Pending" && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#10B981" }]}
                onPress={() => handleConfirmOrder(item.id)}
              >
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Xác nhận</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#DC2626" }]}
                onPress={() => handleCancelOrder(item.id)}
              >
                <Ionicons name="close" size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Hủy</Text>
              </TouchableOpacity>
            </>
          )}

          {item.status !== "Completed" && item.status !== "Cancelled" && (
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

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#6B7280" }]}
            onPress={() => {
              setSelectedOrder(item)
              setNoteText(item.notes || "")
              setShowNoteModal(true)
            }}
          >
            <Ionicons name="create-outline" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Ghi chú</Text>
          </TouchableOpacity>
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
        keyExtractor={(item) => item.id}
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

      {/* Note Modal */}
      <Modal visible={showNoteModal} transparent animationType="slide" onRequestClose={() => setShowNoteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm ghi chú</Text>
              <TouchableOpacity onPress={() => setShowNoteModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.noteInput}
              placeholder="Nhập ghi chú cho đơn hàng..."
              value={noteText}
              onChangeText={setNoteText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowNoteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleAddNote}>
                <Text style={styles.saveButtonText}>Lưu</Text>
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
})

export default OrderManagementScreen
