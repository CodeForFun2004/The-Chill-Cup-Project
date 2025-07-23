import { useState, useEffect } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
  RefreshControl,
} from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { discountAPI } from "../../api/axios"

interface Voucher {
  id: string
  code: string
  title: string
  description: string
  discount: string
  minOrder: string
  expiry: string
  isExpired: boolean
  isLock?: boolean
  pointsRequired: number
  image?: any
}

const ManagePromotions = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [editFields, setEditFields] = useState({
    title: "",
    description: "",
    discount: "",
    minOrder: "",
    expiry: "",
    pointsRequired: "",
  })

  // Transform backend data to frontend format
  const transformDiscountData = (backendData: any): Voucher => {
    console.log("Backend data:", JSON.stringify(backendData, null, 2))

    const today = new Date().toISOString().split("T")[0]
    const isExpired = backendData.expiryDate < today

    const pointsRequired =
      backendData.pointsRequired || backendData.requiredPoints || backendData.points || backendData.pointRequired || 0

    console.log("Points required found:", pointsRequired)

    return {
      id: backendData._id,
      code: backendData.promotionCode,
      title: backendData.title,
      description: backendData.description,
      discount: `${backendData.discountPercent}%`,
      minOrder: `${backendData.minOrder}đ`,
      expiry: backendData.expiryDate,
      isExpired,
      isLock: backendData.isLock || false,
      pointsRequired: Number(pointsRequired),
      image: backendData.image ? { uri: backendData.image } : require("../../assets/images/voucher/discount-20.png"),
    }
  }

  // Load vouchers from API
  const loadVouchers = async () => {
    try {
      setLoading(true)
      const response = await discountAPI.getAllDiscounts()
      console.log("API Response:", JSON.stringify(response, null, 2))
      const transformedData = response.map(transformDiscountData)
      console.log("Transformed data:", JSON.stringify(transformedData, null, 2))
      setVouchers(transformedData)
    } catch (error) {
      console.error("Error loading vouchers:", error)
      Alert.alert("Lỗi", "Không thể tải danh sách voucher")
    } finally {
      setLoading(false)
    }
  }

  // Refresh vouchers
  const onRefresh = async () => {
    setRefreshing(true)
    await loadVouchers()
    setRefreshing(false)
  }

  // Load data on component mount
  useEffect(() => {
    loadVouchers()
  }, [])

  const isFormFilled = () => Object.values(editFields).some((val) => val.trim() !== "")

  const handlePress = (voucher: Voucher) => {
    console.log("Selected voucher:", JSON.stringify(voucher, null, 2))
    setSelectedVoucher(voucher)
    setEditFields({
      title: voucher.title,
      description: voucher.description,
      discount: voucher.discount.replace("%", ""),
      minOrder: voucher.minOrder.replace(/[^\d]/g, ""),
      expiry: voucher.expiry,
      pointsRequired: String(voucher.pointsRequired || 0),
    })
    setIsEditing(false)
    setIsCreating(false)
    setModalVisible(true)
  }

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(false)
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split("T")[0]
      setEditFields({ ...editFields, expiry: dateStr })
    }
  }

  const handleSaveEdit = async () => {
    const points = Number.parseInt(editFields.pointsRequired) || 0
    const minOrderVal = Number.parseInt(editFields.minOrder) || 0
    const discountPercent = Number.parseInt(editFields.discount) || 0

    if (points < 0 || minOrderVal < 0 || discountPercent < 0) {
      Alert.alert("Lỗi", "Các giá trị không được là số âm.")
      return
    }

    if (discountPercent > 100) {
      Alert.alert("Lỗi", "Phần trăm giảm giá không được vượt quá 100%.")
      return
    }

    if (!editFields.title.trim() || !editFields.description.trim()) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin.")
      return
    }

    const save = async () => {
      try {
        setLoading(true)

        const discountData = {
          title: editFields.title,
          description: editFields.description,
          discountPercent,
          expiryDate: editFields.expiry,
          minOrder: minOrderVal,
          pointsRequired: points,
          requiredPoints: points,
        }

        console.log("Sending data:", JSON.stringify(discountData, null, 2))

        if (isCreating) {
          const result = await discountAPI.createDiscount(discountData)
          console.log("Create result:", JSON.stringify(result, null, 2))
          Alert.alert("Thành công", "Tạo voucher mới thành công!")
        } else if (selectedVoucher) {
          const result = await discountAPI.updateDiscount(selectedVoucher.id, discountData)
          console.log("Update result:", JSON.stringify(result, null, 2))
          Alert.alert("Thành công", "Cập nhật voucher thành công!")
        }

        setModalVisible(false)
        setIsCreating(false)
        await loadVouchers()
      } catch (error) {
        console.error("Error saving voucher:", error)
        Alert.alert("Lỗi", "Không thể lưu voucher. Vui lòng thử lại.")
      } finally {
        setLoading(false)
      }
    }

    Alert.alert("Xác nhận", isCreating ? "Tạo mới voucher này?" : "Lưu thay đổi cho voucher này?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đồng ý", onPress: save },
    ])
  }

  const handleDelete = (id: string) => {
    Alert.alert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa voucher này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true)
            await discountAPI.deleteDiscount(id)
            Alert.alert("Thành công", "Xóa voucher thành công!")
            setModalVisible(false)
            setSelectedVoucher(null)
            await loadVouchers()
          } catch (error) {
            console.error("Error deleting voucher:", error)
            Alert.alert("Lỗi", "Không thể xóa voucher. Vui lòng thử lại.")
          } finally {
            setLoading(false)
          }
        },
      },
    ])
  }

  const handleToggleLock = async (voucher: Voucher) => {
    try {
      console.log(`Attempting to toggle lock for voucher ID: ${voucher.id}`)
      console.log(`Current lock status: ${voucher.isLock}`)

      setLoading(true)
      const result = await discountAPI.lockDiscount(voucher.id)
      console.log("Lock toggle result:", JSON.stringify(result, null, 2))

      // Get the new lock status from the API response
      const newLockStatus = result.discount ? result.discount.isLock : !voucher.isLock

      Alert.alert("Thông báo", newLockStatus ? "Voucher đã bị khóa" : "Voucher đã được mở khóa")

      // Update local state
      setVouchers((vouchers) => vouchers.map((v) => (v.id === voucher.id ? { ...v, isLock: newLockStatus } : v)))
      setSelectedVoucher((prev) => (prev ? { ...prev, isLock: newLockStatus } : prev))
    } catch (error) {
      console.error("Error toggling lock:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelCreate = () => {
    if (isCreating && isFormFilled()) {
      Alert.alert("Xác nhận hủy tạo", "Bạn đã nhập thông tin. Hủy sẽ làm mất dữ liệu. Bạn có chắc chắn?", [
        { text: "Tiếp tục chỉnh sửa", style: "cancel" },
        {
          text: "Hủy tạo",
          style: "destructive",
          onPress: () => {
            setModalVisible(false)
            setIsCreating(false)
          },
        },
      ])
    } else {
      setModalVisible(false)
    }
  }

  const renderVoucher = ({ item }: { item: Voucher }) => (
    <TouchableOpacity
      style={[styles.voucherCard, (item.isExpired || item.isLock) && styles.expired]}
      onPress={() => handlePress(item)}
    >
      <View style={styles.voucherContent}>
        <View style={styles.voucherLeft}>
          {item.image && <Image source={item.image} style={styles.voucherImage} />}
          <View style={styles.voucherInfo}>
            <Text style={styles.voucherTitle}>
              {item.title} - {item.code}
            </Text>
            <Text style={styles.voucherDescription}>{item.description}</Text>
            <View style={styles.voucherDetails}>
              <View style={styles.detailItem}>
                <MaterialIcons name="shopping-cart" size={14} color="#666" />
                <Text style={styles.detailText}>Đơn tối thiểu: {item.minOrder}</Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialIcons name="event" size={14} color="#666" />
                <Text style={styles.detailText}>HSD: {item.expiry}</Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialIcons name="stars" size={14} color="#666" />
                <Text style={styles.detailText}>Điểm: {item.pointsRequired}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.voucherRight}>
          <Text style={styles.discountText}>{item.discount}</Text>
        </View>
      </View>
      {(item.isExpired || item.isLock) && (
        <View style={styles.usedOverlay}>
          <MaterialIcons name="cancel" size={24} color={item.isExpired ? "red" : "#faad14"} />
          <Text style={[styles.usedText, { color: item.isLock ? "#fa541c" : "red" }]}>
            {item.isExpired ? "Voucher đã hết hạn" : "Voucher đã bị khóa"}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )

  if (loading && vouchers.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3E6EF3" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản Lý Khuyến Mãi</Text>
      <FlatList
        data={vouchers}
        keyExtractor={(item) => item.id}
        renderItem={renderVoucher}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="local-offer" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có voucher nào</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditFields({
            title: "",
            description: "",
            discount: "",
            minOrder: "",
            expiry: new Date().toISOString().split("T")[0],
            pointsRequired: "0",
          })
          setSelectedVoucher(null)
          setIsEditing(true)
          setIsCreating(true)
          setModalVisible(true)
        }}
      >
        <Text style={{ color: "#fff", fontSize: 24 }}>+</Text>
      </TouchableOpacity>

      {modalVisible && (
        <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={handleCancelCreate}>
          <View style={styles.overlay}>
            <View style={styles.card}>
              <ScrollView>
                {isEditing ? (
                  <>
                    <Text style={styles.label}>Tiêu đề</Text>
                    <TextInput
                      style={styles.input}
                      value={editFields.title}
                      onChangeText={(text) => setEditFields({ ...editFields, title: text })}
                      placeholder="Tiêu đề"
                    />

                    <Text style={styles.label}>Mô tả</Text>
                    <TextInput
                      style={styles.input}
                      value={editFields.description}
                      onChangeText={(text) => setEditFields({ ...editFields, description: text })}
                      placeholder="Mô tả"
                      multiline
                    />

                    <Text style={styles.label}>Hạn sử dụng</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                      <Text style={styles.input}>{editFields.expiry}</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={new Date(editFields.expiry)}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                      />
                    )}

                    <Text style={styles.label}>Giảm giá (%)</Text>
                    <TextInput
                      style={styles.input}
                      value={editFields.discount}
                      onChangeText={(text) => setEditFields({ ...editFields, discount: text })}
                      keyboardType="numeric"
                      placeholder="%"
                    />

                    <Text style={styles.label}>Đơn tối thiểu (VNĐ)</Text>
                    <TextInput
                      style={styles.input}
                      value={editFields.minOrder}
                      onChangeText={(text) => setEditFields({ ...editFields, minOrder: text })}
                      keyboardType="numeric"
                      placeholder="Đơn tối thiểu"
                    />

                    <Text style={styles.label}>Điểm để đổi</Text>
                    <TextInput
                      style={styles.input}
                      value={editFields.pointsRequired}
                      onChangeText={(text) => setEditFields({ ...editFields, pointsRequired: text })}
                      keyboardType="numeric"
                      placeholder="Điểm (mặc định: 0)"
                    />

                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={[styles.viewButton, styles.successButton]}
                        onPress={handleSaveEdit}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.viewButtonText}>Lưu</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.viewButton, styles.cancelButton]}
                        onPress={handleCancelCreate}
                        disabled={loading}
                      >
                        <Text style={styles.viewButtonText}>Hủy</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.label}>Tiêu đề</Text>
                    <Text style={styles.text}>{selectedVoucher?.title}</Text>

                    <Text style={styles.label}>Mô tả</Text>
                    <Text style={styles.text}>{selectedVoucher?.description}</Text>

                    <Text style={styles.label}>Hạn sử dụng</Text>
                    <Text style={styles.text}>{selectedVoucher?.expiry}</Text>

                    <Text style={styles.label}>Giảm giá</Text>
                    <Text style={styles.text}>{selectedVoucher?.discount}</Text>

                    <Text style={styles.label}>Đơn tối thiểu</Text>
                    <Text style={styles.text}>{selectedVoucher?.minOrder}</Text>

                    <Text style={styles.label}>Điểm để đổi</Text>
                    <Text style={[styles.text, { fontWeight: "bold", color: "#007bff" }]}>
                      {selectedVoucher?.pointsRequired || 0} điểm
                    </Text>

                    <Text style={styles.label}>Mã khuyến mãi</Text>
                    <Text style={styles.text}>{selectedVoucher?.code}</Text>

                    <Text style={styles.label}>Trạng thái khóa</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                      <Switch
                        value={selectedVoucher?.isLock || false}
                        onValueChange={() => selectedVoucher && handleToggleLock(selectedVoucher)}
                        disabled={selectedVoucher?.isExpired || loading}
                      />
                      <Text
                        style={{
                          marginLeft: 8,
                          color: selectedVoucher?.isLock ? "#fa541c" : "green",
                          fontWeight: "bold",
                        }}
                      >
                        {selectedVoucher?.isLock ? "Đã bị khóa" : "Đang mở"}
                      </Text>
                    </View>

                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={[styles.viewButton, styles.primaryButton]}
                        onPress={() => setIsEditing(true)}
                        disabled={loading}
                      >
                        <Text style={styles.viewButtonText}>Chỉnh sửa</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.viewButton, styles.deleteButton]}
                        onPress={() => handleDelete(selectedVoucher!.id)}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.viewButtonText}>Xoá</Text>
                        )}
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={[styles.viewButton, styles.closeButton]}
                      onPress={() => setModalVisible(false)}
                      disabled={loading}
                    >
                      <Text style={styles.viewButtonText}>Đóng</Text>
                    </TouchableOpacity>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3E6EF3" />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F4F4" },
  centered: { justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#666" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)" },
  voucherCard: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 16, padding: 16, elevation: 2 },
  expired: { opacity: 0.6 },
  voucherContent: { flexDirection: "row", justifyContent: "space-between" },
  voucherLeft: { flex: 1, flexDirection: "row", alignItems: "center" },
  voucherImage: { width: 60, height: 60, marginRight: 12, borderRadius: 8 },
  voucherInfo: { flex: 1 },
  voucherTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4, color: "#333" },
  voucherDescription: { fontSize: 14, color: "#666", marginBottom: 4 },
  voucherDetails: { gap: 4 },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  detailText: { fontSize: 12, color: "#666" },
  voucherRight: { alignItems: "center", justifyContent: "center", marginLeft: 16 },
  discountText: { fontSize: 18, fontWeight: "bold", color: "#4AA366" },
  usedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  usedText: { fontSize: 14, fontWeight: "600" },
  input: { borderBottomWidth: 1, borderBottomColor: "#ccc", marginBottom: 10, padding: 8, fontSize: 14, color: "#333" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 20, width: 340, maxHeight: "80%" },
  label: { fontSize: 15, fontWeight: "600", marginTop: 10, marginBottom: 4, color: "#333" },
  text: { fontSize: 14, color: "#555", marginBottom: 6 },
  viewButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  viewButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginTop: 16 },
  primaryButton: { backgroundColor: "#007bff" },
  successButton: { backgroundColor: "#28a745" },
  deleteButton: { backgroundColor: "#6c757d" },
  cancelButton: { backgroundColor: "#dc3545" },
  closeButton: { backgroundColor: "#17a2b8", marginTop: 16 },
  title: { fontSize: 20, fontWeight: "bold", color: "#333", margin: 16, textAlign: "center" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 80,
    backgroundColor: "#3E6EF3",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
})

export default ManagePromotions
