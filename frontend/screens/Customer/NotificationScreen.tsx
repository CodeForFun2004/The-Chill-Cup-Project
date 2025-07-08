import type React from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  type ListRenderItem,
  Image,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useSelector, useDispatch } from "react-redux"
import type { CustomerStackParamList } from "../../navigation/customer/CustomerStackNavigator"
import type { Notification } from "../../data/notifications"
import { markAsRead, markAllAsRead, setActiveFilter } from "../../redux/slices/notificationSlice"

// Types
type FilterType = "all" | "order" | "promotion"

type NotificationScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList, "Notifications">

interface NotificationScreenProps {
  navigation: NotificationScreenNavigationProp
}

// RootState type (bạn cần định nghĩa này trong store)
interface RootState {
  notification: {
    notifications: Notification[]
    unreadCount: number
    activeFilter: FilterType
  }
}

const NotificationScreen: React.FC<NotificationScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch()
  const { notifications, unreadCount, activeFilter } = useSelector((state: RootState) => state.notification)

  // Filter options với tiếng Việt
  const filterOptions: { key: FilterType; title: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: "all", title: "Tất cả", icon: "notifications-outline" },
    { key: "order", title: "Đơn hàng", icon: "receipt-outline" },
    { key: "promotion", title: "Khuyến mãi", icon: "pricetag-outline" },
  ]

  // Get filtered notifications
  const getFilteredNotifications = (): Notification[] => {
    if (activeFilter === "all") {
      return notifications
    }
    return notifications.filter((notif) => notif.type === activeFilter)
  }

  // Get notification style based on type
  const getNotificationStyle = (type: Notification["type"]) => {
    switch (type) {
      case "order":
        return {
          icon: "receipt",
          color: "#10B981", // Emerald-500
          bgColor: "#D1FAE5", // Emerald-100
          lightBg: "#ECFDF5", // Emerald-50
        }
      case "promotion":
        return {
          icon: "pricetag",
          color: "#059669", // Emerald-600
          bgColor: "#A7F3D0", // Emerald-200
          lightBg: "#F0FDF4", // Emerald-50
        }
      default:
        return {
          icon: "notifications",
          color: "#6B7280",
          bgColor: "#F3F4F6",
          lightBg: "#F9FAFB",
        }
    }
  }

  // Handle notification tap
  const handleNotificationPress = (notification: Notification) => {
    dispatch(markAsRead(notification.id))

    switch (notification.actionType) {
      case "track_order":
        // Navigate to order tracking với mock order data
        const mockOrder = {
          id: notification.orderNumber?.replace("#", "") || "1",
          orderNumber: notification.orderNumber || "#ORD-001",
          date: notification.timestamp.split(" ")[0],
          time: notification.timestamp.split(" ")[1] + " " + notification.timestamp.split(" ")[2],
          status: "Preparing" as const,
          total: 15.5,
          items: [
            { name: "Cappuccino", quantity: 1, price: 5.5 },
            { name: "Bánh sừng bò", quantity: 1, price: 4.0 },
          ],
          estimatedDelivery: "15 phút",
          deliveryAddress: "123 Đường Cà Phê, Thành phố Brew",
        }
        navigation.navigate("OrderTracking", { order: mockOrder })
        break
      case "view_promotion":
        // Navigate to promotions/menu screen (placeholder)
        console.log("Điều hướng đến khuyến mãi:", notification.promotionCode)
        break
      default:
        break
    }
  }

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead())
  }

  // Handle filter change
  const handleFilterChange = (filter: FilterType) => {
    dispatch(setActiveFilter(filter))
  }

  // Get count for each filter
  const getFilterCount = (filterKey: FilterType): number => {
    if (filterKey === "all") {
      return notifications.length
    }
    return notifications.filter((notif) => notif.type === filterKey).length
  }

  const renderFilterTab = (filter: { key: FilterType; title: string; icon: keyof typeof Ionicons.glyphMap }) => {
    const isActive = activeFilter === filter.key
    const count = getFilterCount(filter.key)

    return (
      <TouchableOpacity
        key={filter.key}
        style={[styles.filterTab, isActive && styles.activeFilterTab]}
        onPress={() => handleFilterChange(filter.key)}
        activeOpacity={0.7}
      >
        <Ionicons name={filter.icon} size={18} color={isActive ? "#10B981" : "#6B7280"} />
        <Text style={[styles.filterTabText, { color: isActive ? "#10B981" : "#6B7280" }]}>{filter.title}</Text>
        {count > 0 && (
          <View style={[styles.filterBadge, { backgroundColor: isActive ? "#10B981" : "#6B7280" }]}>
            <Text style={styles.filterBadgeText}>{count}</Text>
          </View>
        )}
      </TouchableOpacity>
    )
  }

  const renderNotificationItem: ListRenderItem<Notification> = ({ item }) => {
    const style = getNotificationStyle(item.type)

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          !item.isRead && { backgroundColor: style.lightBg, borderLeftColor: style.color },
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          {/* Icon */}
          <View style={[styles.notificationIcon, { backgroundColor: style.bgColor }]}>
            <Ionicons name={style.icon as any} size={22} color={style.color} />
          </View>

          {/* Content */}
          <View style={styles.notificationText}>
            <View style={styles.notificationHeader}>
              <Text style={[styles.notificationTitle, !item.isRead && styles.unreadTitle]}>{item.title}</Text>
              {!item.isRead && <View style={styles.unreadDot} />}
            </View>

            <Text style={styles.notificationMessage} numberOfLines={2}>
              {item.message}
            </Text>

            {/* Promotion Code */}
            {item.promotionCode && (
              <View style={styles.promotionCodeContainer}>
                <Text style={styles.promotionCodeLabel}>Mã:</Text>
                <View style={styles.promotionCodeBadge}>
                  <Text style={styles.promotionCodeText}>{item.promotionCode}</Text>
                </View>
              </View>
            )}

            <Text style={styles.notificationTime}>{item.timeAgo}</Text>
          </View>

          {/* Action Arrow */}
          {item.actionType !== "none" && (
            <View style={styles.actionContainer}>
              <Ionicons name="chevron-forward" size={18} color="#10B981" />
            </View>
          )}
        </View>

        {/* Promotion Image */}
        {item.image && item.type === "promotion" && (
          <View style={styles.promotionImageContainer}>
            <Image source={{ uri: item.image }} style={styles.promotionImage} />
            {item.discount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>GIẢM {item.discount}</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    )
  }

  const filteredNotifications = getFilteredNotifications()

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Thông báo</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton} disabled={unreadCount === 0}>
          <Text style={[styles.markAllText, { color: unreadCount > 0 ? "#10B981" : "#9CA3AF" }]}>Đánh dấu</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <View style={styles.filterTabs}>{filterOptions.map(renderFilterTab)}</View>
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="notifications-off-outline" size={64} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyTitle}>Không có thông báo</Text>
            <Text style={styles.emptySubtitle}>
              Bạn đã xem hết rồi! Thông báo mới về đơn hàng và ưu đãi đặc biệt sẽ xuất hiện ở đây.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  headerBadge: {
    backgroundColor: "#EF4444",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    paddingHorizontal: 8,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  markAllButton: {
    padding: 8,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
  // Filter Tabs
  filterContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 16,
  },
  filterTabs: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    position: "relative",
  },
  activeFilterTab: {
    backgroundColor: "#ECFDF5",
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  filterBadge: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Notifications List
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  notificationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: "transparent",
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    flex: 1,
  },
  unreadTitle: {
    fontWeight: "600",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 8,
  },
  promotionCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  promotionCodeLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginRight: 6,
  },
  promotionCodeBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  promotionCodeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  notificationTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  actionContainer: {
    padding: 4,
  },
  // Promotion Image
  promotionImageContainer: {
    marginTop: 12,
    position: "relative",
  },
  promotionImage: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 32,
  },
})

export default NotificationScreen
