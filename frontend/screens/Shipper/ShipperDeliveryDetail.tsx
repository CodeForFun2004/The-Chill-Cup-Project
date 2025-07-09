"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert, Linking } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { ShipperStackParamList } from "../../navigation/shipper/ShipperNavigator"

type NavigationProp = StackNavigationProp<ShipperStackParamList, "DeliveryDetail">

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
    note?: string
  }>
  status:
    | "accepted"
    | "going_to_pickup"
    | "arrived_pickup"
    | "picked_up"
    | "going_to_delivery"
    | "arrived_delivery"
    | "delivered"
  orderTime: string
  totalAmount: number
  customerNote?: string
  storePhone: string
  storeName: string
}

const DeliveryDetail = () => {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute()
  const { deliveryId } = route.params as { deliveryId: string }

  const [order, setOrder] = useState<DeliveryOrder>({
    id: deliveryId,
    customerName: "Nguyễn Văn A",
    customerPhone: "0901234567",
    pickupAddress: "The Coffee House - 123 Nguyễn Huệ, Q1",
    deliveryAddress: "456 Lê Lợi, Quận 1, TP.HCM",
    distance: "2.5 km",
    estimatedTime: "15 phút",
    fee: 25000,
    items: [
      { name: "Trà sữa truyền thống", quantity: 2, price: 45000, note: "Ít đường" },
      { name: "Bánh flan", quantity: 1, price: 15000 },
    ],
    status: "accepted",
    orderTime: "14:30",
    totalAmount: 105000,
    customerNote: "Giao lên tầng 3, gọi trước khi đến",
    storePhone: "0281234567",
    storeName: "The Coffee House",
  })

  const [currentStep, setCurrentStep] = useState(0)

  const deliverySteps = [
    { key: "accepted", label: "Đã nhận đơn", action: "Đi lấy hàng" },
    { key: "going_to_pickup", label: "Đang đi lấy hàng", action: "Đã đến cửa hàng" },
    { key: "arrived_pickup", label: "Đã đến cửa hàng", action: "Đã lấy hàng" },
    { key: "picked_up", label: "Đã lấy hàng", action: "Đi giao hàng" },
    { key: "going_to_delivery", label: "Đang giao hàng", action: "Đã đến nơi giao" },
    { key: "arrived_delivery", label: "Đã đến nơi giao", action: "Hoàn thành giao hàng" },
    { key: "delivered", label: "Đã giao hàng", action: "" },
  ]

  useEffect(() => {
    const stepIndex = deliverySteps.findIndex((step) => step.key === order.status)
    setCurrentStep(stepIndex)
  }, [order.status])

  const handleNextStep = () => {
    if (currentStep < deliverySteps.length - 1) {
      const nextStatus = deliverySteps[currentStep + 1].key as DeliveryOrder["status"]
      setOrder((prev) => ({ ...prev, status: nextStatus }))

      if (nextStatus === "delivered") {
        Alert.alert("Hoàn thành!", "Bạn đã giao hàng thành công. Tiền công đã được cộng vào tài khoản.", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ])
      }
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
    if (stepIndex < currentStep) return "#4CAF50"
    if (stepIndex === currentStep) return "#FF6B35"
    return "#E0E0E0"
  }

  const getStatusTextColor = (stepIndex: number) => {
    if (stepIndex <= currentStep) return "#333333"
    return "#999999"
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
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
                          backgroundColor: index < currentStep ? "#4CAF50" : "#E0E0E0",
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
              <Text style={styles.customerName}>{order.customerName}</Text>
              <Text style={styles.customerPhone}>{order.customerPhone}</Text>
              {order.customerNote && <Text style={styles.customerNote}>Ghi chú: {order.customerNote}</Text>}
            </View>
            <TouchableOpacity style={styles.callButton} onPress={() => handleCall(order.customerPhone)}>
              <Text style={styles.callButtonText}>📞</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pickup Info */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Thông tin lấy hàng</Text>
          <View style={styles.addressInfo}>
            <View style={styles.addressDetails}>
              <Text style={styles.storeName}>{order.storeName}</Text>
              <Text style={styles.addressText}>{order.pickupAddress}</Text>
              <Text style={styles.storePhone}>{order.storePhone}</Text>
            </View>
            <View style={styles.addressActions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleCall(order.storePhone)}>
                <Text style={styles.actionButtonText}>📞</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleOpenMap(order.pickupAddress)}>
                <Text style={styles.actionButtonText}>🗺️</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Delivery Info */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Thông tin giao hàng</Text>
          <View style={styles.addressInfo}>
            <View style={styles.addressDetails}>
              <Text style={styles.addressText}>{order.deliveryAddress}</Text>
              <Text style={styles.deliveryMeta}>
                {order.distance} • {order.estimatedTime}
              </Text>
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
                {item.note && <Text style={styles.itemNote}>Ghi chú: {item.note}</Text>}
              </View>
              <Text style={styles.itemPrice}>{item.price.toLocaleString("vi-VN")}đ</Text>
            </View>
          ))}
          <View style={styles.orderSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tổng tiền hàng:</Text>
              <Text style={styles.summaryValue}>{order.totalAmount.toLocaleString("vi-VN")}đ</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí giao hàng:</Text>
              <Text style={[styles.summaryValue, { color: "#4CAF50" }]}>{order.fee.toLocaleString("vi-VN")}đ</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      {currentStep < deliverySteps.length - 1 && (
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
            <Text style={styles.nextButtonText}>{deliverySteps[currentStep].action}</Text>
          </TouchableOpacity>
        </View>
      )}
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
  customerNote: {
    fontSize: 14,
    color: "#FF6B35",
    fontStyle: "italic",
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
  storeName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#333333",
    lineHeight: 20,
    marginBottom: 4,
  },
  storePhone: {
    fontSize: 14,
    color: "#666666",
  },
  deliveryMeta: {
    fontSize: 12,
    color: "#666666",
  },
  addressActions: {
    flexDirection: "row",
    gap: 8,
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
  itemNote: {
    fontSize: 12,
    color: "#666666",
    fontStyle: "italic",
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
})

export default DeliveryDetail
