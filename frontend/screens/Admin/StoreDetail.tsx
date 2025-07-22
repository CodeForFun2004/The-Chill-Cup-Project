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
  Modal,
  TextInput,
  Linking,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { type RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"
import * as ImagePicker from "expo-image-picker"
import apiInstance from "../../api/axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface Staff {
  _id: string
  fullname: string
  staffId: string
  phone?: string
  avatar?: string
  status?: string
}

interface Store {
  _id: string
  name: string
  address: string
  contact: string
  openHours: string
  isActive: boolean
  mapUrl?: string
  image: string
  latitude: number
  longitude: number
  staff: Staff
  createdAt?: string
  updatedAt?: string
}

type StoreDetailRouteProp = RouteProp<{ StoreDetail: { store: Store; storeId?: string } }, "StoreDetail">

// Fixed API Service Functions
const storeApiService = {
  async getAllStaff() {
    try {
      const token = await AsyncStorage.getItem("accessToken")
      const response = await apiInstance.get("/users/admin/staff", {
        headers: { Authorization: `Bearer ${token}` },
      })
      console.log("Staff API response:", response.data)
      return response.data.staff || response.data
    } catch (error: any) {
      console.error("Error fetching staff:", error)
      console.error("Error response:", error.response?.data)
      throw error
    }
  },

  async updateStore(id: string, storeData: FormData) {
    try {
      const token = await AsyncStorage.getItem("accessToken")
      console.log("🔄 Updating store with FormData")

      // Fixed: Remove FormData.entries() as it doesn't exist in React Native
      // Instead, log the data we're sending
      console.log("FormData being sent to server")

      const response = await apiInstance.put(`/stores/${id}`, storeData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data
    } catch (error: any) {
      console.error("Error updating store:", error)
      console.error("Error response:", error.response?.data)
      throw error
    }
  },

  async createStore(storeData: FormData) {
    try {
      const token = await AsyncStorage.getItem("accessToken")
      console.log("🔄 Creating store with FormData")

      const response = await apiInstance.post("/stores", storeData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data
    } catch (error: any) {
      console.error("Error creating store:", error)
      console.error("Error response:", error.response?.data)
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
  const navigation = useNavigation()
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
        await loadStaffList()
        if (routeParams?.storeId) {
          await loadStoreData(routeParams.storeId)
        } else if (routeParams?.store) {
          setStoreDetail(routeParams.store)
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
      console.log("🔄 Loading staff list...")
      const staff = await storeApiService.getAllStaff()
      console.log("✅ Staff loaded:", staff?.length || 0)
      setStaffList(Array.isArray(staff) ? staff : [])
    } catch (error: any) {
      console.error("❌ Error loading staff:", error)
      Alert.alert("Cảnh báo", "Không thể tải danh sách nhân viên. Chức năng chỉnh sửa có thể bị hạn chế.")
      setStaffList([])
    }
  }

  const loadStoreData = async (id: string) => {
    try {
      setInitialLoading(true)
      const store = await storeApiService.getStoreById(id)
      setStoreDetail(store)
    } catch (error: any) {
      console.error("Error loading store data:", error)
      Alert.alert("Lỗi", "Không thể tải thông tin cửa hàng", [{ text: "OK", onPress: () => navigation.goBack() }])
    } finally {
      setInitialLoading(false)
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

    // Add text fields
    formData.append("name", editForm.name.trim())
    formData.append("address", editForm.address.trim())
    formData.append("contact", editForm.contact.trim())
    formData.append("openHours", editForm.openHours.trim())
    formData.append("mapUrl", editForm.mapUrl.trim())
    formData.append("staffId", editForm.staffId.trim())
    formData.append("latitude", editForm.latitude.trim())
    formData.append("longitude", editForm.longitude.trim())

    // Add image if selected
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

    // Fixed: Log form data contents without using entries()
    console.log("FormData contents:")
    console.log("- name:", editForm.name.trim())
    console.log("- address:", editForm.address.trim())
    console.log("- staffId:", editForm.staffId.trim())
    console.log("- latitude:", editForm.latitude.trim())
    console.log("- longitude:", editForm.longitude.trim())
    console.log("- image:", image ? "Selected" : "None")

    return formData
  }

  const handleEditSave = async () => {
    if (!storeDetail) return

    // Validation
    if (
      !editForm.name.trim() ||
      !editForm.address.trim() ||
      !editForm.contact.trim() ||
      !editForm.openHours.trim() ||
      !editForm.staffId.trim() ||
      !editForm.latitude.trim() ||
      !editForm.longitude.trim()
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

    // Validate staff exists
    const selectedStaff = staffList.find((s) => s.staffId === editForm.staffId.trim())
    if (!selectedStaff) {
      Alert.alert("Lỗi", "Nhân viên được chọn không hợp lệ")
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
      console.error("Update store error:", error)
      const errorMessage = error.response?.data?.error || error.message || "Không thể cập nhật cửa hàng"
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
      contact: storeDetail.contact,
      openHours: storeDetail.openHours,
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
      : { uri: "/placeholder.svg?height=200&width=400&text=Store" }

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

      {/* Edit Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <SafeAreaView style={styles.modalContent}>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            >
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.header}>Chỉnh sửa cửa hàng</Text>

                {/* Image picker */}
                <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                  <Ionicons name="camera-outline" size={24} color="#007AFF" />
                  <Text style={styles.imagePickerText}>{image ? "Đổi ảnh cửa hàng" : "Chọn ảnh cửa hàng"}</Text>
                </TouchableOpacity>
                {image && <Image source={{ uri: image }} style={styles.previewImage} />}

                {/* Form fields */}
                <View style={styles.inputGroup}>
                  <Ionicons name="storefront-outline" size={20} color="#4AA366" style={styles.icon} />
                  <TextInput
                    placeholder="Tên cửa hàng *"
                    style={styles.inputPopup}
                    value={editForm.name}
                    onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                    placeholderTextColor="#aaa"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Ionicons name="location-outline" size={20} color="#3E6EF3" style={styles.icon} />
                  <TextInput
                    placeholder="Địa chỉ *"
                    style={styles.inputPopup}
                    value={editForm.address}
                    onChangeText={(text) => setEditForm({ ...editForm, address: text })}
                    placeholderTextColor="#aaa"
                    multiline
                    editable={!loading}
                  />
                </View>

                <View style={styles.coordinateRow}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Ionicons name="navigate-outline" size={20} color="#e74c3c" style={styles.icon} />
                    <TextInput
                      placeholder="Latitude *"
                      style={styles.inputPopup}
                      value={editForm.latitude}
                      onChangeText={(text) => setEditForm({ ...editForm, latitude: text })}
                      placeholderTextColor="#aaa"
                      keyboardType="numeric"
                      editable={!loading}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Ionicons name="navigate-outline" size={20} color="#e74c3c" style={styles.icon} />
                    <TextInput
                      placeholder="Longitude *"
                      style={styles.inputPopup}
                      value={editForm.longitude}
                      onChangeText={(text) => setEditForm({ ...editForm, longitude: text })}
                      placeholderTextColor="#aaa"
                      keyboardType="numeric"
                      editable={!loading}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Ionicons name="call-outline" size={20} color="#f7b731" style={styles.icon} />
                  <TextInput
                    placeholder="Số liên hệ *"
                    style={styles.inputPopup}
                    keyboardType="phone-pad"
                    value={editForm.contact}
                    onChangeText={(text) => setEditForm({ ...editForm, contact: text })}
                    placeholderTextColor="#aaa"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Ionicons name="time-outline" size={20} color="#4AA366" style={styles.icon} />
                  <TextInput
                    placeholder="Giờ hoạt động *"
                    style={styles.inputPopup}
                    value={editForm.openHours}
                    onChangeText={(text) => setEditForm({ ...editForm, openHours: text })}
                    placeholderTextColor="#aaa"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Ionicons name="map-outline" size={20} color="#18a1e9" style={styles.icon} />
                  <TextInput
                    placeholder="Link bản đồ (Google Maps)"
                    style={[styles.inputPopup, { paddingRight: 36 }]}
                    value={editForm.mapUrl}
                    onChangeText={(text) => setEditForm({ ...editForm, mapUrl: text })}
                    placeholderTextColor="#aaa"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                  {!!editForm.mapUrl && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(editForm.mapUrl)}
                      style={{ position: "absolute", right: 12 }}
                    >
                      <Ionicons name="navigate-circle-outline" size={24} color="#18a1e9" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Staff Selection */}
                <View style={styles.inputGroup}>
                  <Ionicons name="person-outline" size={20} color="#9b59b6" style={styles.icon} />
                  <TouchableOpacity
                    style={[styles.staffPickerBtn, { flex: 1 }]}
                    onPress={() => setStaffModalVisible(true)}
                    activeOpacity={0.8}
                    disabled={loading}
                  >
                    {editForm.staffId ? (
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Image
                          source={{
                            uri:
                              staffList.find((s) => s.staffId === editForm.staffId)?.avatar ||
                              `https://api.dicebear.com/9.x/adventurer/png?seed=${editForm.staffId}`,
                          }}
                          style={styles.staffAvatarMini}
                        />
                        <View style={{ marginLeft: 8, flex: 1 }}>
                          <Text style={{ color: "#222", fontSize: 15, fontWeight: "500" }}>
                            {staffList.find((s) => s.staffId === editForm.staffId)?.fullname}
                          </Text>
                          <Text style={{ color: "#666", fontSize: 12 }}>
                            ID: {editForm.staffId} •
                            {staffList.find((s) => s.staffId === editForm.staffId)?.status === "assigned"
                              ? " Đã phân công"
                              : " Có thể phân công"}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <Text style={{ color: "#aaa", fontSize: 15 }}>Chọn nhân viên quản lý *</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Staff Selection Modal */}
                <Modal
                  visible={staffModalVisible}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setStaffModalVisible(false)}
                >
                  <View style={styles.staffModalOverlay}>
                    <View style={styles.staffModalContainer}>
                      <Text style={styles.staffModalTitle}>Chọn nhân viên phụ trách</Text>
                      <FlatList
                        data={staffList}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => {
                          const isSelected = editForm.staffId === item.staffId
                          const isCurrentStaff = storeDetail?.staff?.staffId === item.staffId
                          const canAssign = item.status !== "assigned" || isCurrentStaff

                          return (
                            <TouchableOpacity
                              style={[
                                styles.staffCard,
                                isSelected && { borderColor: "#3E6EF3", backgroundColor: "#eef6ff" },
                                !canAssign && { opacity: 0.5, backgroundColor: "#f5f5f5" },
                              ]}
                              onPress={() => {
                                if (canAssign) {
                                  setEditForm({ ...editForm, staffId: item.staffId })
                                  setStaffModalVisible(false)
                                } else {
                                  Alert.alert("Không thể chọn", "Nhân viên này đã được phân công cho cửa hàng khác")
                                }
                              }}
                              disabled={!canAssign}
                            >
                              <Image
                                source={{
                                  uri:
                                    item.avatar || `https://api.dicebear.com/9.x/adventurer/png?seed=${item.staffId}`,
                                }}
                                style={styles.staffAvatar}
                              />
                              <View style={{ flex: 1 }}>
                                <Text style={styles.staffName}>{item.fullname}</Text>
                                <Text style={styles.staffId}>ID: {item.staffId}</Text>
                                {item.phone && <Text style={styles.staffPhone}>SĐT: {item.phone}</Text>}
                                <Text style={[styles.staffStatus, { color: canAssign ? "#4AA366" : "#e74c3c" }]}>
                                  {isCurrentStaff
                                    ? "Nhân viên hiện tại"
                                    : item.status === "assigned"
                                      ? "Đã phân công"
                                      : "Có thể phân công"}
                                </Text>
                              </View>
                              {isSelected && <Ionicons name="checkmark-circle" size={26} color="#3E6EF3" />}
                              {!canAssign && !isCurrentStaff && (
                                <Ionicons name="lock-closed" size={20} color="#e74c3c" />
                              )}
                            </TouchableOpacity>
                          )
                        }}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={
                          <Text style={{ textAlign: "center", color: "#666", marginTop: 20 }}>
                            Không có nhân viên nào
                          </Text>
                        }
                      />
                      <TouchableOpacity onPress={() => setStaffModalVisible(false)} style={styles.closeStaffModalBtn}>
                        <Text style={{ color: "#3E6EF3", fontWeight: "bold", fontSize: 16 }}>Đóng</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>

                <TouchableOpacity
                  style={[styles.saveButton, loading && styles.disabledButton]}
                  onPress={handleEditSave}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Lưu thay đổi</Text>}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setEditModalVisible(false)}
                  disabled={loading}
                >
                  <Text style={styles.cancelText}>Huỷ</Text>
                </TouchableOpacity>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </Modal>
    </ScrollView>
  )
}

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
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 18,
    color: "#3E6EF3",
    textAlign: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 24,
    minHeight: "75%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
  },
  imagePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#007AFF",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  imagePickerText: {
    marginLeft: 8,
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },
  previewImage: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    marginBottom: 16,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    backgroundColor: "#f9fafd",
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  coordinateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: { marginRight: 6 },
  inputPopup: {
    flex: 1,
    fontSize: 16,
    color: "#222",
    paddingVertical: 13,
    paddingHorizontal: 2,
    backgroundColor: "transparent",
  },
  staffPickerBtn: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  staffAvatarMini: {
    width: 30,
    height: 30,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  staffAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#bbb",
    backgroundColor: "#eee",
  },
  staffModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "flex-end",
  },
  staffModalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "68%",
    paddingHorizontal: 18,
    paddingVertical: 24,
    elevation: 8,
  },
  staffModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: "#3E6EF3",
  },
  staffCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 6,
    backgroundColor: "#f6faff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#eee",
    marginBottom: 10,
  },
  staffName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  staffId: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  staffPhone: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  staffStatus: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  closeStaffModalBtn: {
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 6,
    borderRadius: 8,
    backgroundColor: "#f6faff",
    borderWidth: 1,
    borderColor: "#e2e2e2",
  },
  saveButton: {
    backgroundColor: "#4AA366",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 5,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
  },
  cancelText: { color: "#555", fontWeight: "600", fontSize: 15 },
})

export default StoreDetail
