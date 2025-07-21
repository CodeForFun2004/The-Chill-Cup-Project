import type React from "react"
import { useState, useEffect, ReactNode } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import AsyncStorage from "@react-native-async-storage/async-storage"
import apiInstance from "../../api/axios"

interface Staff {
  role: ReactNode
  _id: string
  fullname: string
  staffId: string
  phone?: string
  avatar?: string
  status?: string
}

interface CreateStoreModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

const CreateStoreModal: React.FC<CreateStoreModalProps> = ({ visible, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    staffId: "",
    contact: "",
    openHours: "",
    mapUrl: "",
  })
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingStaff, setLoadingStaff] = useState(false)
  const [showStaffPicker, setShowStaffPicker] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)

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
  }

  useEffect(() => {
    if (visible) {
      loadStaffList()
    }
  }, [visible])

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

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Lỗi", "Cần quyền truy cập thư viện ảnh")
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Lỗi", "Không thể chọn ảnh")
    }
  }

  const validateForm = () => {
    const { name, address, latitude, longitude, staffId, contact, openHours } = formData

    if (!name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên cửa hàng")
      return false
    }
    if (!address.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập địa chỉ")
      return false
    }
    if (!latitude.trim() || isNaN(Number(latitude))) {
      Alert.alert("Lỗi", "Vui lòng nhập latitude hợp lệ")
      return false
    }
    if (!longitude.trim() || isNaN(Number(longitude))) {
      Alert.alert("Lỗi", "Vui lòng nhập longitude hợp lệ")
      return false
    }
    if (!staffId.trim()) {
      Alert.alert("Lỗi", "Vui lòng chọn nhân viên")
      return false
    }
    if (!contact.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại")
      return false
    }
    if (!openHours.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập giờ mở cửa")
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)
      const token = await AsyncStorage.getItem("accessToken")

      // Create FormData
      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name.trim())
      formDataToSend.append("address", formData.address.trim())
      formDataToSend.append("latitude", formData.latitude.trim())
      formDataToSend.append("longitude", formData.longitude.trim())
      formDataToSend.append("staffId", formData.staffId.trim())
      formDataToSend.append("contact", formData.contact.trim())
      formDataToSend.append("openHours", formData.openHours.trim())
      if (formData.mapUrl.trim()) {
        formDataToSend.append("mapUrl", formData.mapUrl.trim())
      }

      // Add image if selected
      if (selectedImage) {
        const imageUri = selectedImage
        const filename = imageUri.split("/").pop() || "store-image.jpg"
        const match = /\.(\w+)$/.exec(filename)
        const type = match ? `image/${match[1]}` : "image/jpeg"

        formDataToSend.append("image", {
          uri: imageUri,
          name: filename,
          type,
        } as any)
      }

      console.log("🔄 Creating store...")
      const response = await apiInstance.post("/stores", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("✅ Store created successfully:", response.data)
      Alert.alert("Thành công", "Tạo cửa hàng thành công", [
        {
          text: "OK",
          onPress: () => {
            resetForm()
            onSuccess()
            onClose()
          },
        },
      ])
    } catch (error: any) {
      console.error("❌ Error creating store:", error)
      const errorMessage = error.response?.data?.error || "Không thể tạo cửa hàng"
      Alert.alert("Lỗi", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      latitude: "",
      longitude: "",
      staffId: "",
      contact: "",
      openHours: "",
      mapUrl: "",
    })
    setSelectedImage(null)
    setSelectedStaff(null)
  }

  const handleStaffSelect = (staff: Staff) => {
    setSelectedStaff(staff)
    setFormData({ ...formData, staffId: staff.staffId })
    setShowStaffPicker(false)
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Tạo Cửa hàng Mới</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Store Image */}
          <View style={styles.section}>
            <Text style={styles.label}>Hình ảnh cửa hàng</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              ) : (
                <View style={styles.imagePickerContent}>
                  <Ionicons name="camera-outline" size={32} color="#666" />
                  <Text style={styles.imagePickerText}>Chọn ảnh</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Store Name */}
          <View style={styles.section}>
            <Text style={styles.label}>
              Tên cửa hàng <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Nhập tên cửa hàng"
              placeholderTextColor="#999"
            />
          </View>

          {/* Address */}
          <View style={styles.section}>
            <Text style={styles.label}>
              Địa chỉ <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder="Nhập địa chỉ cửa hàng"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Location Coordinates */}
          <View style={styles.section}>
            <View style={styles.locationHeader}>
              <Text style={styles.label}>
                Tọa độ <Text style={styles.required}>*</Text>
              </Text>
            </View>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.subLabel}>Latitude</Text>
                <TextInput
                  style={styles.input}
                  value={formData.latitude}
                  onChangeText={(text) => setFormData({ ...formData, latitude: text })}
                  placeholder="10.762622"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.subLabel}>Longitude</Text>
                <TextInput
                  style={styles.input}
                  value={formData.longitude}
                  onChangeText={(text) => setFormData({ ...formData, longitude: text })}
                  placeholder="106.660172"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Staff Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>
              Nhân viên phụ trách <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.staffSelector}
              onPress={() => setShowStaffPicker(true)}
              disabled={loadingStaff}
            >
              {loadingStaff ? (
                <ActivityIndicator size="small" color="#666" />
              ) : selectedStaff ? (
                <View style={styles.selectedStaffInfo}>
                  <Text style={styles.selectedStaffName}>{selectedStaff.fullname}</Text>
                  <Text style={styles.selectedStaffId}>ID: {selectedStaff.staffId}</Text>
                </View>
              ) : (
                <Text style={styles.staffSelectorPlaceholder}>Chọn nhân viên</Text>
              )}
              <Ionicons name="chevron-down-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Contact */}
          <View style={styles.section}>
            <Text style={styles.label}>
              Số điện thoại <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.contact}
              onChangeText={(text) => setFormData({ ...formData, contact: text })}
              placeholder="0123456789"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>

          {/* Open Hours */}
          <View style={styles.section}>
            <Text style={styles.label}>
              Giờ mở cửa <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.openHours}
              onChangeText={(text) => setFormData({ ...formData, openHours: text })}
              placeholder="8:00 - 22:00"
              placeholderTextColor="#999"
            />
          </View>

          {/* Map URL */}
          <View style={styles.section}>
            <Text style={styles.label}>Link Google Maps</Text>
            <TextInput
              style={styles.input}
              value={formData.mapUrl}
              onChangeText={(text) => setFormData({ ...formData, mapUrl: text })}
              placeholder="https://maps.google.com/..."
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Tạo Cửa hàng</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Staff Picker Modal */}
        <Modal visible={showStaffPicker} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.staffPickerModal}>
              <View style={styles.staffPickerHeader}>
                <Text style={styles.staffPickerTitle}>Chọn Nhân viên</Text>
                <TouchableOpacity onPress={() => setShowStaffPicker(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.staffList}>
                {staffList.map((staff) => (
                  <TouchableOpacity key={staff._id} style={styles.staffItem} onPress={() => handleStaffSelect(staff)}>
                    <View style={styles.staffInfo}>
                      <Text style={styles.staffName}>{staff.fullname}</Text>
                      <Text style={styles.staffDetails}>
                        ID: {staff.staffId} • {staff.role} • {staff.phone}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward-outline" size={20} color="#666" />
                  </TouchableOpacity>
                ))}
                {staffList.length === 0 && (
                  <View style={styles.noStaffContainer}>
                    <Text style={styles.noStaffText}>Không có nhân viên khả dụng</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#e74c3c",
  },
  subLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fff",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  imagePicker: {
    height: 120,
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  imagePickerContent: {
    alignItems: "center",
  },
  imagePickerText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 6,
  },
  staffSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  staffSelectorPlaceholder: {
    fontSize: 16,
    color: "#999",
  },
  selectedStaffInfo: {
    flex: 1,
  },
  selectedStaffName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  selectedStaffId: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  staffPickerModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "70%",
  },
  staffPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  staffPickerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  staffList: {
    maxHeight: 400,
  },
  staffItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  staffDetails: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  noStaffContainer: {
    padding: 40,
    alignItems: "center",
  },
  noStaffText: {
    fontSize: 16,
    color: "#666",
  },
})

export default CreateStoreModal
