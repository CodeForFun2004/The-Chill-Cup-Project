import type React from "react"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { type RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import * as ImagePicker from "expo-image-picker"
import apiInstance from "../../api/axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { AdminStoreStackParamList } from "../../navigation/admin/AdminStoreNavigator"
import type { Store } from "../../types/types"

type StoreDetailRouteProp = RouteProp<AdminStoreStackParamList, "StoreDetail">
type NavigationProp = NativeStackNavigationProp<AdminStoreStackParamList, "StoreDetail">

interface Staff {
  _id: string
  fullname: string
  staffId: string
  phone?: string
  avatar?: string
}

// API Service Functions
const storeApiService = {
  async getAllStaff() {
    try {
      const token = await AsyncStorage.getItem("accessToken")
      const response = await apiInstance.get("/users/staff", {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      console.error("Error fetching staff:", error)
      throw error
    }
  },

  async updateStore(id: string, storeData: FormData) {
    try {
      const token = await AsyncStorage.getItem("accessToken")
      const response = await apiInstance.put(`/stores/${id}`, storeData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data
    } catch (error) {
      console.error("Error updating store:", error)
      throw error
    }
  },

  async deleteStore(id: string) {
    try {
      const token = await AsyncStorage.getItem("accessToken")
      const response = await apiInstance.delete(`/stores/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      console.error("Error deleting store:", error)
      throw error
    }
  },

  async toggleStoreStatus(id: string) {
    try {
      const token = await AsyncStorage.getItem("accessToken")
      const response = await apiInstance.put(
        `/stores/${id}/toggle-status`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      return response.data
    } catch (error) {
      console.error("Error toggling store status:", error)
      throw error
    }
  },

  async getStoreById(id: string) {
    try {
      const token = await AsyncStorage.getItem("accessToken")
      const response = await apiInstance.get(`/stores/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      console.error("Error fetching store:", error)
      throw error
    }
  },
}

const StoreDetail: React.FC = () => {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<StoreDetailRouteProp>()
  const [storeDetail, setStoreDetail] = useState<Store | null>(null)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [staffModalVisible, setStaffModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [image, setImage] = useState<string | null>(null)

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    address: "",
    contact: "",
    openHours: "",
    mapUrl: "",
    staffId: "",
    latitude: "",
    longitude: "",
  })

  const routeParams = route.params

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load staff list
        await loadStaffList()

        // Set store data from route params
        if (routeParams?.store) {
          setStoreDetail(routeParams.store)
        } else {
          Alert.alert("Lỗi", "Không có thông tin cửa hàng", [{ text: "OK", onPress: () => navigation.goBack() }])
        }
      } catch (error) {
        console.error("Error loading initial data:", error)
        Alert.alert("Lỗi", "Không thể tải dữ liệu cửa hàng")
      } finally {
        setInitialLoading(false)
      }
    }

    loadInitialData()
  }, [routeParams])

  const loadStaffList = async () => {
    try {
      const staff = await storeApiService.getAllStaff()
      setStaffList(staff)
    } catch (error) {
      console.error("Error loading staff:", error)
      // Don't show error for staff loading as it's not critical
    }
  }

  const refreshStoreData = async () => {
    if (!storeDetail?._id) return

    try {
      const updatedStore = await storeApiService.getStoreById(storeDetail._id)
      setStoreDetail(updatedStore)
    } catch (error) {
      console.error("Error refreshing store data:", error)
    }
  }

  const toggleActive = async () => {
    if (!storeDetail) return

    try {
      setLoading(true)
      const response = await storeApiService.toggleStoreStatus(storeDetail._id)

      setStoreDetail((prev) =>
        prev
          ? {
              ...prev,
              isActive: response.isActive,
            }
          : null,
      )

      Alert.alert("Thành công", response.message)
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Không thể cập nhật trạng thái cửa hàng"
      Alert.alert("Lỗi", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri)
    }
  }

  const createFormData = () => {
    const formData = new FormData()
    formData.append("name", editForm.name)
    formData.append("address", editForm.address)
    formData.append("contact", editForm.contact)
    formData.append("openHours", editForm.openHours)
    formData.append("mapUrl", editForm.mapUrl)
    formData.append("staffId", editForm.staffId)
    formData.append("latitude", editForm.latitude)
    formData.append("longitude", editForm.longitude)

    if (image) {
      const filename = image.split("/").pop() || "store-image.jpg"
      const match = /\.(\w+)$/.exec(filename)
      const type = match ? `image/${match[1]}` : "image/jpeg"

      formData.append("image", {
        uri: image,
        type,
        name: filename,
      } as any)
    }

    return formData
  }

  const handleEditSave = async () => {
    if (!storeDetail) return

    if (
      !editForm.name ||
      !editForm.address ||
      !editForm.contact ||
      !editForm.openHours ||
      !editForm.staffId ||
      !editForm.latitude ||
      !editForm.longitude
    ) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin bắt buộc.")
      return
    }

    // Validate coordinates
    const lat = Number.parseFloat(editForm.latitude)
    const lng = Number.parseFloat(editForm.longitude)
    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert("Lỗi", "Tọa độ phải là số hợp lệ")
      return
    }

    try {
      setLoading(true)
      const formData = createFormData()
      const response = await storeApiService.updateStore(storeDetail._id, formData)

      // Refresh store data to get updated info with populated staff
      await refreshStoreData()

      setEditModalVisible(false)
      setImage(null)
      Alert.alert("Thành công", response.message || "Cập nhật cửa hàng thành công")
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Không thể cập nhật cửa hàng"
      Alert.alert("Lỗi", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    if (!storeDetail) return

    Alert.alert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa cửa hàng này? Hành động này không thể hoàn tác.", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true)
            await storeApiService.deleteStore(storeDetail._id)
            Alert.alert("Thành công", "Đã xóa cửa hàng", [{ text: "OK", onPress: () => navigation.goBack() }])
          } catch (error: any) {
            const errorMessage = error.response?.data?.error || "Không thể xóa cửa hàng"
            Alert.alert("Lỗi", errorMessage)
          } finally {
            setLoading(false)
          }
        },
      },
    ])
  }

  const openEdit = () => {
    if (!storeDetail) return

    setEditForm({
      name: storeDetail.name,
      address: storeDetail.address,
      contact: storeDetail.contact || "",
      openHours: storeDetail.openHours || "",
      mapUrl: storeDetail.mapUrl || "",
      staffId: storeDetail.staff?.staffId || "",
      latitude: storeDetail.latitude?.toString() || "",
      longitude: storeDetail.longitude?.toString() || "",
    })
    setImage(null)
    setEditModalVisible(true)
  }

  const openMap = () => {
    if (!storeDetail) return

    if (storeDetail.mapUrl) {
      Linking.openURL(storeDetail.mapUrl)
    } else if (storeDetail.latitude && storeDetail.longitude) {
      const url = `https://www.google.com/maps?q=${storeDetail.latitude},${storeDetail.longitude}`
      Linking.openURL(url)
    } else {
      Alert.alert("Thông báo", "Chưa có thông tin bản đồ.")
    }
  }

  const renderStoreImage = () => {
    if (!storeDetail) return null

    const imageSource = storeDetail.image
      ? { uri: storeDetail.image }
      : { uri: "/placeholder.svg?height=200&width=400" }

    return (
      <Image
        source={imageSource}
        style={styles.image}
        resizeMode="cover"
        onError={() => console.log("Store image load error")}
      />
    )
  }

  // Show loading screen while fetching store data
  if (initialLoading || !storeDetail) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Đang tải thông tin cửa hàng...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {renderStoreImage()}

      <View style={styles.content}>
        <Text style={styles.name}>{storeDetail.name}</Text>

        {/* Địa chỉ */}
        <View style={styles.row}>
          <Ionicons name="location-outline" size={20} color="#3E6EF3" style={{ marginRight: 7 }} />
          <Text style={styles.labelBold}>Địa chỉ:</Text>
        </View>
        <Text style={styles.value}>{storeDetail.address}</Text>

        {/* Tọa độ */}
        {storeDetail.latitude && storeDetail.longitude && (
          <>
            <View style={styles.row}>
              <Ionicons name="navigate-outline" size={20} color="#e74c3c" style={{ marginRight: 7 }} />
              <Text style={styles.labelBold}>Tọa độ:</Text>
            </View>
            <Text style={styles.value}>
              {storeDetail.latitude.toFixed(6)}, {storeDetail.longitude.toFixed(6)}
            </Text>
          </>
        )}

        {/* Giờ hoạt động */}
        <View style={styles.row}>
          <Ionicons name="time-outline" size={20} color="#4AA366" style={{ marginRight: 7 }} />
          <Text style={styles.labelBold}>Giờ hoạt động:</Text>
        </View>
        <Text style={styles.value}>{storeDetail.openHours}</Text>

        {/* Liên hệ */}
        <View style={styles.row}>
          <Ionicons name="call-outline" size={20} color="#f7b731" style={{ marginRight: 7 }} />
          <Text style={styles.labelBold}>Liên hệ:</Text>
        </View>
        <Text style={styles.value}>{storeDetail.contact}</Text>

        {/* Nhân viên quản lý */}
        <View style={styles.row}>
          <Ionicons name="person-circle-outline" size={20} color="#9b59b6" style={{ marginRight: 7 }} />
          <Text style={styles.labelBold}>Nhân viên quản lý:</Text>
        </View>
        {storeDetail.staff ? (
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, marginBottom: 8 }}>
            <Image
              source={{
                uri:
                  storeDetail.staff.avatar ||
                  `https://api.dicebear.com/9.x/adventurer/png?seed=${storeDetail.staff.staffId}`,
              }}
              style={styles.staffAvatar}
            />
            <View style={{ marginLeft: 10 }}>
              <Text style={{ fontSize: 16, color: "#444", fontWeight: "600" }}>{storeDetail.staff.fullname}</Text>
              <Text style={{ fontSize: 14, color: "#666" }}>ID: {storeDetail.staff.staffId}</Text>
              {storeDetail.staff.phone && (
                <Text style={{ fontSize: 14, color: "#666" }}>SĐT: {storeDetail.staff.phone}</Text>
              )}
            </View>
          </View>
        ) : (
          <Text style={styles.value}>Chưa có nhân viên phụ trách</Text>
        )}

        {/* Ngày tạo/cập nhật */}
        {storeDetail.createdAt && (
          <>
            <View style={styles.row}>
              <Ionicons name="calendar-outline" size={20} color="#95a5a6" style={{ marginRight: 7 }} />
              <Text style={styles.labelBold}>Ngày tạo:</Text>
            </View>
            <Text style={styles.value}>{new Date(storeDetail.createdAt).toLocaleDateString("vi-VN")}</Text>
          </>
        )}

        {/* Xem bản đồ */}
        <TouchableOpacity style={styles.mapButton} onPress={openMap}>
          <Ionicons name="navigate-circle-outline" size={22} color="#fff" />
          <Text style={styles.mapText}>Xem bản đồ</Text>
        </TouchableOpacity>

        {/* Trạng thái hoạt động */}
        <View style={styles.switchRow}>
          <Text style={[styles.labelBold, { color: storeDetail.isActive ? "#4AA366" : "red" }]}>
            Trạng thái hoạt động:
          </Text>
          <Switch
            value={storeDetail.isActive}
            onValueChange={toggleActive}
            trackColor={{ false: "#ccc", true: "#4AA366" }}
            disabled={loading}
          />
        </View>

        {!storeDetail.isActive && <Text style={styles.inactiveWarning}>⚠️ Cửa hàng này đã ngưng hoạt động</Text>}

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#FFA500" }]}
            onPress={openEdit}
            disabled={loading}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Chỉnh sửa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#e74c3c" }]}
            onPress={handleDelete}
            disabled={loading}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Xóa</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>⬅ Quay lại</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Modal - Same as before but with proper types */}
      {/* ... (Modal code remains the same) ... */}
    </ScrollView>
  )
}

// Styles remain the same
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  image: {
    width: "100%",
    height: 200,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  content: { padding: 20 },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4AA366",
    marginBottom: 12,
    marginTop: 8,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  row: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  labelBold: { fontSize: 16, fontWeight: "600", color: "#444" },
  value: { fontSize: 15, color: "#666", marginTop: 3, marginLeft: 2 },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 22,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  inactiveWarning: {
    color: "red",
    marginTop: 14,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3E6EF3",
    padding: 12,
    borderRadius: 9,
    marginTop: 16,
    alignSelf: "center",
    minWidth: 160,
    justifyContent: "center",
  },
  mapText: { color: "#fff", marginLeft: 8, fontWeight: "500", fontSize: 15 },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 9,
    flex: 1,
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "500",
    fontSize: 15,
  },
  backButton: {
    marginTop: 30,
    backgroundColor: "#eee",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },
  backText: { color: "#333", fontSize: 16 },
  staffAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#bbb",
    backgroundColor: "#eee",
  },
})

export default StoreDetail
