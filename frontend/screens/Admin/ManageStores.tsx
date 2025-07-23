import type React from "react"
import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
  TextInput,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { SafeAreaView } from "react-native-safe-area-context"
import apiInstance from "../../api/axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { AdminStoreStackParamList } from "../../navigation/admin/AdminStoreNavigator"
import type { Store } from "../../types/types"
import CreateStoreModal from "./CreateStoreModal"

type NavigationProp = NativeStackNavigationProp<AdminStoreStackParamList, "ManageStores">

// Fixed API Service Functions
const storeApiService = {
  async getAllStores() {
    try {
      console.log("🔄 Fetching stores...")
      const token = await AsyncStorage.getItem("accessToken")
      console.log("🔑 Token:", token ? "Found" : "Not found")
      const response = await apiInstance.get("/stores", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      console.log("✅ Stores response:", response.data)
      return response.data
    } catch (error: any) {
      console.error("❌ Error fetching stores:", error)
      console.error("❌ Error response:", error.response?.data)
      console.error("❌ Error status:", error.response?.status)
      throw error
    }
  },

  async createStore(storeData: FormData) {
    try {
      const token = await AsyncStorage.getItem("accessToken")
      console.log("🔄 Creating store with data:", storeData)
      const response = await apiInstance.post("/stores", storeData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data
    } catch (error: any) {
      console.error("❌ Error creating store:", error)
      console.error("❌ Error response:", error.response?.data)
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
}

const ManageStores: React.FC = () => {
  const navigation = useNavigation<NavigationProp>()
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [filteredStores, setFilteredStores] = useState<Store[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Load stores when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadStores()
    }, []),
  )

  // Filter stores based on search text
  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredStores(stores)
    } else {
      const filtered = stores.filter(
        (store) =>
          store.name.toLowerCase().includes(searchText.toLowerCase()) ||
          store.address.toLowerCase().includes(searchText.toLowerCase()) ||
          (store.staff?.fullname && store.staff.fullname.toLowerCase().includes(searchText.toLowerCase())),
      )
      setFilteredStores(filtered)
    }
  }, [stores, searchText])

  const loadStores = async () => {
    try {
      console.log("🔄 Loading stores...")
      setLoading(true)
      // Check if user is authenticated
      const token = await AsyncStorage.getItem("accessToken")
      if (!token) {
        Alert.alert("Lỗi xác thực", "Vui lòng đăng nhập lại")
        return
      }

      const storesData = await storeApiService.getAllStores()
      console.log("📊 Stores loaded:", storesData?.length || 0)

      // Handle different response formats
      if (Array.isArray(storesData)) {
        setStores(storesData)
      } else if (storesData?.stores && Array.isArray(storesData.stores)) {
        setStores(storesData.stores)
      } else if (storesData?.data && Array.isArray(storesData.data)) {
        setStores(storesData.data)
      } else {
        console.warn("⚠️ Unexpected response format:", storesData)
        setStores([])
      }
    } catch (error: any) {
      console.error("❌ Error loading stores:", error)
      if (error.response?.status === 401) {
        Alert.alert("Lỗi xác thực", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại")
      } else if (error.response?.status === 403) {
        Alert.alert("Lỗi quyền truy cập", "Bạn không có quyền xem danh sách cửa hàng")
      } else if (error.code === "NETWORK_ERROR" || !error.response) {
        Alert.alert("Lỗi kết nối", "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng")
      } else {
        const errorMessage = error.response?.data?.error || error.message || "Không thể tải danh sách cửa hàng"
        Alert.alert("Lỗi", errorMessage)
      }
      setStores([])
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadStores()
    setRefreshing(false)
  }

  const handleStorePress = (store: Store) => {
    console.log("🔄 Navigating to StoreDetail with store:", store.name)
    navigation.navigate("StoreDetail", { store })
  }

  const handleToggleStatus = async (store: Store) => {
    try {
      const response = await storeApiService.toggleStoreStatus(store._id)
      // Update local state
      setStores((prevStores) =>
        prevStores.map((s) => (s._id === store._id ? { ...s, isActive: response.isActive } : s)),
      )
      Alert.alert("Thành công", response.message)
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Không thể cập nhật trạng thái cửa hàng"
      Alert.alert("Lỗi", errorMessage)
    }
  }

  const handleDeleteStore = (store: Store) => {
    Alert.alert("Xác nhận xóa", `Bạn có chắc chắn muốn xóa cửa hàng "${store.name}"?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await storeApiService.deleteStore(store._id)
            setStores((prevStores) => prevStores.filter((s) => s._id !== store._id))
            Alert.alert("Thành công", "Đã xóa cửa hàng")
          } catch (error: any) {
            const errorMessage = error.response?.data?.error || "Không thể xóa cửa hàng"
            Alert.alert("Lỗi", errorMessage)
          }
        },
      },
    ])
  }

  const handleCreateStore = () => {
    setShowCreateModal(true)
  }

  const handleCreateSuccess = () => {
    loadStores() // Reload stores after successful creation
  }

  const renderStoreItem = ({ item }: { item: Store }) => (
    <TouchableOpacity
      style={[styles.storeCard, !item.isActive && styles.inactiveStore]}
      onPress={() => handleStorePress(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{
          uri: item.image || "/placeholder.svg?height=80&width=80&text=Store",
        }}
        style={styles.storeImage}
        onError={() => console.log("Store image load error")}
      />
      <View style={styles.storeInfo}>
        <View style={styles.storeHeader}>
          <Text style={styles.storeName}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: item.isActive ? "#4AA366" : "#e74c3c" }]}>
            <Text style={styles.statusText}>{item.isActive ? "Hoạt động" : "Ngưng"}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.infoText} numberOfLines={2}>
            {item.address}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{item.openHours}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{item.contact}</Text>
        </View>
        {item.staff && (
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              {item.staff.fullname} ({item.staff.staffId})
            </Text>
          </View>
        )}
        {item.createdAt && (
          <Text style={styles.dateText}>Tạo: {new Date(item.createdAt).toLocaleDateString("vi-VN")}</Text>
        )}
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: item.isActive ? "#e74c3c" : "#4AA366" }]}
          onPress={() => handleToggleStatus(item)}
        >
          <Ionicons name={item.isActive ? "pause-outline" : "play-outline"} size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#ff6b6b" }]}
          onPress={() => handleDeleteStore(item)}
        >
          <Ionicons name="trash-outline" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="storefront-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>Chưa có cửa hàng nào</Text>
      <Text style={styles.emptySubtitle}>
        {searchText ? "Không tìm thấy cửa hàng phù hợp" : "Thêm cửa hàng đầu tiên của bạn"}
      </Text>
      {!searchText && (
        <TouchableOpacity style={styles.addButton} onPress={handleCreateStore}>
          <Text style={styles.addButtonText}>Thêm cửa hàng</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Quản lý Cửa hàng</Text>
      <Text style={styles.subtitle}>
        {stores.length} cửa hàng • {stores.filter((s) => s.isActive).length} hoạt động
      </Text>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm cửa hàng..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải danh sách cửa hàng...</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadStores}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredStores}
        keyExtractor={(item) => item._id}
        renderItem={renderStoreItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleCreateStore}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Create Store Modal */}
      <CreateStoreModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,  
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 4,
  },
  storeCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inactiveStore: {
    opacity: 0.7,
    backgroundColor: "#f8f8f8",
  },
  storeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  storeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  storeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  actionButtons: {
    justifyContent: "center",
    alignItems: "center",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
})

export default ManageStores
