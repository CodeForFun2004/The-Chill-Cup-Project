import React, { useState } from 'react'
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
} from 'react-native'

import { Chip } from 'react-native-paper'

interface User {
  _id: string
  username: string
  fullname: string
  email: string
  phone: string
  avatar: string
  address: string
  role: 'user' | 'staff' | 'admin' | 'shipper'
  isBanned: boolean
  storeId?: string | null
}

const roleFilters = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' },
  { label: 'Staff', value: 'staff' },
  { label: 'Shipper', value: 'shipper' },
]

const usersData: User[] = [
  {
    _id: '68620fbf6a829c9e5f65e9f0',
    username: 'nguyenvana',
    fullname: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0912345678',
    avatar: 'https://api.dicebear.com/9.x/adventurer/png?seed=Kingston',
    address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
    role: 'user',
    isBanned: false,
  },
  {
    _id: '686210356a829c9e5f65e9f3',
    username: 'dinhvanb',
    fullname: 'Đinh Văn B',
    email: 'bdinhvan@gmail.com',
    phone: '0912345678',
    avatar: 'https://api.dicebear.com/9.x/adventurer/png?seed=Ryker',
    address: 'Đà Nẵng',
    role: 'user',
    isBanned: true,
  },
  {
    _id: '686212db0322b18271996811',
    username: 'admin1',
    fullname: 'admin1',
    email: 'admin1@gmail.com',
    phone: '0912345678',
    avatar: 'https://m.yodycdn.com/blog/anh-dai-dien-hai-yodyvn81.jpg',
    address: 'Đại học FPT Đà Nẵng',
    role: 'admin',
    isBanned: false,
  },
  {
    _id: '686213220322b18271996814',
    username: 'staff1',
    fullname: 'staff1',
    email: 'staff1@gmail.com',
    phone: '0912345678',
    avatar: 'https://api.dicebear.com/9.x/adventurer/png?seed=Sawyer',
    address: 'Đại học FPT Đà Nẵng',
    role: 'staff',
    isBanned: false,
    storeId: 'null',
  },
  {
    _id: '686213390322b18271996817',
    username: 'shipper1',
    fullname: 'shipper',
    email: 'shipper1@gmail.com',
    phone: '0912345678',
    avatar: 'https://api.dicebear.com/9.x/adventurer/png?seed=Sawyer',
    address: 'Đại học FPT Đà Nẵng',
    role: 'shipper',
    isBanned: false,
  },
  {
    _id: '686216dc8cd276266732d1d2',
    username: 'quan farm',
    fullname: 'Phạm Lê Minh Quân',
    email: 'quanplmde180583@fpt.edu.vn',
    phone: '0912345678',
    avatar: 'https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg',
    address: 'Đại học FPT Đà Nẵng',
    role: 'user',
    isBanned: false,
  },
  {
    _id: '6862487841a04ef95d6eed3e',
    username: 'huydqds180257',
    fullname: 'Dinh Quoc Huy (K18 DN)',
    email: 'huydqds180257@fpt.edu.vn',
    phone: '0912345678',
    avatar: 'https://lh3.googleusercontent.com/a/ACg8ocJCqCPqyFQDE_BFzsWpjl2KD0d_wPa6FwCh41P5nARJ8HVO7ZgF=s96-c',
    address: 'Đại học FPT Đà Nẵng',
    role: 'user',
    isBanned: false,
  },
  {
    _id: '686251bef34d35ddfbcf48bf',
    username: 'huesuong',
    fullname: 'Nguyễn Huệ Sương',
    email: 'nhs211306@gmail.com',
    phone: '0912345678',
    avatar: 'https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg',
    address: 'Đại học FPT Đà Nẵng',
    role: 'user', 
    isBanned: false,
  },
  {
    _id: '68625aaee8d3d2b499cfc04e',
    username: 'huesuong1',
    fullname: 'Nguyễn Huệ Sương',
    email: 'huesuongnguyen72@gmail.com',
    phone: '0912345678',
    avatar: 'https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg',
    address: 'Đại học FPT Đà Nẵng',
    role: 'user',
    isBanned: false,
  },
  {
    _id: '68678324da0d632a1400601c',
    username: 'thien2004',
    fullname: 'Lã An Thiên',
    email: 'reizngu@gmail.com',
    phone: '0912345678',
    avatar: 'https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg',
    address: 'Đại học FPT Đà Nẵng',
    role: 'user',
    isBanned: false,
  },
  {
    _id: '68678324da0d632a1400601d',
    username: 'thien2004',
    fullname: 'Lã An Thiên',
    email: ' ',
    phone: '0912345678', 
    avatar: 'https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg',
    address: 'Đại học FPT Đà Nẵng',
    role: 'user',
    isBanned: false,
  },
  {
    _id: '686a3767394407466a2e78aa',
    username: 'dinhquochuy.2004hl',
    fullname: 'Quốc Huy',
    email: 'dinhquochuy.2004hl@gmail.com',
    phone: '0912345678',
    avatar: 'https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg',
    address: 'Đại học FPT Đà Nẵng',
    role: 'user',
    isBanned: false,
  },
]

const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>(usersData)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'all' | 'admin' | 'user' | 'staff' | 'shipper'>('all')

  const filteredUsers =
    selectedRole === 'all' ? users : users.filter((u) => u.role === selectedRole)

  const toggleUserStatus = (user: User) => {
    const action = user.isBanned ? 'mở khóa' : user.role === 'user' ? 'ban' : 'khóa'
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn ${action} tài khoản "${user.username}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          style: 'destructive',
          onPress: () => {
            const updatedUsers = users.map((u) =>
              u._id === user._id ? { ...u, isBanned: !u.isBanned } : u
            )
            setUsers(updatedUsers)
            setModalVisible(false)
          },
        },
      ]
    )
  }

  const openModal = (user: User) => {
    setSelectedUser(user)
    setModalVisible(true)
  }

  const renderItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      onPress={() => openModal(item)}
      style={[styles.card, item.isBanned && styles.bannedCard]}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.detail}>Email: {item.email}</Text>
        <Text style={styles.detail}>Role: {item.role}</Text>
        <Text style={[styles.status, { color: item.isBanned ? 'red' : 'green' }]}> 
          {item.isBanned ? 'BANNED' : 'ACTIVE'}
        </Text>
        {item.isBanned && <Text style={styles.banNote}>Tài khoản đã bị BAN</Text>}
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản Lý Người Dùng</Text>

      {/* Filter theo role */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {roleFilters.map((role) => (
          <Chip
            key={role.value}
            selected={selectedRole === role.value}
            onPress={() => setSelectedRole(role.value as any)}
            style={[
              styles.categoryChip,
              selectedRole === role.value && styles.categoryChipSelected
            ]}
            textStyle={[
              styles.categoryChipText,
              selectedRole === role.value && styles.categoryChipTextSelected
            ]}
            icon={selectedRole === role.value ? 'check' : undefined}
          >
            {role.label}
          </Chip>
        ))}
      </ScrollView>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Modal hiển thị chi tiết */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              {selectedUser && (
                <>
                  <Image source={{ uri: selectedUser.avatar }} style={styles.modalAvatar} />
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
                  {selectedUser.role === 'staff' && selectedUser.storeId && (
                    <View style={styles.detailBlock}>
                      <Text style={styles.label}>Store:</Text>
                      <Text style={styles.value}>{selectedUser.storeId}</Text>
                    </View>
                  )}

                  {selectedUser.role !== 'admin' && (
                    <TouchableOpacity
                      onPress={() => toggleUserStatus(selectedUser)}
                      style={[
                        styles.actionButton,
                        { backgroundColor: selectedUser.isBanned ? 'green' : 'red' },
                      ]}
                    >
                      <Text style={styles.actionText}>
                        {selectedUser.role === 'user'
                          ? selectedUser.isBanned
                            ? 'Unban'
                            : 'Ban'
                          : selectedUser.isBanned
                          ? 'Mở Khóa'
                          : 'Khóa'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
                    <Text style={styles.closeText}>Đóng</Text>
                  </Pressable>
                </>
              )}
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
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  filterContainer: {
    marginBottom: 10,
    paddingBottom: 10,
    paddingTop: 5,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
  },
  bannedCard: {
    opacity: 0.4,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#eee',
  },
  info: {
    marginLeft: 14,
    flex: 1,
  },
  username: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  detail: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
  },
  status: {
    fontWeight: '600',
    marginTop: 4,
  },
  banNote: {
    marginTop: 6,
    fontSize: 14,
    color: 'red',
    fontWeight: 'bold',
  },
  categoryChip: {
    marginRight: 10,
    height: 36,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  categoryChipSelected: {
    backgroundColor: '#007AFF',
  },
  categoryChipText: {
    color: '#007AFF',
    fontWeight: '500',
    fontSize: 14,
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignSelf: 'center',
    maxHeight: '80%',
    elevation: 5,
  },
  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#eee',
  },
  modalName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
  },
  // Added missing styles below
  detailBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
    width: 90,
    fontSize: 15,
  },
  value: {
    flex: 1,
    color: '#222',
    fontSize: 15,
  },
  actionButton: {
    marginTop: 18,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 18,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#ccc',
  },
  closeText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
})

export default ManageUsers
