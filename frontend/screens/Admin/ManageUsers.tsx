"use client"

import { useState, useCallback } from "react"
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native"
import { Chip } from "react-native-paper"
import { useFocusEffect } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Ionicons } from "@expo/vector-icons"
import apiInstance from "../../api/axios"

interface User {
  _id: string
  username: string
  fullname: string
  email: string
  phone: string
  avatar: string
  address: string
  role: "customer" | "staff" | "admin" | "shipper"
  isBanned: boolean
  storeId?: string | null
  staffId?: string
  status?: string
  banReason?: string
  banExpires?: string
  createdAt?: string
  updatedAt?: string
}

interface CreateUserData {
  username: string
  fullname: string
  email: string
  password: string
  phone: string
  address: string
  role: "customer" | "staff" | "admin" | "shipper"
  storeId?: string
}

const roleFilters = [
  { label: "Tất cả", value: "all" },
  { label: "Admin", value: "admin" },
  { label: "Customer", value: "customer" },
  { label: "Staff", value: "staff" },
  { label: "Shipper", value: "shipper" },
]

const roleOptions = [
  { label: "Customer", value: "customer" },
  { label: "Staff", value: "staff" },
  { label: "Admin", value: "admin" },
  { label: "Shipper", value: "shipper" },
]

// Enhanced API Service Functions
const userApiService = {
  async getAllUsers() {
    try {
      console.log("🔄 Fetching users...")
      const token = await AsyncStorage.getItem("accessToken")
      const response = await apiInstance.get("/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      console.log("✅ Users response:", response.data)
      return response.data
    } catch (error: any) {
      console.error("❌ Error fetching users:", error)
      throw error
    }
  },

  async createUser(userData: CreateUserData) {
    try {
      const token = await AsyncStorage.getItem("accessToken")
      const response = await apiInstance.post("/users", userData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      return response.data
    } catch (error: any) {
      console.error("❌ Error creating user:", error)
      throw error
    }
  },

  async updateUser(userId: string, userData: Partial<User>) {
    try {
      const token = await AsyncStorage.getItem("accessToken")
      const response = await apiInstance.put(`/users/${userId}`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      return response.data
    } catch (error: any) {
      console.error("❌ Error updating user:", error)
      throw error
    }
  },

  async deleteUser(userId: string) {
    try {
      const token = await AsyncStorage.getItem("accessToken")
      const response = await apiInstance.delete(`/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      return response.data
    } catch (error: any) {
      console.error("❌ Error deleting user:", error)
      throw error
    }
  },

  async suspendUser(userId: string, banData: { isBanned: boolean; banReason?: string; banExpires?: string }) {
    try {
      const token = await AsyncStorage.getItem("accessToken")
      const response = await apiInstance.put(`/users/suspend/${userId}`, banData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      return response.data
    } catch (error: any) {
      console.error("❌ Error suspending user:", error)
      throw error
    }
  },

  async unsuspendUser(userId: string) {
    try {
      const token = await AsyncStorage.getItem("accessToken")
      const response = await apiInstance.put(
        `/users/unsuspend/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )
      return response.data
    } catch (error: any) {
      console.error("❌ Error unsuspending user:", error)
      throw error
    }
  },
}

const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"all" | "admin" | "customer" | "staff" | "shipper">("all")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Form states for create/edit
  const [formData, setFormData] = useState<CreateUserData>({
    username: "",
    fullname: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "customer",
  })

  // Load users when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadUsers()
    }, []),
  )

  const loadUsers = async () => {
    try {
      console.log("🔄 Loading users...")
      setLoading(true)
      const token = await AsyncStorage.getItem("accessToken")
      if (!token) {
        Alert.alert("Lỗi xác thực", "Vui lòng đăng nhập lại")
        return
      }

      const usersData = await userApiService.getAllUsers()
      console.log("📊 Users loaded:", usersData?.length || 0)

      if (Array.isArray(usersData)) {
        setUsers(usersData)
      } else if (usersData?.users && Array.isArray(usersData.users)) {
        setUsers(usersData.users)
      } else if (usersData?.data && Array.isArray(usersData.data)) {
        setUsers(usersData.data)
      } else {
        console.warn("⚠️ Unexpected response format:", usersData)
        setUsers([])
      }
    } catch (error: any) {
      console.error("❌ Error loading users:", error)
      handleApiError(error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleApiError = (error: any) => {
    if (error.response?.status === 401) {
      Alert.alert("Lỗi xác thực", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại")
    } else if (error.response?.status === 403) {
      Alert.alert("Lỗi quyền truy cập", "Bạn không có quyền thực hiện thao tác này")
    } else if (error.code === "NETWORK_ERROR" || !error.response) {
      Alert.alert("Lỗi kết nối", "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng")
    } else {
      const errorMessage = error.response?.data?.message || error.message || "Đã xảy ra lỗi"
      Alert.alert("Lỗi", errorMessage)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadUsers()
    setRefreshing(false)
  }

  const resetFormData = () => {
    setFormData({
      username: "",
      fullname: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      role: "customer",
    })
  }

  // Create User
  const handleCreateUser = async () => {
    try {
      if (!formData.username || !formData.email || !formData.password) {
        Alert.alert("L��i", "Vui lòng điền đầy đủ thông tin bắt buộc")
        return
      }

      setActionLoading(true)

      // Tạo object userData cơ bản
      const userData: any = {
        username: formData.username.trim(),
        fullname: formData.fullname.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        role: formData.role,
      }

      // Chỉ thêm storeId nếu role là staff/shipper VÀ có giá trị
      // Với user/admin thì KHÔNG gửi trường storeId
      if (formData.role === "staff" || formData.role === "shipper") {
        if (formData.storeId && formData.storeId.trim()) {
          userData.storeId = formData.storeId.trim()
        }
        // Nếu là staff/shipper nhưng không có storeId thì để null
        else {
          userData.storeId = null
        }
      }
      // Với user/admin thì hoàn toàn không có trường storeId

      console.log("📤 Sending userData:", userData) // Debug log

      const response = await userApiService.createUser(userData)

      // Reload users list
      await loadUsers()

      setCreateModalVisible(false)
      resetFormData()
      Alert.alert("Thành công", response.message || "Tạo người dùng thành công")
    } catch (error: any) {
      console.error("❌ Error creating user:", error)
      console.error("❌ Error response:", error.response?.data) // Debug log
      handleApiError(error)
    } finally {
      setActionLoading(false)
    }
  }

  // Update User
  const handleUpdateUser = async () => {
    if (!selectedUser) return

    try {
      setActionLoading(true)

      // Tạo object updateData cơ bản
      const updateData: any = {
        username: formData.username.trim(),
        fullname: formData.fullname.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        role: formData.role,
      }

      // Chỉ thêm password nếu có giá trị mới
      if (formData.password && formData.password.trim()) {
        updateData.password = formData.password.trim()
      }

      // Xử lý storeId dựa trên role
      if (formData.role === "staff" || formData.role === "shipper") {
        // Nếu là staff/shipper
        if (formData.storeId && formData.storeId.trim()) {
          updateData.storeId = formData.storeId.trim()
        } else {
          updateData.storeId = null
        }
      } else {
        // Nếu là user/admin thì set storeId = null để xóa giá trị cũ
        updateData.storeId = null
      }

      console.log("📤 Sending updateData:", updateData) // Debug log

      const response = await userApiService.updateUser(selectedUser._id, updateData)

      // Update local state
      const updatedUsers = users.map((u) => (u._id === selectedUser._id ? { ...u, ...updateData } : u))
      setUsers(updatedUsers)

      setEditModalVisible(false)
      setSelectedUser(null)
      resetFormData()
      Alert.alert("Thành công", response.message || "Cập nhật người dùng thành công")
    } catch (error: any) {
      console.error("❌ Error updating user:", error)
      console.error("❌ Error response:", error.response?.data) // Debug log
      handleApiError(error)
    } finally {
      setActionLoading(false)
    }
  }

  // Delete User
  const handleDeleteUser = (user: User) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc muốn xóa người dùng "${user.username}" không? Thao tác này không thể hoàn tác.`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true)
              const response = await userApiService.deleteUser(user._id)

              // Remove from local state
              const updatedUsers = users.filter((u) => u._id !== user._id)
              setUsers(updatedUsers)

              setModalVisible(false)
              Alert.alert("Thành công", response.message || "Xóa người dùng thành công")
            } catch (error: any) {
              console.error("❌ Error deleting user:", error)
              handleApiError(error)
            } finally {
              setActionLoading(false)
            }
          },
        },
      ],
    )
  }

  const toggleUserStatus = async (user: User) => {
    const action = user.isBanned ? "mở khóa" : user.role === "customer" ? "ban" : "khóa"
    Alert.alert("Xác nhận", `Bạn có chắc muốn ${action} tài khoản "${user.username}" không?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xác nhận",
        style: "destructive",
        onPress: async () => {
          try {
            setActionLoading(true)
            let response
            if (user.isBanned) {
              response = await userApiService.unsuspendUser(user._id)
            } else {
              response = await userApiService.suspendUser(user._id, {
                isBanned: true,
                banReason: `${action.charAt(0).toUpperCase() + action.slice(1)} bởi admin`,
              })
            }

            const updatedUsers = users.map((u) => (u._id === user._id ? { ...u, isBanned: !u.isBanned } : u))
            setUsers(updatedUsers)

            if (selectedUser && selectedUser._id === user._id) {
              setSelectedUser({ ...selectedUser, isBanned: !selectedUser.isBanned })
            }

            setModalVisible(false)
            Alert.alert("Thành công", response.message || `Đã ${action} tài khoản thành công`)
          } catch (error: any) {
            console.error("❌ Error toggling user status:", error)
            handleApiError(error)
          } finally {
            setActionLoading(false)
          }
        },
      },
    ])
  }

  const openModal = (user: User) => {
    setSelectedUser(user)
    setModalVisible(true)
  }

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setFormData({
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      password: "",
      phone: user.phone,
      address: user.address,
      role: user.role,
      storeId: user.storeId || "",
    })
    setEditModalVisible(true)
  }

  const filteredUsers = selectedRole === "all" ? users : users.filter((u) => u.role === selectedRole)

  const renderItem = ({ item }: { item: User }) => (
    <TouchableOpacity onPress={() => openModal(item)} style={[styles.card, item.isBanned && styles.bannedCard]}>
      <Image
        source={{
          uri: item.avatar || "https://api.dicebear.com/9.x/adventurer/png?seed=" + item.username,
        }}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.detail}>Email: {item.email}</Text>
        <Text style={styles.detail}>Role: {item.role}</Text>
        {item.staffId && <Text style={styles.detail}>Staff ID: {item.staffId}</Text>}
        <Text style={[styles.status, { color: item.isBanned ? "red" : "green" }]}>
          {item.isBanned ? "BANNED" : "ACTIVE"}
        </Text>
        {item.isBanned && <Text style={styles.banNote}>Tài khoản đã bị BAN</Text>}
      </View>
    </TouchableOpacity>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>
        {selectedRole === "all" ? "Chưa có người dùng nào" : `Không có ${selectedRole} nào`}
      </Text>
      <Text style={styles.emptySubtitle}>{loading ? "Đang tải..." : "Dữ liệu sẽ hiển thị ở đây khi có"}</Text>
    </View>
  )

  const renderFormInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    secureTextEntry = false,
    required = false,
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
      />
    </View>
  )

  const renderRoleSelector = (selectedRole: string, onSelect: (role: string) => void) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Role *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleSelector}>
        {roleOptions.map((role) => (
          <TouchableOpacity
            key={role.value}
            style={[styles.roleOption, selectedRole === role.value && styles.roleOptionSelected]}
            onPress={() => onSelect(role.value)}
          >
            <Text style={[styles.roleOptionText, selectedRole === role.value && styles.roleOptionTextSelected]}>
              {role.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Quản Lý Người Dùng</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải danh sách người dùng...</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadUsers}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quản Lý Người Dùng</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetFormData()
            setCreateModalVisible(true)
          }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        {users.length} người dùng • {users.filter((u) => !u.isBanned).length} hoạt động
      </Text>

      {/* Filter theo role */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {roleFilters.map((role) => (
          <Chip
            key={role.value}
            selected={selectedRole === role.value}
            onPress={() => setSelectedRole(role.value as any)}
            style={[styles.categoryChip, selectedRole === role.value && styles.categoryChipSelected]}
            textStyle={[styles.categoryChipText, selectedRole === role.value && styles.categoryChipTextSelected]}
            icon={selectedRole === role.value ? "check" : undefined}
          >
            {role.label}
          </Chip>
        ))}
      </ScrollView>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      {/* Modal hiển thị chi tiết */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              {selectedUser && (
                <>
                  <Image
                    source={{
                      uri:
                        selectedUser.avatar ||
                        "https://api.dicebear.com/9.x/adventurer/png?seed=" + selectedUser.username,
                    }}
                    style={styles.modalAvatar}
                  />
                  <Text style={styles.modalName}>{selectedUser.fullname}</Text>

                  <View style={styles.detailBlock}>
                    <Text style={styles.label}>Username:</Text>
                    <Text style={styles.value}>{selectedUser.username}</Text>
                  </View>
                  <View style={styles.detailBlock}>
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.value}>{selectedUser.email}</Text>
                  </View>
                  <View style={styles.detailBlock}>
                    <Text style={styles.label}>Phone:</Text>
                    <Text style={styles.value}>{selectedUser.phone}</Text>
                  </View>
                  <View style={styles.detailBlock}>
                    <Text style={styles.label}>Address:</Text>
                    <Text style={styles.value}>{selectedUser.address}</Text>
                  </View>
                  <View style={styles.detailBlock}>
                    <Text style={styles.label}>Role:</Text>
                    <Text style={styles.value}>{selectedUser.role}</Text>
                  </View>
                  {selectedUser.staffId && (
                    <View style={styles.detailBlock}>
                      <Text style={styles.label}>Staff ID:</Text>
                      <Text style={styles.value}>{selectedUser.staffId}</Text>
                    </View>
                  )}
                  {selectedUser.status && (
                    <View style={styles.detailBlock}>
                      <Text style={styles.label}>Status:</Text>
                      <Text style={styles.value}>{selectedUser.status}</Text>
                    </View>
                  )}
                  {selectedUser.role === "staff" && selectedUser.storeId && (
                    <View style={styles.detailBlock}>
                      <Text style={styles.label}>Store:</Text>
                      <Text style={styles.value}>{selectedUser.storeId}</Text>
                    </View>
                  )}
                  {selectedUser.isBanned && selectedUser.banReason && (
                    <View style={styles.detailBlock}>
                      <Text style={styles.label}>Ban Reason:</Text>
                      <Text style={[styles.value, { color: "red" }]}>{selectedUser.banReason}</Text>
                    </View>
                  )}
                  {selectedUser.createdAt && (
                    <View style={styles.detailBlock}>
                      <Text style={styles.label}>Tạo lúc:</Text>
                      <Text style={styles.value}>{new Date(selectedUser.createdAt).toLocaleDateString("vi-VN")}</Text>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible(false)
                        openEditModal(selectedUser)
                      }}
                      style={[styles.actionButton, { backgroundColor: "#007AFF" }]}
                    >
                      <Text style={styles.actionText}>Chỉnh sửa</Text>
                    </TouchableOpacity>

                    {selectedUser.role !== "admin" && (
                      <TouchableOpacity
                        onPress={() => toggleUserStatus(selectedUser)}
                        style={[
                          styles.actionButton,
                          { backgroundColor: selectedUser.isBanned ? "green" : "orange" },
                          actionLoading && styles.actionButtonDisabled,
                        ]}
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.actionText}>
                            {selectedUser.role === "customer"
                              ? selectedUser.isBanned
                                ? "Unban"
                                : "Ban"
                              : selectedUser.isBanned
                                ? "Mở Khóa"
                                : "Khóa"}
                          </Text>
                        )}
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={() => handleDeleteUser(selectedUser)}
                      style={[styles.actionButton, { backgroundColor: "red" }]}
                    >
                      <Text style={styles.actionText}>Xóa</Text>
                    </TouchableOpacity>
                  </View>

                  <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
                    <Text style={styles.closeText}>Đóng</Text>
                  </Pressable>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Create User Modal */}
      <Modal animationType="slide" transparent={true} visible={createModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalTitle}>Tạo Người Dùng Mới</Text>

              {renderFormInput(
                "Username",
                formData.username,
                (text) => setFormData({ ...formData, username: text }),
                "Nhập username",
                false,
                true,
              )}
              {renderFormInput(
                "Họ tên",
                formData.fullname,
                (text) => setFormData({ ...formData, fullname: text }),
                "Nhập họ tên",
              )}
              {renderFormInput(
                "Email",
                formData.email,
                (text) => setFormData({ ...formData, email: text }),
                "Nhập email",
                false,
                true,
              )}
              {renderFormInput(
                "Mật khẩu",
                formData.password,
                (text) => setFormData({ ...formData, password: text }),
                "Nhập mật khẩu",
                true,
                true,
              )}
              {renderFormInput(
                "Số điện thoại",
                formData.phone,
                (text) => setFormData({ ...formData, phone: text }),
                "Nhập số điện thoại",
              )}
              {renderFormInput(
                "Địa chỉ",
                formData.address,
                (text) => setFormData({ ...formData, address: text }),
                "Nhập địa chỉ",
              )}
              {renderRoleSelector(formData.role, (role) => setFormData({ ...formData, role: role as any }))}
              {(formData.role === "staff" || formData.role === "shipper") && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Store ID</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.storeId || ""}
                    onChangeText={(text) => setFormData({ ...formData, storeId: text })}
                    placeholder="Nhập Store ID (tùy chọn)"
                    autoCapitalize="none"
                  />
                </View>
              )}

              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  onPress={handleCreateUser}
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalButtonText}>Tạo</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setCreateModalVisible(false)
                    resetFormData()
                  }}
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                >
                  <Text style={[styles.modalButtonText, { color: "#333" }]}>Hủy</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit User Modal */}
      <Modal animationType="slide" transparent={true} visible={editModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalTitle}>Chỉnh Sửa Người Dùng</Text>

              {renderFormInput(
                "Username",
                formData.username,
                (text) => setFormData({ ...formData, username: text }),
                "Nhập username",
                false,
                true,
              )}
              {renderFormInput(
                "Họ tên",
                formData.fullname,
                (text) => setFormData({ ...formData, fullname: text }),
                "Nhập họ tên",
              )}
              {renderFormInput(
                "Email",
                formData.email,
                (text) => setFormData({ ...formData, email: text }),
                "Nhập email",
                false,
                true,
              )}
              {renderFormInput(
                "Mật khẩu mới",
                formData.password,
                (text) => setFormData({ ...formData, password: text }),
                "Để trống nếu không đổi",
                true,
              )}
              {renderFormInput(
                "Số điện thoại",
                formData.phone,
                (text) => setFormData({ ...formData, phone: text }),
                "Nhập số điện thoại",
              )}
              {renderFormInput(
                "Địa chỉ",
                formData.address,
                (text) => setFormData({ ...formData, address: text }),
                "Nhập địa chỉ",
              )}
              {renderRoleSelector(formData.role, (role) => setFormData({ ...formData, role: role as any }))}
              {(formData.role === "staff" || formData.role === "shipper") && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Store ID</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.storeId || ""}
                    onChangeText={(text) => setFormData({ ...formData, storeId: text })}
                    placeholder="Nhập Store ID"
                    autoCapitalize="none"
                  />
                </View>
              )}

              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  onPress={handleUpdateUser}
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalButtonText}>Cập nhật</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setEditModalVisible(false)
                    setSelectedUser(null)
                    resetFormData()
                  }}
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                >
                  <Text style={[styles.modalButtonText, { color: "#333" }]}>Hủy</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#007AFF",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
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
  filterContainer: {
    marginBottom: 15,
    paddingBottom: 15,
    paddingTop: 5,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bannedCard: {
    opacity: 0.6,
    backgroundColor: "#f8f8f8",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#eee",
  },
  info: {
    marginLeft: 16,
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  detail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  status: {
    fontWeight: "600",
    marginTop: 6,
    fontSize: 14,
  },
  banNote: {
    marginTop: 4,
    fontSize: 13,
    color: "red",
    fontWeight: "500",
  },
  categoryChip: {
    marginRight: 10,
    height: 38,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#007AFF",
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  categoryChipSelected: {
    backgroundColor: "#007AFF",
  },
  categoryChipText: {
    color: "#007AFF",
    fontWeight: "500",
    fontSize: 14,
  },
  categoryChipTextSelected: {
    color: "#fff",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#007AFF",
    backgroundColor: "#eee",
  },
  modalName: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  detailBlock: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 4,
  },
  label: {
    fontWeight: "600",
    color: "#555",
    width: 100,
    fontSize: 15,
  },
  value: {
    flex: 1,
    color: "#333",
    fontSize: 15,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  closeText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "red",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  roleSelector: {
    flexDirection: "row",
  },
  roleOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#007AFF",
    backgroundColor: "#fff",
    marginRight: 8,
  },
  roleOptionSelected: {
    backgroundColor: "#007AFF",
  },
  roleOptionText: {
    color: "#007AFF",
    fontWeight: "500",
  },
  roleOptionTextSelected: {
    color: "#fff",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  modalButtonPrimary: {
    backgroundColor: "#007AFF",
  },
  modalButtonSecondary: {
    backgroundColor: "#f0f0f0",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
})

export default ManageUsers
