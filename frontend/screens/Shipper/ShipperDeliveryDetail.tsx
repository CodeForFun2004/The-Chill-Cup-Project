"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Linking,
  Modal,
  TextInput,
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { ShipperStackParamList } from "../../navigation/shipper/ShipperNavigator"
import { shipperAPI } from "../../api/axios"

type NavigationProp = StackNavigationProp<ShipperStackParamList, "DeliveryDetail">

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

const DeliveryDetail = () => {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute()
  const { deliveryId } = route.params as { deliveryId: string }
  const [order, setOrder] = useState<DeliveryOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState("")

  const deliverySteps = [
    { key: "ready", label: "Đã nhận đơn", action: "Bắt đầu giao hàng" },
    { key: "delivering", label: "Đang giao hàng", action: "Hoàn thành giao hàng" },
    { key: "completed", label: "Đã giao hàng", action: "" },
  ]

  // Fetch order details
  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      // Vì API không có endpoint get single order, ta sẽ fetch từ danh sách orders
      const response = await shipperAPI.getOrders({
        status: "ready,delivering,completed",
        limit: 100,
      })

      const foundOrder = response.orders.find((o: DeliveryOrder) => o._id === deliveryId)
      if (foundOrder) {
        setOrder(foundOrder)
      } else {
        Alert.alert("Lỗi", "Không tìm thấy đơn hàng")
        navigation.goBack()
      }
    } catch (error) {
      console.error("Error fetching order details:", error)
      Alert.alert("Lỗi", "Không thể tải thông tin đơn hàng")
      navigation.goBack()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrderDetails()
  }, [deliveryId])

  const getCurrentStepIndex = () => {
    if (!order) return 0
    return deliverySteps.findIndex((step) => step.key === order.status)
  }

  const handleNextStep = async () => {
    if (!order || updating) return

    const currentStepIndex = getCurrentStepIndex()
    if (currentStepIndex >= deliverySteps.length - 1) return

    const nextStatus = deliverySteps[currentStepIndex + 1].key as DeliveryOrder["status"]

    try {
      setUpdating(true)
      await shipperAPI.updateOrderStatus(order._id, nextStatus)

      setOrder((prev) => (prev ? { ...prev, status: nextStatus } : null))

      if (nextStatus === "completed") {
        Alert.alert("Hoàn thành!", "Bạn đã giao hàng thành công. Tiền công đã được cộng vào tài khoản.", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ])
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái đơn hàng")
    } finally {
      setUpdating(false)
    }
  }

  const handleCancelOrder = () => {
    if (!order) return
    setShowCancelModal(true)
  }

  const confirmCancelOrder = async () => {
    if (!order || !cancelReason.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập lý do hủy đơn")
      return
    }

    try {
      setUpdating(true)
      await shipperAPI.updateOrderStatus(order._id, "cancelled", cancelReason.trim())
      setShowCancelModal(false)
      Alert.alert("Thông báo", "Đã hủy đơn hàng", [{ text: "OK", onPress: () => navigation.goBack() }])
    } catch (error) {
      console.error("Error cancelling order:", error)
      Alert.alert("Lỗi", "Không thể hủy đơn hàng")
    } finally {
      setUpdating(false)
    }
  }

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`)
  }

  const handleOpenMap = (address: string) => {
    const encodedAddress = encodeURIComponent(address)
    Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`)
  }

  const getStatusColor = (stepIndex: number) => {
    const currentIndex = getCurrentStepIndex()
    if (stepIndex < currentIndex) return "#4CAF50"
    if (stepIndex === currentIndex) return "#FF6B35"
    return "#E0E0E0"
  }

  const getStatusTextColor = (stepIndex: number) => {
    const currentIndex = getCurrentStepIndex()
    if (stepIndex <= currentIndex) return "#333333"
    return "#999999"
  }

  const formatOrderTime = (createdAt: string) => {
    const date = new Date(createdAt)
    return date.toLocaleString("vi-VN")
  }

  const getCustomerName = (phone: string) => {
    return `Khách hàng ${phone.slice(-4)}`
  }

  const handleBackPress = () => {
    if (order?.status === "delivering") {
      Alert.alert("Đơn hàng đang giao", "Bạn đang có đơn hàng chưa hoàn thành. Bạn muốn:", [
        { text: "Tiếp tục giao", style: "cancel" },
        {
          text: "Hủy đơn hàng",
          style: "destructive",
          onPress: () => setShowCancelModal(true),
        },
        {
          text: "Quay lại dashboard",
          onPress: () => navigation.goBack(),
        },
      ])
    } else {
      navigation.goBack()
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text>Đang tải...</Text>
      </View>
    )
  }

  if (!order) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text>Không tìm thấy đơn hàng</Text>
      </View>
    )
  }

  const currentStepIndex = getCurrentStepIndex()
  const canProceed = currentStepIndex < deliverySteps.length - 1
  const canCancel = order.status === "ready" || order.status === "delivering"

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Trạng thái đơn hàng</Text>
          <View style={styles.statusTimeline}>
            {deliverySteps.map((step, index) => (
              <View key={step.key} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, { backgroundColor: getStatusColor(index) }]} />
                  {index < deliverySteps.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        {
                          backgroundColor: index < currentStepIndex ? "#4CAF50" : "#E0E0E0",
                        },
                      ]}
                    />
                  )}
                </View>
                <Text style={[styles.timelineText, { color: getStatusTextColor(index) }]}>{step.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Thông tin khách hàng</Text>
          <View style={styles.customerInfo}>
            <View style={styles.customerDetails}>
              <Text style={styles.customerName}>{getCustomerName(order.phone)}</Text>
              <Text style={styles.customerPhone}>{order.phone}</Text>
              <Text style={styles.orderTime}>Đặt lúc: {formatOrderTime(order.createdAt)}</Text>
            </View>
            <TouchableOpacity style={styles.callButton} onPress={() => handleCall(order.phone)}>
              <Text style={styles.callButtonText}>📞</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Delivery Info */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Thông tin giao hàng</Text>
          <View style={styles.addressInfo}>
            <View style={styles.addressDetails}>
              <Text style={styles.addressText}>{order.deliveryAddress}</Text>
            </View>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleOpenMap(order.deliveryAddress)}>
              <Text style={styles.actionButtonText}>🗺️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Chi tiết đơn hàng</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>
                  {item.quantity}x {item.name}
                </Text>
              </View>
              <Text style={styles.itemPrice}>{item.price.toLocaleString("vi-VN")}đ</Text>
            </View>
          ))}
          <View style={styles.orderSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tổng tiền hàng:</Text>
              <Text style={styles.summaryValue}>{order.total.toLocaleString("vi-VN")}đ</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí giao hàng:</Text>
              <Text style={[styles.summaryValue, { color: "#4CAF50" }]}>
                {order.deliveryFee.toLocaleString("vi-VN")}đ
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {(canProceed || canCancel) && (
        <View style={styles.actionContainer}>
          {canCancel && (
            <TouchableOpacity
              style={[styles.cancelButton, { marginBottom: canProceed ? 12 : 0 }]}
              onPress={handleCancelOrder}
              disabled={updating}
            >
              <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
            </TouchableOpacity>
          )}

          {canProceed && (
            <TouchableOpacity style={styles.nextButton} onPress={handleNextStep} disabled={updating}>
              <Text style={styles.nextButtonText}>
                {updating ? "Đang cập nhật..." : deliverySteps[currentStepIndex].action}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {/* Cancel Order Modal */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Hủy đơn hàng</Text>
            <Text style={styles.modalSubtitle}>Vui lòng nhập lý do hủy đơn:</Text>

            <TextInput
              style={styles.reasonInput}
              placeholder="Nhập lý do hủy đơn..."
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowCancelModal(false)
                  setCancelReason("")
                }}
              >
                <Text style={styles.modalCancelText}>Đóng</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmCancelOrder}
                disabled={updating || !cancelReason.trim()}
              >
                <Text style={styles.modalConfirmText}>{updating ? "Đang hủy..." : "Xác nhận hủy"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
  },
  statusTimeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 40,
  },
  timelineLeft: {
    alignItems: "center",
    marginRight: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    minHeight: 24,
  },
  timelineText: {
    fontSize: 14,
    paddingTop: 2,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
  },
  customerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  orderTime: {
    fontSize: 12,
    color: "#999999",
  },
  callButton: {
    backgroundColor: "#4CAF50",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  callButtonText: {
    fontSize: 18,
  },
  addressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  addressDetails: {
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: "#333333",
    lineHeight: 20,
    marginBottom: 4,
  },
  actionButton: {
    backgroundColor: "#E3F2FD",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    fontSize: 16,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: "#333333",
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333333",
  },
  orderSummary: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666666",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333333",
  },
  actionContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  nextButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#FF5722",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 16,
    textAlign: "center",
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333333",
    minHeight: 80,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#E0E0E0",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCancelText: {
    color: "#666666",
    fontSize: 16,
    fontWeight: "600",
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: "#FF5722",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalConfirmText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default DeliveryDetail
