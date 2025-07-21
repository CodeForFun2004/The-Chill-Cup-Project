import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from "react-native"
import { API_BASE_URL } from "../../services/api"

interface User {
  _id: string
  username: string
  fullname: string
  email: string
  role: string
  isBanned: boolean
  banReason?: string
  banExpires?: string
  phone?: string
  address?: string
  avatar?: string
  status?: string
}

interface Order {
  _id: string
  orderNumber: string
  userId: string
  status: string
  createdAt: string
  totalAmount: number
}

const ManageUsers = () => {
  const [activeTab, setActiveTab] = useState("users")
  const [users, setUsers] = useState<User[]>([])
  const [staff, setStaff] = useState<User[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [staffForm, setStaffForm] = useState({
    username: "",
    fullname: "",
    email: "",
    password: "",
    phone: "",
    role: "staff",
    address: "",
  })
  const [editingStaff, setEditingStaff] = useState<User | null>(null)

  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [suspendForm, setSuspendForm] = useState({
    banReason: "",
    banExpires: "",
    isPermanent: true,
  })
  const [userToSuspend, setUserToSuspend] = useState<User | null>(null)

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/users`)
      const data = await response.json()
      setUsers(Array.isArray(data) ? data : data.users || [])
    } catch (error) {
      Alert.alert("Error", "Failed to fetch users")
      console.error("Fetch users error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch staff
  const fetchStaff = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/users/admin/staff`)
      const data = await response.json()
      setStaff(data.staff || [])
    } catch (error) {
      Alert.alert("Error", "Failed to fetch staff")
      console.error("Fetch staff error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch orders for a specific user
  const fetchUserOrders = async (userId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/orders/admin/orders?userId=${userId}`)
      const data = await response.json()
      setOrders(Array.isArray(data) ? data : [])
      setShowOrderModal(true)
    } catch (error) {
      Alert.alert("Error", "Failed to fetch orders")
      console.error("Fetch orders error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Suspend user
  const suspendUser = async () => {
    if (!userToSuspend) return

    try {
      let banExpiresDate = null

      if (!suspendForm.isPermanent && suspendForm.banExpires) {
        // Convert DD/MM/YYYY to Date object
        const dateParts = suspendForm.banExpires.split("/")
        if (dateParts.length === 3) {
          const day = Number.parseInt(dateParts[0])
          const month = Number.parseInt(dateParts[1]) - 1 // Month is 0-indexed
          const year = Number.parseInt(dateParts[2])
          const date = new Date(year, month, day, 23, 59, 59) // End of day

          if (!isNaN(date.getTime())) {
            banExpiresDate = date.toISOString()
          } else {
            Alert.alert("Error", "Invalid date format. Please use DD/MM/YYYY")
            return
          }
        } else {
          Alert.alert("Error", "Invalid date format. Please use DD/MM/YYYY")
          return
        }
      }

      const requestBody = {
        isBanned: true,
        banReason: suspendForm.banReason,
        banExpires: banExpiresDate, // null for permanent, ISO string for temporary
      }

      const response = await fetch(`${API_BASE_URL}/users/suspend/${userToSuspend._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        Alert.alert("Success", "User suspended successfully")
        setShowSuspendModal(false)
        fetchUsers()
      } else {
        const error = await response.json()
        Alert.alert("Error", error.message || "Failed to suspend user")
      }
    } catch (error) {
      Alert.alert("Error", "Failed to suspend user")
      console.error("Suspend user error:", error)
    }
  }

  // Unsuspend user
  const unsuspendUser = async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/unsuspend/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        Alert.alert("Success", "User unsuspended successfully")
        fetchUsers()
      } else {
        const error = await response.json()
        Alert.alert("Error", error.message || "Failed to unsuspend user")
      }
    } catch (error) {
      Alert.alert("Error", "Failed to unsuspend user")
      console.error("Unsuspend user error:", error)
    }
  }

  // Create staff
  const createStaff = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/admin/staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(staffForm),
      })

      if (response.ok) {
        Alert.alert("Success", "Staff created successfully")
        setShowStaffModal(false)
        resetStaffForm()
        fetchStaff()
      } else {
        const error = await response.json()
        Alert.alert("Error", error.message || "Failed to create staff")
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create staff")
      console.error("Create staff error:", error)
    }
  }

  // Update staff
  const updateStaff = async () => {
    if (!editingStaff) return

    try {
      const response = await fetch(`${API_BASE_URL}/users/admin/staff/${editingStaff._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(staffForm),
      })

      if (response.ok) {
        Alert.alert("Success", "Staff updated successfully")
        setShowStaffModal(false)
        resetStaffForm()
        fetchStaff()
      } else {
        const error = await response.json()
        Alert.alert("Error", error.message || "Failed to update staff")
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update staff")
      console.error("Update staff error:", error)
    }
  }

  // Delete staff
  const deleteStaff = async (staffId: string) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this staff member?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/users/admin/staff/${staffId}`, {
              method: "DELETE",
            })

            if (response.ok) {
              Alert.alert("Success", "Staff deleted successfully")
              fetchStaff()
            } else {
              const error = await response.json()
              Alert.alert("Error", error.message || "Failed to delete staff")
            }
          } catch (error) {
            Alert.alert("Error", "Failed to delete staff")
            console.error("Delete staff error:", error)
          }
        },
      },
    ])
  }

  const resetStaffForm = () => {
    setStaffForm({
      username: "",
      fullname: "",
      email: "",
      password: "",
      phone: "",
      role: "staff",
      address: "",
    })
    setEditingStaff(null)
  }

  const openStaffModal = (staff?: User) => {
    if (staff) {
      setEditingStaff(staff)
      setStaffForm({
        username: staff.username,
        fullname: staff.fullname,
        email: staff.email,
        password: "",
        phone: staff.phone || "",
        role: staff.role,
        address: staff.address || "",
      })
    } else {
      resetStaffForm()
    }
    setShowStaffModal(true)
  }

  const handleSuspendUser = (user: User) => {
    setUserToSuspend(user)
    setSuspendForm({
      banReason: "",
      banExpires: "",
      isPermanent: true,
    })
    setShowSuspendModal(true)
  }

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers()
    } else if (activeTab === "staff") {
      fetchStaff()
    }
  }, [activeTab])

  const onRefresh = () => {
    setRefreshing(true)
    if (activeTab === "users") {
      fetchUsers()
    } else if (activeTab === "staff") {
      fetchStaff()
    }
    setRefreshing(false)
  }

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredStaff = staff.filter(
    (member) =>
      member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.fullname}</Text>
        <Text style={styles.userDetail}>@{item.username}</Text>
        <Text style={styles.userDetail}>{item.email}</Text>
        <Text style={[styles.userRole, { color: item.role === "admin" ? "#e74c3c" : "#3498db" }]}>
          {item.role.toUpperCase()}
        </Text>
        {item.isBanned && (
          <View>
            <Text style={styles.bannedStatus}>SUSPENDED: {item.banReason}</Text>
            {item.banExpires && (
              <Text style={styles.banExpiry}>Expires: {new Date(item.banExpires).toLocaleDateString("en-GB")}</Text>
            )}
            {!item.banExpires && <Text style={styles.permanentBan}>PERMANENT BAN</Text>}
          </View>
        )}
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => fetchUserOrders(item._id)}>
          <Text style={styles.actionButtonText}>Orders</Text>
        </TouchableOpacity>
        {item.isBanned ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.unsuspendButton]}
            onPress={() => unsuspendUser(item._id)}
          >
            <Text style={styles.actionButtonText}>Unsuspend</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.actionButton, styles.suspendButton]} onPress={() => handleSuspendUser(item)}>
            <Text style={styles.actionButtonText}>Suspend</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )

  const renderStaffItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.fullname}</Text>
        <Text style={styles.userDetail}>@{item.username}</Text>
        <Text style={styles.userDetail}>{item.email}</Text>
        <Text style={[styles.userRole, { color: item.role === "staff" ? "#27ae60" : "#f39c12" }]}>
          {item.role.toUpperCase()}
        </Text>
        {item.status && <Text style={styles.userDetail}>Status: {item.status}</Text>}
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => openStaffModal(item)}>
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => deleteStaff(item._id)}>
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
      <Text style={styles.orderDetail}>Status: {item.status}</Text>
      <Text style={styles.orderDetail}>Amount: ${item.totalAmount}</Text>
      <Text style={styles.orderDetail}>Date: {new Date(item.createdAt).toLocaleDateString()}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "users" && styles.activeTab]}
          onPress={() => setActiveTab("users")}
        >
          <Text style={[styles.tabText, activeTab === "users" && styles.activeTabText]}>Users</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "staff" && styles.activeTab]}
          onPress={() => setActiveTab("staff")}
        >
          <Text style={[styles.tabText, activeTab === "staff" && styles.activeTabText]}>Staff</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Add Staff Button */}
      {activeTab === "staff" && (
        <TouchableOpacity style={styles.addButton} onPress={() => openStaffModal()}>
          <Text style={styles.addButtonText}>+ Add Staff</Text>
        </TouchableOpacity>
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      ) : (
        <FlatList
          data={activeTab === "users" ? filteredUsers : filteredStaff}
          renderItem={activeTab === "users" ? renderUserItem : renderStaffItem}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          style={styles.list}
        />
      )}

      {/* Staff Modal */}
      <Modal visible={showStaffModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingStaff ? "Edit Staff" : "Add Staff"}</Text>

            <ScrollView style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Username"
                value={staffForm.username}
                onChangeText={(text) => setStaffForm({ ...staffForm, username: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={staffForm.fullname}
                onChangeText={(text) => setStaffForm({ ...staffForm, fullname: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={staffForm.email}
                onChangeText={(text) => setStaffForm({ ...staffForm, email: text })}
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={staffForm.password}
                onChangeText={(text) => setStaffForm({ ...staffForm, password: text })}
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                placeholder="Phone"
                value={staffForm.phone}
                onChangeText={(text) => setStaffForm({ ...staffForm, phone: text })}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Address"
                value={staffForm.address}
                onChangeText={(text) => setStaffForm({ ...staffForm, address: text })}
                multiline
              />

              <View style={styles.roleContainer}>
                <Text style={styles.roleLabel}>Role:</Text>
                <TouchableOpacity
                  style={[styles.roleButton, staffForm.role === "staff" && styles.activeRole]}
                  onPress={() => setStaffForm({ ...staffForm, role: "staff" })}
                >
                  <Text style={styles.roleButtonText}>Staff</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleButton, staffForm.role === "shipper" && styles.activeRole]}
                  onPress={() => setStaffForm({ ...staffForm, role: "shipper" })}
                >
                  <Text style={styles.roleButtonText}>Shipper</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowStaffModal(false)
                  resetStaffForm()
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={editingStaff ? updateStaff : createStaff}
              >
                <Text style={styles.modalButtonText}>{editingStaff ? "Update" : "Create"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Orders Modal */}
      <Modal visible={showOrderModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>User Orders</Text>

            <FlatList
              data={orders}
              renderItem={renderOrderItem}
              keyExtractor={(item) => item._id}
              style={styles.ordersList}
            />

            <TouchableOpacity style={[styles.modalButton, styles.closeButton]} onPress={() => setShowOrderModal(false)}>
              <Text style={[styles.modalButtonText, styles.closeButtonText]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Suspend Modal */}
      <Modal visible={showSuspendModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Suspend User</Text>

            {userToSuspend && (
              <Text style={styles.suspendUserInfo}>
                Suspending: {userToSuspend.fullname} (@{userToSuspend.username})
              </Text>
            )}

            <ScrollView style={styles.formContainer}>
              <Text style={styles.inputLabel}>Ban Reason *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter reason for suspension..."
                value={suspendForm.banReason}
                onChangeText={(text) => setSuspendForm({ ...suspendForm, banReason: text })}
                multiline
                numberOfLines={3}
              />

              <View style={styles.banTypeContainer}>
                <Text style={styles.inputLabel}>Ban Duration:</Text>
                <TouchableOpacity
                  style={[styles.banTypeButton, suspendForm.isPermanent && styles.activeBanType]}
                  onPress={() => setSuspendForm({ ...suspendForm, isPermanent: true, banExpires: "" })}
                >
                  <Text style={[styles.banTypeText, suspendForm.isPermanent && styles.activeBanTypeText]}>
                    Permanent Ban (Never expires)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.banTypeButton, !suspendForm.isPermanent && styles.activeBanType]}
                  onPress={() => setSuspendForm({ ...suspendForm, isPermanent: false })}
                >
                  <Text style={[styles.banTypeText, !suspendForm.isPermanent && styles.activeBanTypeText]}>
                    Temporary Ban (Set expiry date)
                  </Text>
                </TouchableOpacity>
              </View>

              {!suspendForm.isPermanent && (
                <>
                  <Text style={styles.inputLabel}>Ban Expiry Date *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="DD/MM/YYYY (e.g., 31/12/2025)"
                    value={suspendForm.banExpires}
                    onChangeText={(text) => {
                      // Auto-format as user types
                      let formatted = text.replace(/[^\d]/g, "") // Remove non-digits
                      if (formatted.length >= 2) {
                        formatted = formatted.substring(0, 2) + "/" + formatted.substring(2)
                      }
                      if (formatted.length >= 5) {
                        formatted = formatted.substring(0, 5) + "/" + formatted.substring(5, 9)
                      }
                      setSuspendForm({ ...suspendForm, banExpires: formatted })
                    }}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                  <Text style={styles.dateHint}>User will be automatically unbanned after this date</Text>
                </>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowSuspendModal(false)
                  setUserToSuspend(null)
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.suspendConfirmButton,
                  (!suspendForm.banReason ||
                    (!suspendForm.isPermanent && (!suspendForm.banExpires || suspendForm.banExpires.length !== 10))) &&
                    styles.disabledButton,
                ]}
                onPress={suspendUser}
                disabled={
                  !suspendForm.banReason ||
                  (!suspendForm.isPermanent && (!suspendForm.banExpires || suspendForm.banExpires.length !== 10))
                }
              >
                <Text style={styles.modalButtonText}>Suspend User</Text>
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
    backgroundColor: "#f8f9fa",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#3498db",
  },
  tabText: {
    fontSize: 16,
    color: "#6c757d",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#3498db",
    fontWeight: "600",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#28a745",
    margin: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    flex: 1,
    marginBottom: 72,
  },
  userCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 4,
  },
  userDetail: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  bannedStatus: {
    fontSize: 12,
    color: "#e74c3c",
    fontWeight: "600",
    marginTop: 4,
  },
  userActions: {
    flexDirection: "column",
    gap: 8,
  },
  actionButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    minWidth: 80,
    alignItems: "center",
  },
  suspendButton: {
    backgroundColor: "#e74c3c",
  },
  unsuspendButton: {
    backgroundColor: "#28a745",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    maxHeight: "80%",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 20,
    textAlign: "center",
  },
  formContainer: {
    maxHeight: 400,
  },
  input: {
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 12,
  },
  roleButton: {
    backgroundColor: "#e9ecef",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  activeRole: {
    backgroundColor: "#3498db",
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#495057",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  saveButton: {
    backgroundColor: "#28a745",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  ordersList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  orderCard: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 4,
  },
  orderDetail: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 2,
  },
  suspendUserInfo: {
    fontSize: 16,
    color: "#495057",
    marginBottom: 16,
    textAlign: "center",
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 6,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  banTypeContainer: {
    marginBottom: 16,
  },
  banTypeButton: {
    backgroundColor: "#e9ecef",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: "center",
  },
  activeBanType: {
    backgroundColor: "#dc3545",
  },
  banTypeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#495057",
  },
  activeBanTypeText: {
    color: "#fff",
  },
  dateHint: {
    fontSize: 12,
    color: "#6c757d",
    marginTop: -8,
    marginBottom: 16,
    fontStyle: "italic",
  },
  suspendConfirmButton: {
    backgroundColor: "#dc3545",
  },
  disabledButton: {
    backgroundColor: "#adb5bd",
  },
  closeButton: {
    backgroundColor: "#6c757d",
    marginTop: 16,
  },
  closeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  banExpiry: {
    fontSize: 11,
    color: "#f39c12",
    fontWeight: "500",
    marginTop: 2,
  },
  permanentBan: {
    fontSize: 11,
    color: "#e74c3c",
    fontWeight: "600",
    marginTop: 2,
  },
})

export default ManageUsers
